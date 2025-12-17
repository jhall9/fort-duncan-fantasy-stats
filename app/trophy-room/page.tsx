import { getLeagueChampions } from '@/lib/data'
import TrophyRoomClient from './trophy-room-client'

export default async function TrophyRoomPage() {
  const champions = await getLeagueChampions()

  return <TrophyRoomClient champions={champions} />
}