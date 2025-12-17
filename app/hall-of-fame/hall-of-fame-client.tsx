'use client'

import { HallOfFameData } from '@/lib/data'

interface HallOfFameClientProps {
  data: HallOfFameData
}

export default function HallOfFameClient({ data }: HallOfFameClientProps) {
  const HallOfFameCard = ({ title, icon, children, className = "" }: {
    title: string
    icon?: string
    children: React.ReactNode
    className?: string
  }) => (
    <div className={`bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
        {icon && <span className="text-3xl">{icon}</span>}
        {title}
      </h3>
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Hall of Fame</h1>
        <p className="text-gray-600 dark:text-gray-400">
          All-time records across all seasons
        </p>
      </div>

      {/* Hall of Fame Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Legendary Achievements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Best Record */}
          <HallOfFameCard title="Best Record" icon="👑" className="border-2 border-yellow-400">
            <div className="space-y-3">
              {data.bestRecord.map((record, idx) => (
                <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-200 dark:border-gray-600" : ""}>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {record.wins}-{record.losses}
                    {record.ties > 0 && `-${record.ties}`}
                  </div>
                  <div className="text-lg font-semibold">{record.owner}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {record.team}
                  </div>
                  <div className="text-sm">
                    {record.year} Season • {(record.winPct * 100).toFixed(1)}% Win Rate
                  </div>
                </div>
              ))}
            </div>
          </HallOfFameCard>

          {/* Most Points In Single Week */}
          <HallOfFameCard title="Most Points In Single Week" icon="🚀" className="border-2 border-blue-400">
            <div className="space-y-3">
              {data.mostPointsInWeek.map((record, idx) => (
                <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-200 dark:border-gray-600" : ""}>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {record.value.toFixed(2)} pts
                  </div>
                  <div className="text-lg font-semibold">{record.owner}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {record.team}
                  </div>
                  <div className="text-sm">{record.year} • Week {record.week}</div>
                </div>
              ))}
            </div>
          </HallOfFameCard>

          {/* Highest Points Per Game */}
          <HallOfFameCard title="Highest Points Per Game" icon="📊" className="border-2 border-green-400">
            <div className="space-y-3">
              {data.highestPPG.map((record, idx) => (
                <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-200 dark:border-gray-600" : ""}>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {record.value.toFixed(2)} ppg
                  </div>
                  <div className="text-lg font-semibold">{record.owner}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {record.team}
                  </div>
                  <div className="text-sm">{record.year} Season • {record.gamesPlayed} games</div>
                </div>
              ))}
            </div>
          </HallOfFameCard>

          {/* Longest Win Streak */}
          <HallOfFameCard title="Longest Win Streak" icon="🔥" className="border-2 border-orange-400">
            <div className="space-y-3">
              {data.longestWinStreak.map((record, idx) => (
                <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-200 dark:border-gray-600" : ""}>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {record.value} games
                  </div>
                  <div className="text-lg font-semibold">{record.owner}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {record.team}
                  </div>
                  <div className="text-sm">{record.year} Season</div>
                </div>
              ))}
            </div>
          </HallOfFameCard>

          {/* Biggest Blowout */}
          <HallOfFameCard title="Biggest Blowout" icon="💥" className="border-2 border-red-400">
            <div className="space-y-3">
              {data.biggestBlowout.map((record, idx) => (
                <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-200 dark:border-gray-600" : ""}>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {record.margin.toFixed(2)} pts
                  </div>
                  <div className="text-sm font-semibold">
                    {record.winner}
                  </div>
                  <div className="text-sm">defeated</div>
                  <div className="text-sm font-semibold">
                    {record.loser}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {record.year} • Week {record.week}
                  </div>
                </div>
              ))}
            </div>
          </HallOfFameCard>

          {/* Most Championships */}
          <HallOfFameCard title="Most Championships" icon="🏆" className="border-2 border-purple-400">
            <div className="space-y-3">
              {data.mostChampionships.length === 1 ? (
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {data.mostChampionships[0].championships}
                    {data.mostChampionships[0].championships === 1 ? ' Title' : ' Titles'}
                  </div>
                  <div className="text-lg font-semibold">{data.mostChampionships[0].owner}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Years: {data.mostChampionships[0].years.join(', ')}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {data.mostChampionships[0].championships} Titles Each
                  </div>
                  {data.mostChampionships.map((record, idx) => (
                    <div key={idx} className={idx > 0 ? "pt-2 border-t border-gray-200 dark:border-gray-600" : ""}>
                      <div className="text-lg font-semibold">{record.owner}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {record.years.join(', ')}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </HallOfFameCard>
        </div>
      </div>

      {/* Hall of Shame Section */}
      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Hall of Shame
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Records that shall live in infamy...
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Worst Record */}
          <HallOfFameCard title="Worst Record" icon="😭" className="bg-gray-100 dark:bg-gray-800">
            <div className="space-y-3">
              {data.worstRecord.map((record, idx) => (
                <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-400 dark:border-gray-600" : ""}>
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {record.wins}-{record.losses}
                    {record.ties > 0 && `-${record.ties}`}
                  </div>
                  <div className="text-lg font-semibold">{record.owner}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {record.team}
                  </div>
                  <div className="text-sm">
                    {record.year} Season • {(record.winPct * 100).toFixed(1)}% Win Rate
                  </div>
                </div>
              ))}
            </div>
          </HallOfFameCard>

          {/* Lowest Week Score */}
          <HallOfFameCard title="Lowest Week Score" icon="📉" className="bg-gray-100 dark:bg-gray-800">
            <div className="space-y-3">
              {data.lowestWeekScore.map((record, idx) => (
                <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-400 dark:border-gray-600" : ""}>
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {record.value.toFixed(2)} pts
                  </div>
                  <div className="text-lg font-semibold">{record.owner}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {record.team}
                  </div>
                  <div className="text-sm">
                    {record.year} • Week {record.week}
                  </div>
                </div>
              ))}
            </div>
          </HallOfFameCard>

          {/* Longest Losing Streak */}
          <HallOfFameCard title="Longest Losing Streak" icon="❄️" className="bg-gray-100 dark:bg-gray-800">
            <div className="space-y-3">
              {data.longestLoseStreak.map((record, idx) => (
                <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-400 dark:border-gray-600" : ""}>
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {record.value} games
                  </div>
                  <div className="text-lg font-semibold">{record.owner}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {record.team}
                  </div>
                  <div className="text-sm">{record.year} Season</div>
                </div>
              ))}
            </div>
          </HallOfFameCard>
        </div>
      </div>
    </div>
  )
}