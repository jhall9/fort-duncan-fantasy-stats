'use client'

export default function CurrentSeasonClient() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">{currentYear} Season</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Current season in progress
        </p>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">🏈</div>
          <h2 className="text-2xl font-semibold mb-4">Season in Progress</h2>
          <p className="text-lg">
            This page will be populated with current season data as it becomes available.
          </p>
        </div>
      </div>
    </div>
  )
}