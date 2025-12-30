import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Types matching the app's data.ts interfaces
interface Owner {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

interface TeamRecord {
  owner: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  championships: number;
  seasons: number;
}

interface YearlyStanding {
  year: number;
  team: string;
  owner: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  playoffResult: "Champion" | "Runner-up" | "Semi-finals" | "Quarter-finals" | "Missed";
}

interface DraftPosition {
  year: number;
  team: string;
  owner: string;
  position: number;
  finalRank?: number;
}

interface Matchup {
  season: number;
  week: number;
  homeTeam: string;
  awayTeam: string;
  homeOwner: string;
  awayOwner: string;
  homeScore: number;
  awayScore: number;
  isPlayoff: boolean;
  isChampionship: boolean;
}

// ESPN data types
interface EspnMember {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

interface EspnTeam {
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

interface EspnMatchupTeam {
  teamId: number;
  totalPoints: number;
}

interface EspnMatchup {
  matchupPeriodId: number;
  home?: EspnMatchupTeam;
  away?: EspnMatchupTeam;
  playoffTierType?: string;
}

interface EspnYearlyData {
  members: EspnMember[];
  teams: EspnTeam[];
  schedule?: EspnMatchup[];
  settings?: {
    draftSettings?: {
      pickOrder?: number[];
    };
  };
}

function loadEspnData(): Map<number, EspnYearlyData> {
  const dataDir = join(__dirname, "yearlyExports");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const yearlyData = new Map<number, EspnYearlyData>();

  for (const file of files) {
    const year = parseInt(file.replace(".json", ""));
    const content = readFileSync(join(dataDir, file), "utf-8");
    const parsed = JSON.parse(content);
    const data = Array.isArray(parsed) ? parsed[0] : parsed;
    yearlyData.set(year, data);
  }

  return yearlyData;
}

function extractOwners(yearlyData: Map<number, EspnYearlyData>): Map<string, Owner> {
  const owners = new Map<string, Owner>();

  for (const [, data] of yearlyData) {
    for (const member of data.members || []) {
      if (!owners.has(member.id)) {
        owners.set(member.id, {
          id: member.id,
          displayName: member.displayName,
          firstName: member.firstName || "",
          lastName: member.lastName || "",
        });
      }
    }
  }

  return owners;
}

function getOwnerName(owners: Map<string, Owner>, ownerId: string): string {
  const owner = owners.get(ownerId);
  if (!owner) return "Unknown";
  if (owner.firstName && owner.lastName) {
    return `${owner.firstName} ${owner.lastName}`;
  }
  return owner.displayName;
}

function extractYearlyStandings(
  yearlyData: Map<number, EspnYearlyData>,
  owners: Map<string, Owner>
): YearlyStanding[] {
  const standings: YearlyStanding[] = [];

  for (const [year, data] of yearlyData) {
    for (const team of data.teams || []) {
      const ownerId = team.primaryOwner || team.owners?.[0];
      if (!ownerId) continue;

      const record = team.record?.overall;
      const finalRank = team.rankFinal || team.rankCalculatedFinal || 0;

      let playoffResult: YearlyStanding["playoffResult"] = "Missed";
      if (finalRank === 1) {
        playoffResult = "Champion";
      } else if (finalRank === 2) {
        playoffResult = "Runner-up";
      } else if (team.playoffSeed != null && team.playoffSeed > 0 && team.playoffSeed <= 6) {
        playoffResult = "Quarter-finals";
      }

      standings.push({
        year,
        team: team.name || `Team ${team.id}`,
        owner: getOwnerName(owners, ownerId),
        rank: finalRank,
        wins: record?.wins || 0,
        losses: record?.losses || 0,
        ties: record?.ties || 0,
        pointsFor: record?.pointsFor || 0,
        pointsAgainst: record?.pointsAgainst || 0,
        playoffResult,
      });
    }
  }

  return standings.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.rank - b.rank;
  });
}

function extractCumulativeRecords(standings: YearlyStanding[]): TeamRecord[] {
  const recordsByOwner = new Map<string, TeamRecord>();

  for (const standing of standings) {
    const existing = recordsByOwner.get(standing.owner);
    if (existing) {
      existing.wins += standing.wins;
      existing.losses += standing.losses;
      existing.ties += standing.ties;
      existing.pointsFor += standing.pointsFor;
      existing.pointsAgainst += standing.pointsAgainst;
      existing.seasons += 1;
      if (standing.playoffResult === "Champion") {
        existing.championships += 1;
      }
    } else {
      recordsByOwner.set(standing.owner, {
        owner: standing.owner,
        wins: standing.wins,
        losses: standing.losses,
        ties: standing.ties,
        pointsFor: standing.pointsFor,
        pointsAgainst: standing.pointsAgainst,
        championships: standing.playoffResult === "Champion" ? 1 : 0,
        seasons: 1,
      });
    }
  }

  return Array.from(recordsByOwner.values()).sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });
}

function extractDraftPositions(
  yearlyData: Map<number, EspnYearlyData>,
  owners: Map<string, Owner>
): DraftPosition[] {
  const positions: DraftPosition[] = [];

  for (const [year, data] of yearlyData) {
    const pickOrder = data.settings?.draftSettings?.pickOrder;

    for (const team of data.teams || []) {
      const ownerId = team.primaryOwner || team.owners?.[0];
      if (!ownerId) continue;

      let draftPosition = 0;
      if (pickOrder && pickOrder.length > 0) {
        draftPosition = pickOrder.indexOf(team.id) + 1;
      } else if (team.draftDayProjectedRank && team.draftDayProjectedRank > 0) {
        draftPosition = team.draftDayProjectedRank;
      }

      if (draftPosition > 0) {
        const finalRank = team.rankFinal || team.rankCalculatedFinal;
        positions.push({
          year,
          team: team.name || `Team ${team.id}`,
          owner: getOwnerName(owners, ownerId),
          position: draftPosition,
          finalRank: finalRank || undefined,
        });
      }
    }
  }

  return positions.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.position - b.position;
  });
}

function extractMatchups(
  yearlyData: Map<number, EspnYearlyData>,
  owners: Map<string, Owner>
): Matchup[] {
  const matchups: Matchup[] = [];

  for (const [year, data] of yearlyData) {
    // Build ESPN team ID to team info mapping
    const espnIdToTeam = new Map<number, { name: string; ownerId: string }>();
    for (const team of data.teams || []) {
      const ownerId = team.primaryOwner || team.owners?.[0];
      if (ownerId) {
        espnIdToTeam.set(team.id, {
          name: team.name || `Team ${team.id}`,
          ownerId,
        });
      }
    }

    for (const matchup of data.schedule || []) {
      if (!matchup.home || !matchup.away) continue;

      const homeTeam = espnIdToTeam.get(matchup.home.teamId);
      const awayTeam = espnIdToTeam.get(matchup.away.teamId);

      if (!homeTeam || !awayTeam) continue;

      const playoffType = matchup.playoffTierType || "NONE";
      const isPlayoff = playoffType !== "NONE";
      const isChampionship =
        playoffType === "CHAMPIONSHIP" ||
        (playoffType === "WINNERS_BRACKET" && matchup.matchupPeriodId >= 15);

      matchups.push({
        season: year,
        week: matchup.matchupPeriodId,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeOwner: getOwnerName(owners, homeTeam.ownerId),
        awayOwner: getOwnerName(owners, awayTeam.ownerId),
        homeScore: matchup.home.totalPoints || 0,
        awayScore: matchup.away.totalPoints || 0,
        isPlayoff,
        isChampionship,
      });
    }
  }

  return matchups.sort((a, b) => {
    if (a.season !== b.season) return b.season - a.season;
    return a.week - b.week;
  });
}

function main() {
  console.log("Loading ESPN export data...");
  const yearlyData = loadEspnData();
  console.log(`Loaded data for ${yearlyData.size} seasons`);

  console.log("Extracting owners...");
  const owners = extractOwners(yearlyData);
  console.log(`Found ${owners.size} unique owners`);

  console.log("Extracting yearly standings...");
  const standings = extractYearlyStandings(yearlyData, owners);
  console.log(`Extracted ${standings.length} standings records`);

  console.log("Calculating cumulative records...");
  const records = extractCumulativeRecords(standings);
  console.log(`Calculated records for ${records.length} owners`);

  console.log("Extracting draft positions...");
  const draftPositions = extractDraftPositions(yearlyData, owners);
  console.log(`Extracted ${draftPositions.length} draft positions`);

  console.log("Extracting matchups...");
  const matchups = extractMatchups(yearlyData, owners);
  console.log(`Extracted ${matchups.length} matchups`);

  // Get available years
  const availableYears = Array.from(yearlyData.keys()).sort((a, b) => b - a);

  // Create output directory
  const outputDir = join(__dirname, "..", "lib", "staticData");
  mkdirSync(outputDir, { recursive: true });

  // Write JSON files
  console.log("\nWriting JSON files...");

  writeFileSync(
    join(outputDir, "standings.json"),
    JSON.stringify(standings, null, 2)
  );
  console.log(`  standings.json (${standings.length} records)`);

  writeFileSync(
    join(outputDir, "records.json"),
    JSON.stringify(records, null, 2)
  );
  console.log(`  records.json (${records.length} records)`);

  writeFileSync(
    join(outputDir, "draftPositions.json"),
    JSON.stringify(draftPositions, null, 2)
  );
  console.log(`  draftPositions.json (${draftPositions.length} records)`);

  writeFileSync(
    join(outputDir, "matchups.json"),
    JSON.stringify(matchups, null, 2)
  );
  console.log(`  matchups.json (${matchups.length} records)`);

  writeFileSync(
    join(outputDir, "years.json"),
    JSON.stringify(availableYears, null, 2)
  );
  console.log(`  years.json (${availableYears.length} years)`);

  console.log("\nExport completed successfully!");
  console.log(`Output directory: ${outputDir}`);
}

main();
