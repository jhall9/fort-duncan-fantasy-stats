import { getSeasonPerformance, getAvailableYears, WeeklyPerformance } from '@/lib/data'
import PerformanceClient from './performance-client'

export default async function PerformancePage() {
  const years = await getAvailableYears()
  const initialYear = years[0]

  // Pre-fetch all years' data for static export
  const allData: Record<number, WeeklyPerformance[]> = {}
  for (const year of years) {
    allData[year] = await getSeasonPerformance(year)
  }

  return (
    <PerformanceClient
      years={years}
      initialYear={initialYear}
      allData={allData}
    />
  )
}
