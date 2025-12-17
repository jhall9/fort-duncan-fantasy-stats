'use client'

import { useState } from 'react'
import { YearlySuperlatives } from '@/lib/data'

interface SuperlativesClientProps {
  years: number[]
  initialYear: number
  allData: Record<number, YearlySuperlatives | null>
}

export default function SuperlativesClient({ years, initialYear, allData }: SuperlativesClientProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear)

  const superlatives = allData[selectedYear]

  if (!superlatives) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Season Superlatives</h1>
        <div className="text-gray-500">No data available for this season</div>
      </div>
    )
  }

  const StatCard = ({ title, children, icon }: { title: string; children: React.ReactNode; icon?: string }) => (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
        {icon && <span className="text-2xl">{icon}</span>}
        {title}
      </h3>
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Season Superlatives</h1>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year} Season
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Season Records */}
        <StatCard title="Best Record" icon="🏆">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {superlatives.bestRecord.wins}-{superlatives.bestRecord.losses}
              {superlatives.bestRecord.ties > 0 && `-${superlatives.bestRecord.ties}`}
            </div>
            <div className="text-sm">{superlatives.bestRecord.owner}</div>
            <div className="text-xs text-gray-500">{superlatives.bestRecord.team}</div>
          </div>
        </StatCard>

        <StatCard title="Worst Record" icon="😢">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {superlatives.worstRecord.wins}-{superlatives.worstRecord.losses}
              {superlatives.worstRecord.ties > 0 && `-${superlatives.worstRecord.ties}`}
            </div>
            <div className="text-sm">{superlatives.worstRecord.owner}</div>
            <div className="text-xs text-gray-500">{superlatives.worstRecord.team}</div>
          </div>
        </StatCard>

        {/* Points Records */}
        <StatCard title="Most Points For" icon="📈">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.highestPointsFor.value.toLocaleString()}</div>
            <div className="text-sm">{superlatives.highestPointsFor.owner}</div>
            <div className="text-xs text-gray-500">{superlatives.highestPointsFor.team}</div>
          </div>
        </StatCard>

        <StatCard title="Most Points Against" icon="🎯">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.highestPointsAgainst.value.toLocaleString()}</div>
            <div className="text-sm">{superlatives.highestPointsAgainst.owner}</div>
            <div className="text-xs text-gray-500">{superlatives.highestPointsAgainst.team}</div>
          </div>
        </StatCard>

        {/* Single Week Records */}
        <StatCard title="Highest Week Score" icon="🚀">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.highestSingleWeekScore.value.toFixed(2)}</div>
            <div className="text-sm">{superlatives.highestSingleWeekScore.owner}</div>
            <div className="text-xs text-gray-500">
              Week {superlatives.highestSingleWeekScore.week} • {superlatives.highestSingleWeekScore.team}
            </div>
          </div>
        </StatCard>

        <StatCard title="Lowest Week Score" icon="📉">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.lowestSingleWeekScore.value.toFixed(2)}</div>
            <div className="text-sm">{superlatives.lowestSingleWeekScore.owner}</div>
            <div className="text-xs text-gray-500">
              Week {superlatives.lowestSingleWeekScore.week} • {superlatives.lowestSingleWeekScore.team}
            </div>
          </div>
        </StatCard>

        {/* Streaks */}
        <StatCard title="Longest Win Streak" icon="🔥">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.longestWinStreak.value} games</div>
            <div className="text-sm">{superlatives.longestWinStreak.owner}</div>
            <div className="text-xs text-gray-500">{superlatives.longestWinStreak.team}</div>
          </div>
        </StatCard>

        <StatCard title="Longest Losing Streak" icon="❄️">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.longestLoseStreak.value} games</div>
            <div className="text-sm">{superlatives.longestLoseStreak.owner}</div>
            <div className="text-xs text-gray-500">{superlatives.longestLoseStreak.team}</div>
          </div>
        </StatCard>

        {/* Game Margins */}
        <StatCard title="Biggest Blowout" icon="💥">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.biggestBlowout.margin.toFixed(2)} pts</div>
            <div className="text-sm">
              {superlatives.biggestBlowout.winner} def. {superlatives.biggestBlowout.loser}
            </div>
            <div className="text-xs text-gray-500">Week {superlatives.biggestBlowout.week}</div>
          </div>
        </StatCard>

        <StatCard title="Closest Game" icon="🤏">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.closestGame.margin.toFixed(2)} pts</div>
            <div className="text-sm">
              {superlatives.closestGame.team1} vs {superlatives.closestGame.team2}
            </div>
            <div className="text-xs text-gray-500">Week {superlatives.closestGame.week}</div>
          </div>
        </StatCard>

        {/* Weekly Totals */}
        <StatCard title="Highest Scoring Week" icon="⚡">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.mostPointsInWeek.totalPoints.toFixed(2)} pts</div>
            <div className="text-sm">Week {superlatives.mostPointsInWeek.week}</div>
            <div className="text-xs text-gray-500">Combined total from all games</div>
          </div>
        </StatCard>

        <StatCard title="Lowest Scoring Week" icon="🐌">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{superlatives.leastPointsInWeek.totalPoints.toFixed(2)} pts</div>
            <div className="text-sm">Week {superlatives.leastPointsInWeek.week}</div>
            <div className="text-xs text-gray-500">Combined total from all games</div>
          </div>
        </StatCard>
      </div>
    </div>
  )
}
