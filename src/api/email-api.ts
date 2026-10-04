import type { Email } from '../email-model'

const STORAGE_KEY = 'canopy.emails.v2'

export interface EmailApi {
  list(): Promise<Email[]>
  sync(): Promise<Email | null>
  update(emailId: string, patch: Partial<Pick<Email, 'actionRequired' | 'reminderState' | 'reminderDate'>>): Promise<Email[]>
}

function isExtractedInformation(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return typeof item.label === 'string' && typeof item.value === 'string' &&
    (item.kind === undefined || item.kind === 'deadline' || item.kind === 'amount' ||
      item.kind === 'eligibility' || item.kind === 'event' || item.kind === 'other')
}

function isEmail(value: unknown): value is Email {
  if (typeof value !== 'object' || value === null) return false
  const email = value as Record<string, unknown>
  return (
    typeof email.id === 'string' && typeof email.sender === 'string' &&
    typeof email.senderEmail === 'string' && typeof email.subject === 'string' &&
    typeof email.summary === 'string' &&
    (email.category === 'attention' || email.category === 'worth-knowing' || email.category === 'no-action') &&
    typeof email.relevanceScore === 'number' && email.relevanceScore >= 0 && email.relevanceScore <= 100 &&
    typeof email.urgencyScore === 'number' && email.urgencyScore >= 0 && email.urgencyScore <= 100 &&
    typeof email.actionRequired === 'boolean' && Array.isArray(email.keyInformation) &&
    email.keyInformation.every((fact) => typeof fact === 'string') &&
    Array.isArray(email.extractedInformation) && email.extractedInformation.every(isExtractedInformation) &&
    typeof email.originalContent === 'string' &&
    typeof email.recommendedAction === 'string' && typeof email.receivedAt === 'string' &&
    (email.reminderState === 'none' || email.reminderState === 'added') &&
    (email.reminderDate === null || typeof email.reminderDate === 'string')
  )
}

function readStoredEmails(): Email[] | null {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === null) return null
  const parsed: unknown = JSON.parse(stored)
  if (!Array.isArray(parsed) || !parsed.every(isEmail)) {
    throw new Error('Saved inbox data is invalid. Clear this site’s saved data to reload the demo inbox.')
  }
  return parsed
}

function saveEmails(emails: Email[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(emails))
}

async function getServerEmails(): Promise<Email[]> {
  const response = await fetch('/api/emails')
  if (!response.ok) throw new Error(`Could not load the inbox (HTTP ${response.status}).`)
  const payload: unknown = await response.json()
  if (!Array.isArray(payload) || !payload.every(isEmail)) {
    throw new Error('The email service returned an invalid inbox response.')
  }
  return payload
}

export const emailApi: EmailApi = {
  async list() {
    const stored = readStoredEmails()
    if (stored) return stored
    const emails = await getServerEmails()
    saveEmails(emails)
    return emails
  },
  async sync() {
    const response = await fetch('/api/emails/sync', { method: 'POST' })
    if (!response.ok) throw new Error(`Could not check for new mail (HTTP ${response.status}).`)
    const payload: unknown = await response.json()
    if (payload === null) return null
    if (!isEmail(payload)) throw new Error('The email service returned an invalid message.')
    const emails = readStoredEmails()
    if (!emails) throw new Error('The inbox has not loaded yet. Try checking for new mail again.')
    saveEmails([payload, ...emails])
    return payload
  },
  async update(emailId, patch) {
    const emails = readStoredEmails()
    if (!emails) throw new Error('The inbox has not loaded yet. Try again in a moment.')
    let found = false
    const updated = emails.map((email) => {
      if (email.id !== emailId) return email
      found = true
      return { ...email, ...patch }
    })
    if (!found) throw new Error('That email is no longer in your inbox. Refresh and try again.')
    saveEmails(updated)
    return updated
  },
}
