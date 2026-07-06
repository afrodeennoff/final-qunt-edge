import { Metadata } from 'next'
import JournalClient from './journal-client'

export const metadata: Metadata = {
  title: 'Trade Journal',
  description: 'Review and reflect on your trades with journal entries',
}

export default function JournalPage() {
  return (
    <div className="flex h-full flex-col">
      <JournalClient />
    </div>
  )
}
