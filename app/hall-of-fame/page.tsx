import { getHallOfFame } from '@/lib/data'
import HallOfFameClient from './hall-of-fame-client'

export default async function HallOfFamePage() {
  const hallOfFameData = await getHallOfFame()

  return <HallOfFameClient data={hallOfFameData} />
}