import { leagueName, getLeagueChampions } from '@/lib/data'
import TrophyCard from '@/components/TrophyCard'

export default async function Home() {
  const champions = await getLeagueChampions();



  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent title-text">
          {leagueName}
        </h1>
        <div className="space-y-6">
          {champions.length > 0 && (
            <div>
              <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg p-6 text-center">
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
              <div className="grid gap-6 mt-6">
                {(() => {
                  const latestYear = Math.max(...champions.map(c => c.year))
                  return champions.map((champion) => (
                    <TrophyCard key={champion.year} champion={champion} defaultOpen={champion.year === latestYear} />
                  ))
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}