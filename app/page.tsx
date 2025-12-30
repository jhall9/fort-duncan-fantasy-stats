import { leagueName, getAvailableYears, getYearlyStandings, FinishingPosition } from '@/lib/data'

export default async function Home() {
  const years = await getAvailableYears();

  const firstYear = years[years.length - 1];
  const totalSeasons = years.length;
  const mostRecentYear = years[0];

  const standings = await getYearlyStandings(mostRecentYear);
  const currentChampion = standings.find(s => s.playoffResult === FinishingPosition.CHAMPION);
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {leagueName}
        </h1>
        
        <p className="text-2xl text-gray-600 dark:text-gray-300">
          Est. {firstYear} • {totalSeasons} Seasons
        </p>

        {currentChampion && (
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Current Champion: <span className="font-semibold">{currentChampion.owner}</span>, {currentChampion.team} ({currentChampion.year})
          </p>
        )}

        
        {/* Hiding for time being */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Championships</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track championship wins across all seasons
            </p>
          </div>
          
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-xl font-semibold mb-2">Historical Stats</h3>
            <p className="text-gray-600 dark:text-gray-300">
              View cumulative records and performance metrics
            </p>
          </div>
          
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-2">📈</div>
            <h3 className="text-xl font-semibold mb-2">Yearly Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Explore standings and draft positions by year
            </p>
          </div>
        </div> */}
        
        <div className="mt-12">
          <p >
            Navigate using the menu above to explore league history
          </p>
        </div>
      </div>
    </div>
  )
}