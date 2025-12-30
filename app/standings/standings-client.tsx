'use client'

import { useState, useMemo } from 'react'
import { FinishingPosition, YearlyStanding } from '@/lib/data'
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

  const getPlayoffBadge = (result?: string, rank?: number) => {
    if (!result || result === FinishingPosition.MISSED) return null;
    if (!rank) {
      return null;
    }

    const standardPlayoffBadge = {
          //add emoji badge for generic playoff finishes
      'badge': '🎖️ Playoffs',
      'color': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }

    const medalistBadges = {
      1: {
        'badge': '🏆 Champion',
        'color': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      },
      2: {
        'badge': '🥈 Second',
        'color': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      },
      3: {
        'badge': '🥉 Third',
        'color': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      }
    }

    let badgeToUse = standardPlayoffBadge;
    if (rank in medalistBadges) {
      badgeToUse = medalistBadges[rank as keyof typeof medalistBadges];
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeToUse.color}`}>
        {badgeToUse.badge}
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
      render: (value, row) => getPlayoffBadge(value, row.rank) || '-'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Final Standings by Year</h1>
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