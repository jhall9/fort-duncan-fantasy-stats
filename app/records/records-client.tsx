'use client'

import { useMemo } from 'react'
import { TeamRecord } from '@/lib/data'
import SortableTable, { Column } from '@/components/SortableTable'

interface RecordsClientProps {
  records: TeamRecord[]
}

export default function RecordsClient({ records }: RecordsClientProps) {
  const dataWithStats = useMemo(() => {
    return records.map((record, index) => ({
      ...record,
      rank: index + 1,
      winPct: record.wins / (record.wins + record.losses + record.ties),
      wlt: `${record.wins}-${record.losses}-${record.ties}`
    }))
  }, [records])

  const columns: Column<typeof dataWithStats[0]>[] = [
    {
      key: 'rank',
      header: 'Rank',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'team',
      header: 'Manager',
      render: (value) => <span className="font-medium">{value}</span>
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
      key: 'championships',
      header: 'Championships',
      render: (value) => (
        <span className="flex items-center">
          {value > 0 && (
            <>
              <span className="text-yellow-500 mr-1">🏆</span>
              {value}
            </>
          )}
          {value === 0 && '-'}
        </span>
      )
    },
    {
      key: 'seasons',
      header: 'Seasons'
    }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Cumulative Records</h1>
      <p className="text-gray-600 dark:text-gray-300">
        All-time records across all seasons
      </p>

      <div className="overflow-x-auto">
        <SortableTable
          data={dataWithStats}
          columns={columns}
          defaultSortKey="winPct"
          defaultSortDirection="desc"
          rowKey={(row) => row.team}
        />
      </div>
    </div>
  )
}