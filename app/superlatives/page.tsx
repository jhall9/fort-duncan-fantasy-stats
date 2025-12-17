import { getYearlySuperlatives, getAvailableYears, YearlySuperlatives } from '@/lib/data'
import SuperlativesClient from './superlatives-client'

export default async function SuperlativesPage() {
  const years = await getAvailableYears()
  const initialYear = years[0]

  // Pre-fetch all years' data for static export
  const allData: Record<number, YearlySuperlatives | null> = {}
  for (const year of years) {
    allData[year] = await getYearlySuperlatives(year)
  }

  return (
    <SuperlativesClient
      years={years}
      initialYear={initialYear}
      allData={allData}
    />
  )
}
