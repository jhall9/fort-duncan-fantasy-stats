'use client'

import { useState, useMemo } from 'react'
import { WeeklyPerformance } from '@/lib/data'

interface PerformanceClientProps {
  years: number[]
  initialYear: number
  allData: Record<number, WeeklyPerformance[]>
}

export default function PerformanceClient({ years, initialYear, allData }: PerformanceClientProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null)

  const performanceData = allData[selectedYear] || []

  // Process data for the graph
  const chartData = useMemo(() => {
    if (!performanceData.length) return { teams: [], weeks: [], maxWins: 0 }

    const weeks = [...new Set(performanceData.map(p => p.week))].sort((a, b) => a - b)
    const teamsMap = new Map<number, {
      id: number
      name: string
      owner: string
      initials: string
      color: string
      data: Array<{ week: number; wins: number }>
    }>()

    // Define colors for teams
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
    ]

    performanceData.forEach(p => {
      if (!teamsMap.has(p.teamId)) {
        const nameParts = p.ownerName.split(' ')
        const initials = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        teamsMap.set(p.teamId, {
          id: p.teamId,
          name: p.teamName,
          owner: p.ownerName,
          initials,
          color: colors[teamsMap.size % colors.length],
          data: []
        })
      }

      const team = teamsMap.get(p.teamId)!
      team.data.push({ week: p.week, wins: p.wins })
    })

    const teams = Array.from(teamsMap.values())
    const maxWins = Math.max(...performanceData.map(p => p.wins))

    return { teams, weeks, maxWins }
  }, [performanceData])

  const { teams, weeks, maxWins } = chartData

  // Calculate SVG dimensions and scales
  const margin = { top: 20, right: 30, bottom: 40, left: 50 }
  const width = 800
  const height = 500
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const xScale = (week: number) => (week - 1) * (innerWidth / (Math.max(...weeks, 1) - 1 || 1))
  const yScale = (wins: number) => innerHeight - (wins / Math.max(maxWins, 1)) * innerHeight

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Season Performance</h1>
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

      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
        {teams.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">No data available for this season</div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg width={width} height={height} className="mx-auto">
              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Grid lines */}
                {weeks.map(week => (
                  <line
                    key={`grid-x-${week}`}
                    x1={xScale(week)}
                    y1={0}
                    x2={xScale(week)}
                    y2={innerHeight}
                    stroke="#e5e7eb"
                    strokeDasharray="2,2"
                    className="dark:stroke-gray-600"
                  />
                ))}
                {Array.from({ length: maxWins + 1 }, (_, i) => i).map(win => (
                  <line
                    key={`grid-y-${win}`}
                    x1={0}
                    y1={yScale(win)}
                    x2={innerWidth}
                    y2={yScale(win)}
                    stroke="#e5e7eb"
                    strokeDasharray="2,2"
                    className="dark:stroke-gray-600"
                  />
                ))}

                {/* Lines connecting points - render non-hovered first */}
                {teams.filter(team => hoveredTeam !== team.id).map(team => (
                  <polyline
                    key={`line-${team.id}`}
                    points={team.data.map(d => `${xScale(d.week)},${yScale(d.wins)}`).join(' ')}
                    fill="none"
                    stroke={team.color}
                    strokeWidth={2}
                    opacity={hoveredTeam === null ? 1 : 0.3}
                    className="transition-all duration-200"
                  />
                ))}

                {/* Render hovered team's line on top */}
                {hoveredTeam !== null && teams.filter(team => hoveredTeam === team.id).map(team => (
                  <polyline
                    key={`line-hovered-${team.id}`}
                    points={team.data.map(d => `${xScale(d.week)},${yScale(d.wins)}`).join(' ')}
                    fill="none"
                    stroke={team.color}
                    strokeWidth={3}
                    opacity={1}
                    className="transition-all duration-200"
                  />
                ))}

                {/* Data points - render non-hovered first */}
                {teams.filter(team => hoveredTeam !== team.id).map(team => {
                  const lastDataPoint = team.data[team.data.length - 1]
                  if (!lastDataPoint) return null

                  return (
                    <g key={`point-${team.id}`}>
                      <circle
                        cx={xScale(lastDataPoint.week)}
                        cy={yScale(lastDataPoint.wins)}
                        r={20}
                        fill={team.color}
                        opacity={hoveredTeam === null ? 1 : 0.3}
                        onMouseEnter={() => setHoveredTeam(team.id)}
                        onMouseLeave={() => setHoveredTeam(null)}
                        className="cursor-pointer transition-all duration-200"
                      />
                      <text
                        x={xScale(lastDataPoint.week)}
                        y={yScale(lastDataPoint.wins)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {team.initials}
                      </text>
                    </g>
                  )
                })}

                {/* Render hovered team's circle on top */}
                {hoveredTeam !== null && teams.filter(team => hoveredTeam === team.id).map(team => {
                  const lastDataPoint = team.data[team.data.length - 1]
                  if (!lastDataPoint) return null

                  return (
                    <g key={`point-hovered-${team.id}`}>
                      <circle
                        cx={xScale(lastDataPoint.week)}
                        cy={yScale(lastDataPoint.wins)}
                        r={25}
                        fill={team.color}
                        opacity={1}
                        onMouseEnter={() => setHoveredTeam(team.id)}
                        onMouseLeave={() => setHoveredTeam(null)}
                        className="cursor-pointer transition-all duration-200"
                      />
                      <text
                        x={xScale(lastDataPoint.week)}
                        y={yScale(lastDataPoint.wins)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {team.initials}
                      </text>
                      <g>
                        {(() => {
                          // Calculate width based on text length (approximately 7 pixels per character + padding)
                          const textWidth = team.name.length * 7 + 16
                          const rectWidth = Math.max(textWidth, 80) // Minimum width of 80px
                          const halfWidth = rectWidth / 2

                          const circleX = xScale(lastDataPoint.week)
                          const circleY = yScale(lastDataPoint.wins)

                          // Check if tooltip would go beyond SVG boundaries and adjust positioning
                          let tooltipX = circleX - halfWidth
                          let tooltipY = circleY - 45  // Default: above the circle
                          let textX = circleX
                          let textY = circleY - 28
                          let textAnchor: "start" | "middle" | "end" = "middle"

                          // Check vertical boundaries - if tooltip would be clipped at top, show below circle
                          if (circleY - 45 < 0) {
                            tooltipY = circleY + 35  // Below the circle (25px radius + 10px padding)
                            textY = circleY + 52     // Adjust text position accordingly
                          }

                          // If tooltip would extend beyond right edge, align it to the right of the circle
                          if (circleX + halfWidth > innerWidth) {
                            tooltipX = circleX - rectWidth + 10 // 10px padding from circle
                            textX = circleX - halfWidth + 10
                            textAnchor = "middle"
                          }
                          // If tooltip would extend beyond left edge, align it to the left of the circle
                          else if (circleX - halfWidth < 0) {
                            tooltipX = circleX - 10 // 10px padding from circle
                            textX = circleX + halfWidth - 10
                            textAnchor = "middle"
                          }

                          return (
                            <>
                              <rect
                                x={tooltipX}
                                y={tooltipY}
                                width={rectWidth}
                                height={25}
                                fill="black"
                                opacity={0.8}
                                rx={4}
                              />
                              <text
                                x={textX}
                                y={textY}
                                textAnchor={textAnchor}
                                fill="white"
                                fontSize="11"
                              >
                                {team.name}
                              </text>
                            </>
                          )
                        })()}
                      </g>
                    </g>
                  )
                })}

                {/* X-axis */}
                <g transform={`translate(0, ${innerHeight})`}>
                  <line x1={0} y1={0} x2={innerWidth} y2={0} stroke="#9ca3af" />
                  {weeks.map(week => (
                    <g key={`x-label-${week}`} transform={`translate(${xScale(week)}, 0)`}>
                      <line y1={0} y2={6} stroke="#9ca3af" />
                      <text
                        y={20}
                        textAnchor="middle"
                        fill="#6b7280"
                        fontSize="12"
                        className="dark:fill-gray-400"
                      >
                        {week}
                      </text>
                    </g>
                  ))}
                </g>

                {/* Y-axis */}
                <g>
                  <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#9ca3af" />
                  {Array.from({ length: maxWins + 1 }, (_, i) => i).map(win => (
                    <g key={`y-label-${win}`} transform={`translate(0, ${yScale(win)})`}>
                      <line x1={-6} x2={0} stroke="#9ca3af" />
                      <text
                        x={-10}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fill="#6b7280"
                        fontSize="12"
                        className="dark:fill-gray-400"
                      >
                        {win}
                      </text>
                    </g>
                  ))}
                </g>

                {/* Y-axis label */}
                <text
                  transform={`rotate(-90) translate(${-innerHeight/2}, ${-35})`}
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="14"
                  className="dark:fill-gray-300"
                >
                  Number of Wins
                </text>
              </g>
            </svg>
          </div>
        )}

        {/* Legend */}
        {teams.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {teams.map(team => (
              <div
                key={team.id}
                className="flex items-center gap-2 cursor-pointer"
                onMouseEnter={() => setHoveredTeam(team.id)}
                onMouseLeave={() => setHoveredTeam(null)}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {team.owner}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}