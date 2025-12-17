import { leagueName, getAvailableYears, getCumulativeRecords } from '@/lib/data'

export default async function Home() {
  const [years, records] = await Promise.all([
    getAvailableYears(),
    getCumulativeRecords()
  ])

  const firstYear = years[years.length - 1]
  const totalSeasons = years.length
  const currentChampion = records.find(r => r.championships > 0 && r.championships === Math.max(...records.map(r => r.championships)))
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {leagueName}
        </h1>
        
        <p className="text-2xl text-gray-600 dark:text-gray-300">
          Est. {firstYear} • {totalSeasons} Seasons
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
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
        </div>
        
        <div className="mt-12">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Navigate using the menu above to explore league history
          </p>
        </div>
      </div>
    </div>
  )
}