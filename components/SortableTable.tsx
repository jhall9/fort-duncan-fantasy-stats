'use client'

import { useState, useMemo } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export interface Column<T> {
  key: keyof T | string
  header: string
  accessor?: (row: T) => any
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

interface SortableTableProps<T> {
  data: T[]
  columns: Column<T>[]
  defaultSortKey?: string
  defaultSortDirection?: 'asc' | 'desc'
  rowKey: (row: T) => string | number
  className?: string
}

export default function SortableTable<T>({
  data,
  columns,
  defaultSortKey,
  defaultSortDirection = 'asc',
  rowKey,
  className = ''
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey) return data

    const column = columns.find(col =>
      typeof col.key === 'string' ? col.key === sortKey : false
    )

    if (!column) return data

    return [...data].sort((a, b) => {
      const aValue = column.accessor ? column.accessor(a) : (a as any)[column.key]
      const bValue = column.accessor ? column.accessor(b) : (b as any)[column.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortKey, sortDirection, columns])

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) {
      return (
        <span className="ml-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
          <ChevronUpIcon className="h-3 w-3 inline-block" />
          <ChevronDownIcon className="h-3 w-3 inline-block -ml-1" />
        </span>
      )
    }

    return (
      <span className="ml-2">
        {sortDirection === 'asc' ? (
          <ChevronUpIcon className="h-4 w-4 inline-block" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 inline-block" />
        )}
      </span>
    )
  }

  return (
    <table className={`min-w-full bg-white dark:bg-dark-surface rounded-lg shadow overflow-hidden ${className}`}>
      <thead className="bg-gray-100 dark:bg-dark-border">
        <tr>
          {columns.map((column) => {
            const key = typeof column.key === 'string' ? column.key : String(column.key)
            const isSortable = column.sortable !== false

            return (
              <th
                key={key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                  isSortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 group transition-colors' : ''
                }`}
                onClick={isSortable ? () => handleSort(key) : undefined}
              >
                <div className="flex items-center">
                  {column.header}
                  {isSortable && <SortIcon columnKey={key} />}
                </div>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
        {sortedData.map((row) => (
          <tr key={rowKey(row)} className="hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
            {columns.map((column) => {
              const key = typeof column.key === 'string' ? column.key : String(column.key)
              const value = column.accessor ? column.accessor(row) : (row as any)[column.key]

              return (
                <td key={key} className="px-6 py-4 whitespace-nowrap text-sm">
                  {column.render ? column.render(value, row) : value}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}