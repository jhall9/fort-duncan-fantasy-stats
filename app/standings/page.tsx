import { getYearlyStandings, getAvailableYears } from '@/lib/data'
import StandingsClient from './standings-client'

export default async function StandingsPage() {
  const [yearlyStandings, years] = await Promise.all([
    getYearlyStandings(),
    getAvailableYears()
  ])

  return <StandingsClient yearlyStandings={yearlyStandings} years={years} />
}