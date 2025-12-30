// Static data imports - no database required
import standingsData from "./staticData/standings.json";
import recordsData from "./staticData/records.json";
import draftPositionsData from "./staticData/draftPositions.json";
import matchupsData from "./staticData/matchups.json";
import yearsData from "./staticData/years.json";

export interface TeamRecord {
  team: string;
  owner?: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  playoffAppearances: number;
  championships: number;
  seasons: number;
}

export interface YearlyStanding {
  year: number;
  team: string;
  owner?: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  playoffResult?:
    | "Champion"
    | "Runner-up"
    | "Semi-finals"
    | "Quarter-finals"
    | "Missed";
}

export interface DraftPosition {
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

export const leagueName = process.env.NEXT_PUBLIC_LEAGUE_NAME || "Fantasy Football League";

// Type the imported data
const standings = standingsData as YearlyStanding[];
const records = recordsData as { owner: string; wins: number; losses: number; ties: number; pointsFor: number; pointsAgainst: number; playoffAppearances: number; championships: number; seasons: number }[];
const draftPositions = draftPositionsData as DraftPosition[];
const matchups = matchupsData as Matchup[];
const years = yearsData as number[];

export async function getCumulativeRecords(): Promise<TeamRecord[]> {
  return records.map((r) => ({
    team: r.owner,
    owner: r.owner,
    wins: r.wins,
    losses: r.losses,
    ties: r.ties,
    pointsFor: r.pointsFor,
    pointsAgainst: r.pointsAgainst,
    playoffAppearances: r.playoffAppearances,
    championships: r.championships,
    seasons: r.seasons,
  }));
}

export async function getYearlyStandings(
  year?: number
): Promise<YearlyStanding[]> {
  if (year) {
    return standings.filter((s) => s.year === year);
  }
  return standings;
}

export async function getDraftPositions(): Promise<DraftPosition[]> {
  return draftPositions;
}

export async function getAvailableYears(): Promise<number[]> {
  return years;
}

export interface WeeklyPerformance {
  week: number;
  teamId: number;
  teamName: string;
  ownerName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsScored: number;
}

export interface YearlySuperlatives {
  year: number;
  highestPointsFor: { team: string; owner: string; value: number };
  highestPointsAgainst: { team: string; owner: string; value: number };
  highestSingleWeekScore: {
    team: string;
    owner: string;
    week: number;
    value: number;
  };
  lowestSingleWeekScore: {
    team: string;
    owner: string;
    week: number;
    value: number;
  };
  longestWinStreak: { team: string; owner: string; value: number };
  longestLoseStreak: { team: string; owner: string; value: number };
  biggestBlowout: {
    winner: string;
    loser: string;
    week: number;
    margin: number;
  };
  closestGame: { team1: string; team2: string; week: number; margin: number };
  bestRecord: {
    team: string;
    owner: string;
    wins: number;
    losses: number;
    ties: number;
  };
  worstRecord: {
    team: string;
    owner: string;
    wins: number;
    losses: number;
    ties: number;
  };
  mostPointsInWeek: { week: number; totalPoints: number };
  leastPointsInWeek: { week: number; totalPoints: number };
}

function calculateStreaks(
  seasonMatchups: Matchup[],
  teamName: string
): { winStreak: number; lossStreak: number } {
  const teamGames = seasonMatchups
    .filter((m) => m.homeTeam === teamName || m.awayTeam === teamName)
    .sort((a, b) => a.week - b.week);

  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  for (const game of teamGames) {
    const isHome = game.homeTeam === teamName;
    const teamScore = isHome ? game.homeScore : game.awayScore;
    const oppScore = isHome ? game.awayScore : game.homeScore;

    if (teamScore > oppScore) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else if (teamScore < oppScore) {
      currentLossStreak++;
      currentWinStreak = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    } else {
      currentWinStreak = 0;
      currentLossStreak = 0;
    }
  }

  return { winStreak: maxWinStreak, lossStreak: maxLossStreak };
}

export async function getYearlySuperlatives(
  year: number
): Promise<YearlySuperlatives | null> {
  const seasonStandings = standings.filter((s) => s.year === year);
  const seasonMatchups = matchups.filter((m) => m.season === year);

  if (seasonStandings.length === 0) return null;

  // Highest/Lowest points for/against
  const sortedByPF = [...seasonStandings].sort((a, b) => b.pointsFor - a.pointsFor);
  const sortedByPA = [...seasonStandings].sort((a, b) => b.pointsAgainst - a.pointsAgainst);

  // Best/worst record
  const sortedByWinPct = [...seasonStandings].sort((a, b) => {
    const aWinPct = a.wins / (a.wins + a.losses + a.ties || 1);
    const bWinPct = b.wins / (b.wins + b.losses + b.ties || 1);
    return bWinPct - aWinPct;
  });

  // Single week scores
  const weekScores: { team: string; owner: string; week: number; score: number }[] = [];
  for (const m of seasonMatchups) {
    weekScores.push({ team: m.homeTeam, owner: m.homeOwner, week: m.week, score: m.homeScore });
    weekScores.push({ team: m.awayTeam, owner: m.awayOwner, week: m.week, score: m.awayScore });
  }
  weekScores.sort((a, b) => b.score - a.score);

  // Game margins
  const gameMargins = seasonMatchups
    .filter((m) => m.homeScore !== m.awayScore)
    .map((m) => ({
      winner: m.homeScore > m.awayScore ? m.homeTeam : m.awayTeam,
      loser: m.homeScore > m.awayScore ? m.awayTeam : m.homeTeam,
      week: m.week,
      margin: Math.abs(m.homeScore - m.awayScore),
      team1: m.homeTeam,
      team2: m.awayTeam,
    }))
    .sort((a, b) => b.margin - a.margin);

  // Weekly totals
  const weeklyTotals = new Map<number, number>();
  for (const m of seasonMatchups) {
    const current = weeklyTotals.get(m.week) || 0;
    weeklyTotals.set(m.week, current + m.homeScore + m.awayScore);
  }
  const sortedWeeklyTotals = Array.from(weeklyTotals.entries()).sort((a, b) => b[1] - a[1]);

  // Win/loss streaks
  const teamStreaks = new Map<string, { team: string; owner: string; winStreak: number; lossStreak: number }>();
  for (const standing of seasonStandings) {
    const streaks = calculateStreaks(seasonMatchups, standing.team);
    teamStreaks.set(standing.team, {
      team: standing.team,
      owner: standing.owner || "",
      winStreak: streaks.winStreak,
      lossStreak: streaks.lossStreak,
    });
  }
  const longestWin = Array.from(teamStreaks.values()).sort((a, b) => b.winStreak - a.winStreak)[0];
  const longestLoss = Array.from(teamStreaks.values()).sort((a, b) => b.lossStreak - a.lossStreak)[0];

  const highestWeek = weekScores[0];
  const lowestWeek = weekScores[weekScores.length - 1];
  const biggestBlowout = gameMargins[0];
  const closestGame = gameMargins[gameMargins.length - 1];
  const mostPointsWeek = sortedWeeklyTotals[0];
  const leastPointsWeek = sortedWeeklyTotals[sortedWeeklyTotals.length - 1];

  return {
    year,
    highestPointsFor: {
      team: sortedByPF[0].team,
      owner: sortedByPF[0].owner || "",
      value: sortedByPF[0].pointsFor,
    },
    highestPointsAgainst: {
      team: sortedByPA[0].team,
      owner: sortedByPA[0].owner || "",
      value: sortedByPA[0].pointsAgainst,
    },
    highestSingleWeekScore: {
      team: highestWeek.team,
      owner: highestWeek.owner,
      week: highestWeek.week,
      value: highestWeek.score,
    },
    lowestSingleWeekScore: {
      team: lowestWeek.team,
      owner: lowestWeek.owner,
      week: lowestWeek.week,
      value: lowestWeek.score,
    },
    longestWinStreak: {
      team: longestWin.team,
      owner: longestWin.owner,
      value: longestWin.winStreak,
    },
    longestLoseStreak: {
      team: longestLoss.team,
      owner: longestLoss.owner,
      value: longestLoss.lossStreak,
    },
    biggestBlowout: {
      winner: biggestBlowout.winner,
      loser: biggestBlowout.loser,
      week: biggestBlowout.week,
      margin: biggestBlowout.margin,
    },
    closestGame: {
      team1: closestGame.team1,
      team2: closestGame.team2,
      week: closestGame.week,
      margin: closestGame.margin,
    },
    bestRecord: {
      team: sortedByWinPct[0].team,
      owner: sortedByWinPct[0].owner || "",
      wins: sortedByWinPct[0].wins,
      losses: sortedByWinPct[0].losses,
      ties: sortedByWinPct[0].ties,
    },
    worstRecord: {
      team: sortedByWinPct[sortedByWinPct.length - 1].team,
      owner: sortedByWinPct[sortedByWinPct.length - 1].owner || "",
      wins: sortedByWinPct[sortedByWinPct.length - 1].wins,
      losses: sortedByWinPct[sortedByWinPct.length - 1].losses,
      ties: sortedByWinPct[sortedByWinPct.length - 1].ties,
    },
    mostPointsInWeek: {
      week: mostPointsWeek[0],
      totalPoints: mostPointsWeek[1],
    },
    leastPointsInWeek: {
      week: leastPointsWeek[0],
      totalPoints: leastPointsWeek[1],
    },
  };
}

export interface HallOfFameData {
  bestRecord: Array<{
    team: string;
    owner: string;
    year: number;
    wins: number;
    losses: number;
    ties: number;
    winPct: number;
  }>;
  mostPointsInWeek: Array<{
    team: string;
    owner: string;
    year: number;
    week: number;
    value: number;
  }>;
  highestPPG: Array<{
    team: string;
    owner: string;
    year: number;
    value: number;
    gamesPlayed: number;
  }>;
  longestWinStreak: Array<{
    team: string;
    owner: string;
    year: number;
    value: number;
  }>;
  biggestBlowout: Array<{
    winner: string;
    loser: string;
    year: number;
    week: number;
    margin: number;
  }>;
  mostChampionships: Array<{
    owner: string;
    championships: number;
    years: number[];
  }>;
  worstRecord: Array<{
    team: string;
    owner: string;
    year: number;
    wins: number;
    losses: number;
    ties: number;
    winPct: number;
  }>;
  lowestWeekScore: Array<{
    team: string;
    owner: string;
    year: number;
    week: number;
    value: number;
  }>;
  longestLoseStreak: Array<{
    team: string;
    owner: string;
    year: number;
    value: number;
  }>;
}

export async function getHallOfFame(): Promise<HallOfFameData> {
  // Best record by win percentage
  const recordsWithPct = standings.map((s) => ({
    ...s,
    winPct: s.wins / (s.wins + s.losses + s.ties || 1),
  }));
  const maxWinPct = Math.max(...recordsWithPct.map((r) => r.winPct));
  const bestRecords = recordsWithPct
    .filter((r) => r.winPct === maxWinPct)
    .map((r) => ({
      team: r.team,
      owner: r.owner || "",
      year: r.year,
      wins: r.wins,
      losses: r.losses,
      ties: r.ties,
      winPct: r.winPct,
    }));

  // Worst record
  const minWinPct = Math.min(...recordsWithPct.map((r) => r.winPct));
  const worstRecords = recordsWithPct
    .filter((r) => r.winPct === minWinPct)
    .map((r) => ({
      team: r.team,
      owner: r.owner || "",
      year: r.year,
      wins: r.wins,
      losses: r.losses,
      ties: r.ties,
      winPct: r.winPct,
    }));

  // Single week scores
  const weekScores: { team: string; owner: string; year: number; week: number; score: number }[] = [];
  for (const m of matchups) {
    weekScores.push({ team: m.homeTeam, owner: m.homeOwner, year: m.season, week: m.week, score: m.homeScore });
    weekScores.push({ team: m.awayTeam, owner: m.awayOwner, year: m.season, week: m.week, score: m.awayScore });
  }
  const maxWeekScore = Math.max(...weekScores.map((w) => w.score));
  const minWeekScore = Math.min(...weekScores.map((w) => w.score));
  const mostPointsInWeek = weekScores
    .filter((w) => w.score === maxWeekScore)
    .map((w) => ({ team: w.team, owner: w.owner, year: w.year, week: w.week, value: w.score }));
  const lowestWeekScore = weekScores
    .filter((w) => w.score === minWeekScore)
    .map((w) => ({ team: w.team, owner: w.owner, year: w.year, week: w.week, value: w.score }));

  // PPG by season
  const ppgByTeamSeason = new Map<string, { team: string; owner: string; year: number; totalPoints: number; games: number }>();
  for (const m of matchups) {
    const homeKey = `${m.homeTeam}-${m.season}`;
    const awayKey = `${m.awayTeam}-${m.season}`;

    const homeData = ppgByTeamSeason.get(homeKey) || { team: m.homeTeam, owner: m.homeOwner, year: m.season, totalPoints: 0, games: 0 };
    homeData.totalPoints += m.homeScore;
    homeData.games += 1;
    ppgByTeamSeason.set(homeKey, homeData);

    const awayData = ppgByTeamSeason.get(awayKey) || { team: m.awayTeam, owner: m.awayOwner, year: m.season, totalPoints: 0, games: 0 };
    awayData.totalPoints += m.awayScore;
    awayData.games += 1;
    ppgByTeamSeason.set(awayKey, awayData);
  }
  const ppgRecords = Array.from(ppgByTeamSeason.values())
    .filter((p) => p.games >= 10)
    .map((p) => ({ ...p, ppg: p.totalPoints / p.games }));
  const maxPPG = Math.max(...ppgRecords.map((p) => p.ppg));
  const highestPPG = ppgRecords
    .filter((p) => p.ppg === maxPPG)
    .map((p) => ({ team: p.team, owner: p.owner, year: p.year, value: p.ppg, gamesPlayed: p.games }));

  // Win/loss streaks by season
  const streaksByTeamSeason: { team: string; owner: string; year: number; winStreak: number; lossStreak: number }[] = [];
  for (const year of years) {
    const seasonMatchups = matchups.filter((m) => m.season === year);
    const seasonStandings = standings.filter((s) => s.year === year);
    for (const standing of seasonStandings) {
      const streaks = calculateStreaks(seasonMatchups, standing.team);
      streaksByTeamSeason.push({
        team: standing.team,
        owner: standing.owner || "",
        year,
        winStreak: streaks.winStreak,
        lossStreak: streaks.lossStreak,
      });
    }
  }
  const maxWinStreak = Math.max(...streaksByTeamSeason.map((s) => s.winStreak));
  const maxLossStreak = Math.max(...streaksByTeamSeason.map((s) => s.lossStreak));
  const longestWinStreak = streaksByTeamSeason
    .filter((s) => s.winStreak === maxWinStreak)
    .map((s) => ({ team: s.team, owner: s.owner, year: s.year, value: s.winStreak }));
  const longestLoseStreak = streaksByTeamSeason
    .filter((s) => s.lossStreak === maxLossStreak)
    .map((s) => ({ team: s.team, owner: s.owner, year: s.year, value: s.lossStreak }));

  // Biggest blowouts
  const blowouts = matchups
    .filter((m) => m.homeScore !== m.awayScore)
    .map((m) => ({
      winner: m.homeScore > m.awayScore ? m.homeTeam : m.awayTeam,
      loser: m.homeScore > m.awayScore ? m.awayTeam : m.homeTeam,
      year: m.season,
      week: m.week,
      margin: Math.abs(m.homeScore - m.awayScore),
    }));
  const maxMargin = Math.max(...blowouts.map((b) => b.margin));
  const biggestBlowout = blowouts.filter((b) => b.margin === maxMargin);

  // Championships
  const championshipsByOwner = new Map<string, { owner: string; championships: number; years: number[] }>();
  for (const standing of standings) {
    if (standing.playoffResult === "Champion" && standing.owner) {
      const existing = championshipsByOwner.get(standing.owner);
      if (existing) {
        existing.championships += 1;
        existing.years.push(standing.year);
      } else {
        championshipsByOwner.set(standing.owner, {
          owner: standing.owner,
          championships: 1,
          years: [standing.year],
        });
      }
    }
  }
  const maxChampionships = Math.max(...Array.from(championshipsByOwner.values()).map((c) => c.championships));
  const mostChampionships = Array.from(championshipsByOwner.values())
    .filter((c) => c.championships === maxChampionships)
    .map((c) => ({ ...c, years: c.years.sort((a, b) => a - b) }));

  return {
    bestRecord: bestRecords,
    mostPointsInWeek,
    highestPPG,
    longestWinStreak,
    biggestBlowout,
    mostChampionships,
    worstRecord: worstRecords,
    lowestWeekScore,
    longestLoseStreak,
  };
}

export interface LeagueChampion {
  year: number;
  teamName: string;
  ownerName: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  pointsFor: number;
  pointsAgainst: number;
}

export async function getLeagueChampions(): Promise<LeagueChampion[]> {
  return standings
    .filter((s) => s.playoffResult === "Champion")
    .map((s) => ({
      year: s.year,
      teamName: s.team,
      ownerName: s.owner || "",
      record: {
        wins: s.wins,
        losses: s.losses,
        ties: s.ties,
      },
      pointsFor: s.pointsFor,
      pointsAgainst: s.pointsAgainst,
    }))
    .sort((a, b) => b.year - a.year);
}

export async function getSeasonPerformance(
  season: number
): Promise<WeeklyPerformance[]> {
  const seasonMatchups = matchups.filter((m) => m.season === season);
  const results: WeeklyPerformance[] = [];

  // Get unique teams for this season
  const teamsInSeason = new Map<string, { teamName: string; ownerName: string }>();
  for (const m of seasonMatchups) {
    teamsInSeason.set(m.homeTeam, { teamName: m.homeTeam, ownerName: m.homeOwner });
    teamsInSeason.set(m.awayTeam, { teamName: m.awayTeam, ownerName: m.awayOwner });
  }

  // Get weeks
  const weeks = [...new Set(seasonMatchups.map((m) => m.week))].sort((a, b) => a - b);

  // Calculate cumulative stats for each team at each week
  let teamId = 1;
  for (const [teamName, teamInfo] of teamsInSeason) {
    const currentTeamId = teamId++;
    let cumulativeWins = 0;
    let cumulativeLosses = 0;
    let cumulativeTies = 0;

    for (const week of weeks) {
      const weekMatchup = seasonMatchups.find(
        (m) => m.week === week && (m.homeTeam === teamName || m.awayTeam === teamName)
      );

      if (!weekMatchup) continue;

      const isHome = weekMatchup.homeTeam === teamName;
      const teamScore = isHome ? weekMatchup.homeScore : weekMatchup.awayScore;
      const oppScore = isHome ? weekMatchup.awayScore : weekMatchup.homeScore;

      if (teamScore > oppScore) {
        cumulativeWins++;
      } else if (teamScore < oppScore) {
        cumulativeLosses++;
      } else {
        cumulativeTies++;
      }

      results.push({
        week,
        teamId: currentTeamId,
        teamName: teamInfo.teamName,
        ownerName: teamInfo.ownerName,
        wins: cumulativeWins,
        losses: cumulativeLosses,
        ties: cumulativeTies,
        pointsScored: teamScore,
      });
    }
  }

  return results.sort((a, b) => {
    if (a.week !== b.week) return a.week - b.week;
    return a.teamId - b.teamId;
  });
}
