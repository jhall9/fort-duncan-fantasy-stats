'use client'

import { useState, useMemo } from 'react'
import { YearlyStanding } from '@/lib/data'
import SortableTable, { Column } from '@/components/SortableTable'

interface StandingsClientProps {
  yearlyStandings: YearlyStanding[]
  years: number[]
}

export default function StandingsClient({ yearlyStandings, years }: StandingsClientProps) {
  const [selectedYear, setSelectedYear] = useState(years[0])

  const yearStandings = useMemo(() => {
    return yearlyStandings
      .filter(s => s.year === selectedYear)
      .map(standing => ({
        ...standing,
        winPct: standing.wins / (standing.wins + standing.losses + standing.ties),
        wlt: `${standing.wins}-${standing.losses}-${standing.ties}`
      }))
  }, [yearlyStandings, selectedYear])

  const getPlayoffBadge = (result?: string) => {
    if (!result || result === 'Missed') return null

    const badges = {
      'Champion': '🏆 Champion',
      'Runner-up': '🥈 Runner-up',
      'Semi-finals': '🥉 Semi-finals',
      'Quarter-finals': 'Playoffs'
    }

    const colors = {
      'Champion': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Runner-up': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'Semi-finals': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Quarter-finals': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[result as keyof typeof colors]}`}>
        {badges[result as keyof typeof badges]}
      </span>
    )
  }

  const columns: Column<typeof yearStandings[0]>[] = [
    {
      key: 'rank',
      header: 'Rank',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'team',
      header: 'Team',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'owner',
      header: 'Manager'
    },
    {
      key: 'wlt',
      header: 'W-L-T',
      accessor: (row) => row.wlt
    },
    {
      key: 'winPct',
      header: 'Win %',
      render: (value) => `${(value * 100).toFixed(1)}%`
    },
    {
      key: 'wins',
      header: 'Wins'
    },
    {
      key: 'losses',
      header: 'Losses'
    },
    {
      key: 'ties',
      header: 'Ties'
    },
    {
      key: 'pointsFor',
      header: 'Points For',
      render: (value) => value.toLocaleString()
    },
    {
      key: 'pointsAgainst',
      header: 'Points Against',
      render: (value) => value.toLocaleString()
    },
    {
      key: 'playoffResult',
      header: 'Playoff Result',
      render: (value) => getPlayoffBadge(value) || '-'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Standings by Year</h1>
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

      <div className="overflow-x-auto">
        <SortableTable
          data={yearStandings}
          columns={columns}
          defaultSortKey="rank"
          defaultSortDirection="asc"
          rowKey={(row) => row.team}
        />
      </div>
    </div>
  )
}