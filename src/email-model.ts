export type EmailCategory = 'attention' | 'worth-knowing' | 'no-action'

export type ExtractedInformation = {
  label: string
  value: string
  kind?: 'deadline' | 'amount' | 'eligibility' | 'event' | 'other'
}

export type Email = {
  id: string
  sender: string
  senderEmail: string
  subject: string
  summary: string
  category: EmailCategory
  relevanceScore: number
  urgencyScore: number
  actionRequired: boolean
  keyInformation: string[]
  extractedInformation: ExtractedInformation[]
  originalContent: string
  recommendedAction: string
  receivedAt: string
  reminderState: 'none' | 'added'
  reminderDate: string | null
}
