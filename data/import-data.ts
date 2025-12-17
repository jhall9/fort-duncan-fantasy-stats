import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import pg from "pg";

const { Client } = pg;

// Database connection configuration
const dbConfig = {
  host: "localhost",
  port: 5432,
  database: "XXXXX",
  user: "postgres",
  password: "XXXXX",
};

interface Member {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

interface Team {
  id: number;
  name: string;
  primaryOwner?: string;
  owners?: string[];
  record?: {
    overall?: {
      wins: number;
      losses: number;
      ties: number;
      pointsFor: number;
      pointsAgainst: number;
    };
  };
  rankFinal?: number;
  rankCalculatedFinal?: number;
  playoffSeed?: number;
  draftDayProjectedRank?: number;
}

interface MatchupTeam {
  teamId: number;
  totalPoints: number;
  adjustment?: number;
  gamesPlayed?: number;
  pointsByScoringPeriod?: Record<string, number>;
}

interface Matchup {
  id: number;
  matchupPeriodId: number;
  home?: MatchupTeam;
  away?: MatchupTeam;
  playoffTierType?: string;
  winner?: string;
}

interface YearlyData {
  members: Member[];
  teams: Team[];
  schedule?: Matchup[];
  settings?: {
    draftSettings?: {
      pickOrder?: number[];
    };
  };
}

async function loadJsonFiles(): Promise<Map<number, YearlyData>> {
  const dataDir = join(__dirname, "yearlyExports");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const yearlyData = new Map<number, YearlyData>();

  for (const file of files) {
    const year = parseInt(file.replace(".json", ""));
    const content = readFileSync(join(dataDir, file), "utf-8");
    const parsed = JSON.parse(content);

    // Handle different JSON formats
    // Older years are arrays, newer years are objects
    const data = Array.isArray(parsed) ? parsed[0] : parsed;

    yearlyData.set(year, data);
  }

  return yearlyData;
}

async function importOwners(
  client: pg.Client,
  yearlyData: Map<number, YearlyData>
) {
  console.log("Importing owners...");
  const owners = new Map<string, Member>();

  // Collect unique owners from all years
  for (const [year, data] of yearlyData) {
    for (const member of data.members || []) {
      if (!owners.has(member.id)) {
        owners.set(member.id, member);
      }
    }
  }

  // Insert owners
  for (const owner of owners.values()) {
    await client.query(
      `INSERT INTO ff.owners (id, display_name, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
       SET display_name = EXCLUDED.display_name`,
      [owner.id, owner.displayName, owner.firstName, owner.lastName]
    );
  }

  console.log(`Imported ${owners.size} owners`);
}

async function importTeamsAndRecords(
  client: pg.Client,
  yearlyData: Map<number, YearlyData>
) {
  console.log("Importing teams and records...");

  for (const [year, data] of yearlyData) {
    console.log(
      `Processing year ${year}: found ${data.teams?.length || 0} teams`
    );

    for (const team of data.teams || []) {
      // Get owner ID
      const ownerId = team.primaryOwner || team.owners?.[0];
      if (!ownerId) {
        console.log(`  Skipping team ${team.name} - no owner found`);
        continue;
      }

      // Get record data
      const record = team.record?.overall;
      const finalRank = team.rankFinal || team.rankCalculatedFinal;

      // Insert team
      await client.query(
        `INSERT INTO ff.teams (
          season, team_name, owner_id, wins, losses, ties,
          points_for, points_against, final_standing,
          made_playoffs, playoff_finish
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          year,
          team.name || `Team ${team.id}`,
          ownerId,
          record?.wins || 0,
          record?.losses || 0,
          record?.ties || 0,
          record?.pointsFor || 0,
          record?.pointsAgainst || 0,
          finalRank,
          team.playoffSeed != null,
          finalRank === 1 ? 1 : null,
        ]
      );
    }
  }

  console.log(`Imported teams for ${yearlyData.size} seasons`);
}

async function importDraftOrder(
  client: pg.Client,
  yearlyData: Map<number, YearlyData>
) {
  console.log("Importing draft order...");

  for (const [year, data] of yearlyData) {
    // Get team IDs for this season
    const result = await client.query(
      "SELECT id, team_name FROM ff.teams WHERE season = $1",
      [year]
    );

    const teamMapping = new Map<string, number>();
    for (const row of result.rows) {
      teamMapping.set(row.team_name, row.id);
    }

    // Check if we have pickOrder array (older format)
    const pickOrder = data.settings?.draftSettings?.pickOrder;

    if (pickOrder && pickOrder.length > 0) {
      // Use pickOrder array - team.id corresponds to position in array
      for (const team of data.teams || []) {
        const teamName = team.name || `Team ${team.id}`;
        const teamId = teamMapping.get(teamName);

        // Find this team's position in the draft order
        const draftPosition = pickOrder.indexOf(team.id) + 1;

        if (teamId && draftPosition > 0) {
          await client.query(
            `INSERT INTO ff.draft_order (season, team_id, draft_position)
             VALUES ($1, $2, $3)
             ON CONFLICT (season, team_id) DO UPDATE
             SET draft_position = EXCLUDED.draft_position`,
            [year, teamId, draftPosition]
          );
        }
      }
    } else {
      // Use draftDayProjectedRank (newer format)
      for (const team of data.teams || []) {
        const teamName = team.name || `Team ${team.id}`;
        const teamId = teamMapping.get(teamName);

        if (
          teamId &&
          team.draftDayProjectedRank &&
          team.draftDayProjectedRank > 0
        ) {
          await client.query(
            `INSERT INTO ff.draft_order (season, team_id, draft_position)
             VALUES ($1, $2, $3)
             ON CONFLICT (season, team_id) DO UPDATE
             SET draft_position = EXCLUDED.draft_position`,
            [year, teamId, team.draftDayProjectedRank]
          );
        }
      }
    }
  }

  console.log("Imported draft orders");
}

async function importMatchups(
  client: pg.Client,
  yearlyData: Map<number, YearlyData>
) {
  console.log("Importing matchups...");
  let totalMatchups = 0;

  for (const [year, data] of yearlyData) {
    // Create mapping of ESPN team IDs to team names
    const espnIdToName = new Map<number, string>();
    for (const team of data.teams || []) {
      espnIdToName.set(team.id, team.name || `Team ${team.id}`);
    }

    // Get team mapping from database for this season
    const result = await client.query(
      "SELECT id, team_name FROM ff.teams WHERE season = $1",
      [year]
    );

    const teamNameToDbId = new Map<string, number>();
    for (const row of result.rows) {
      teamNameToDbId.set(row.team_name, row.id);
    }

    // Process schedule/matchups
    const schedule = data.schedule || [];
    let seasonMatchups = 0;

    for (const matchup of schedule) {
      const homeTeam = matchup.home;
      const awayTeam = matchup.away;

      // Skip bye weeks or incomplete matchups
      if (!homeTeam || !awayTeam) {
        continue;
      }

      // Get ESPN team IDs
      const homeEspnId = homeTeam.teamId;
      const awayEspnId = awayTeam.teamId;

      // Skip if team IDs are missing
      if (homeEspnId === undefined || awayEspnId === undefined) {
        continue;
      }

      // Get team names from ESPN ID mapping
      const homeName = espnIdToName.get(homeEspnId);
      const awayName = espnIdToName.get(awayEspnId);

      // Get database IDs from team names
      const homeDbId = homeName ? teamNameToDbId.get(homeName) : undefined;
      const awayDbId = awayName ? teamNameToDbId.get(awayName) : undefined;

      if (homeDbId && awayDbId) {
        // Determine playoff status
        const playoffType = matchup.playoffTierType || "NONE";
        const isPlayoff = playoffType !== "NONE";
        const isChampionship =
          playoffType === "CHAMPIONSHIP" ||
          (playoffType === "WINNERS_BRACKET" && matchup.matchupPeriodId >= 15);

        try {
          await client.query(
            `INSERT INTO ff.matchups (
              season, week, home_team_id, away_team_id,
              home_score, away_score, is_playoff, is_championship
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (season, week, home_team_id, away_team_id) DO UPDATE
            SET home_score = EXCLUDED.home_score,
                away_score = EXCLUDED.away_score,
                is_playoff = EXCLUDED.is_playoff,
                is_championship = EXCLUDED.is_championship`,
            [
              year,
              matchup.matchupPeriodId,
              homeDbId,
              awayDbId,
              homeTeam.totalPoints || 0,
              awayTeam.totalPoints || 0,
              isPlayoff,
              isChampionship,
            ]
          );
          seasonMatchups++;
        } catch (error) {
          console.error(
            `  Error inserting matchup for week ${matchup.matchupPeriodId}:`,
            error
          );
        }
      } else {
        // Log teams that couldn't be matched
        if (homeName && !homeDbId) {
          console.log(
            `  Warning: Could not find team '${homeName}' in database for ${year}`
          );
        }
        if (awayName && !awayDbId) {
          console.log(
            `  Warning: Could not find team '${awayName}' in database for ${year}`
          );
        }
      }
    }

    if (seasonMatchups > 0) {
      console.log(`  Imported ${seasonMatchups} matchups for ${year} season`);
      totalMatchups += seasonMatchups;
    }
  }

  console.log(`Total matchups imported: ${totalMatchups}`);
}

async function main() {
  const client = new Client(dbConfig);

  try {
    // Load JSON files
    console.log("Loading JSON files...");
    const yearlyData = await loadJsonFiles();
    console.log(`Loaded data for ${yearlyData.size} seasons`);

    // Connect to database
    await client.connect();
    console.log("Connected to database");

    // Import data in order
    // await importOwners(client, yearlyData);
    // await importTeamsAndRecords(client, yearlyData);
    // await importDraftOrder(client, yearlyData);
    await importMatchups(client, yearlyData);

    console.log("\nImport completed successfully!");
  } catch (error) {
    console.error("Error during import:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the import
main().catch(console.error);
