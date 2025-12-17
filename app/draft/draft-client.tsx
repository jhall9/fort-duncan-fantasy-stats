'use client'

import { useState, useMemo } from 'react'
import { DraftPosition } from '@/lib/data'
import SortableTable, { Column } from '@/components/SortableTable'

interface DraftClientProps {
  draftPositions: DraftPosition[]
  years: number[]
}

export default function DraftClient({ draftPositions, years }: DraftClientProps) {
  const [selectedYear, setSelectedYear] = useState(years[0])

  const yearDraft = draftPositions
    .filter(d => d.year === selectedYear)
    .sort((a, b) => a.position - b.position)

  const allYearsSummary = () => {
    const ownerAverages = new Map<string, { positions: number[], finalRanks: number[] }>()

    draftPositions.forEach(dp => {
      if (!ownerAverages.has(dp.owner)) {
        ownerAverages.set(dp.owner, { positions: [], finalRanks: [] })
      }
      const data = ownerAverages.get(dp.owner)!
      data.positions.push(dp.position)
      if (dp.finalRank) {
        data.finalRanks.push(dp.finalRank)
      }
    })

    return Array.from(ownerAverages.entries())
      .map(([owner, data]) => ({
        owner,
        avgPosition: data.positions.reduce((a, b) => a + b, 0) / data.positions.length,
        avgFinalRank: data.finalRanks.length > 0
          ? data.finalRanks.reduce((a, b) => a + b, 0) / data.finalRanks.length
          : null,
        bestPick: Math.min(...data.positions),
        worstPick: Math.max(...data.positions),
        yearsPlayed: data.positions.length
      }))
      .sort((a, b) => a.avgPosition - b.avgPosition)
  }

  const [showSummary, setShowSummary] = useState(false)
  const summary = allYearsSummary()

  const yearDraftWithBadges = useMemo(() => {
    return yearDraft.map(draft => ({
      ...draft,
      positionDisplay: draft.position
    }))
  }, [yearDraft])

  const yearColumns: Column<typeof yearDraftWithBadges[0]>[] = [
    {
      key: 'position',
      header: 'Pick #',
      render: (value) => (
        <span className="flex items-center font-medium">
          #{value}
          {value === 1 && <span className="text-yellow-500 ml-2">👑</span>}
          {value > 1 && value <= 3 && <span className="text-blue-500 ml-2">⭐</span>}
        </span>
      )
    },
    {
      key: 'team',
      header: 'Team'
    },
    {
      key: 'owner',
      header: 'Manager'
    },
    {
      key: 'finalRank',
      header: 'Final Rank',
      render: (value) => value ? `#${value}` : '-'
    }
  ]

  const summaryColumns: Column<typeof summary[0]>[] = [
    {
      key: 'owner',
      header: 'Manager',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'avgPosition',
      header: 'Avg Pick',
      render: (value) => value.toFixed(1)
    },
    {
      key: 'avgFinalRank',
      header: 'Avg Finish',
      render: (value) => value ? value.toFixed(1) : '-'
    },
    {
      key: 'bestPick',
      header: 'Best Pick',
      render: (value) => `#${value}`
    },
    {
      key: 'worstPick',
      header: 'Worst Pick',
      render: (value) => `#${value}`
    },
    {
      key: 'yearsPlayed',
      header: 'Years Played'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Draft Positions</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            {showSummary ? 'View by Year' : 'View Summary'}
          </button>
          {!showSummary && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year} Draft
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {showSummary ? (
          <SortableTable
            data={summary}
            columns={summaryColumns}
            defaultSortKey="avgPosition"
            defaultSortDirection="asc"
            rowKey={(row) => row.owner}
          />
        ) : (
          <SortableTable
            data={yearDraftWithBadges}
            columns={yearColumns}
            defaultSortKey="position"
            defaultSortDirection="asc"
            rowKey={(row) => row.team}
          />
        )}
      </div>
    </div>
  )
}