import { getCumulativeRecords } from '@/lib/data'
import RecordsClient from './records-client'

export default async function RecordsPage() {
  const cumulativeRecords = await getCumulativeRecords()

  return <RecordsClient records={cumulativeRecords} />
}