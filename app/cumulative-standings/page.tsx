import { getCumulativeRecords } from '@/lib/data'
import CumulativeStandingsClient from './cumulative-standings-client'

export default async function RecordsPage() {
  const cumulativeRecords = await getCumulativeRecords()

  return <CumulativeStandingsClient records={cumulativeRecords} />
}