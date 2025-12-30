import { leagueName, getAvailableYears, getYearlyStandings, FinishingPosition, getLeagueChampions, LeagueChampion } from '@/lib/data'

export default async function Home() {
  const years = await getAvailableYears();

  const firstYear = years[years.length - 1];
  const totalSeasons = years.length;
  const mostRecentYear = years[0];

  const standings = await getYearlyStandings(mostRecentYear);
  const currentChampion = standings.find(s => s.playoffResult === FinishingPosition.CHAMPION);

  const champions = await getLeagueChampions();

  const TrophyCard = ({ champion, index }: { champion: LeagueChampion; index: number }) => {
    const cardClass = "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-lg"

    return (
      <div className={`rounded-lg p-6 transition-all duration-200 hover:shadow-2xl ${cardClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              {'🏆'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {champion.year} Champion
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Season {champion.year}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {champion.ownerName}
            </h4>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {champion.teamName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Record</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {champion.record.wins}-{champion.record.losses}
                {champion.record.ties > 0 && `-${champion.record.ties}`}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {((champion.record.wins / (champion.record.wins + champion.record.losses + champion.record.ties)) * 100).toFixed(1)}% Win Rate
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Point Differential</div>
              <div className={`text-lg font-bold ${(champion.pointsFor - champion.pointsAgainst) > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
                }`}>
                {(champion.pointsFor - champion.pointsAgainst) > 0 ? '+' : ''}
                {(champion.pointsFor - champion.pointsAgainst).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {((champion.pointsFor - champion.pointsAgainst) / (champion.record.wins + champion.record.losses + champion.record.ties)).toFixed(2)} ppg
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Points For</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {champion.pointsFor.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {(champion.pointsFor / (champion.record.wins + champion.record.losses + champion.record.ties)).toFixed(2)} ppg
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Points Against</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {champion.pointsAgainst.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {(champion.pointsAgainst / (champion.record.wins + champion.record.losses + champion.record.ties)).toFixed(2)} ppg
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent title-text">
          {leagueName}
        </h1>
        <div className="space-y-6">
          {champions.length > 0 && (
            <div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  League Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">Total Seasons</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {champions.length}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">First Season</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.min(...champions.map(c => c.year))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">Latest Season</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.max(...champions.map(c => c.year))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-6">
                {champions.map((champion, index) => (
                  <TrophyCard key={champion.year} champion={champion} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}