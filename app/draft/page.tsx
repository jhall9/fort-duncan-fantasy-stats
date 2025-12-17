import { getDraftPositions, getAvailableYears } from '@/lib/data'
import DraftClient from './draft-client'

export default async function DraftPage() {
  const [draftPositions, years] = await Promise.all([
    getDraftPositions(),
    getAvailableYears()
  ])

  return <DraftClient draftPositions={draftPositions} years={years} />
}