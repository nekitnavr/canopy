import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { emailApi } from '../api/email-api'
import type { Email, EmailCategory } from '../email-model'

const emailCategories: EmailCategory[] = ['attention', 'worth-knowing', 'no-action']

function nextCategoryToFill(emails: Email[]): EmailCategory {
  const counts: Record<EmailCategory, number> = {
    attention: 0,
    'worth-knowing': 0,
    'no-action': 0,
  }
  for (const email of emails) counts[email.category] += 1

  return emailCategories.reduce((leastCommon, category) =>
    counts[category] < counts[leastCommon] ? category : leastCommon,
  )
}

type EmailContextValue = {
  emails: Email[]
  loading: boolean
  syncing: boolean
  error: string | null
  notice: string | null
  clearNotice: () => void
  refreshInbox: () => Promise<void>
  syncInbox: () => Promise<void>
  clearInbox: () => Promise<void>
  restoreInbox: () => Promise<void>
  updateEmail: (emailId: string, patch: Partial<Pick<Email, 'actionRequired' | 'reminderState' | 'reminderDate'>>) => Promise<void>
}

const EmailContext = createContext<EmailContextValue | null>(null)

export function EmailProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const refreshInbox = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEmails(await emailApi.list())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The inbox could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearNotice = useCallback(() => setNotice(null), [])

  useEffect(() => {
    void refreshInbox()
  }, [refreshInbox])

  const syncInbox = useCallback(async () => {
    setSyncing(true)
    setError(null)
    setNotice(null)
    try {
      const email = await emailApi.sync(nextCategoryToFill(emails))
      if (!email) {
        setNotice('No new emails — your inbox is all caught up.')
        return
      }
      setEmails(await emailApi.list())
      setNotice('A new email has been added to your inbox.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'New email could not be checked.')
    } finally {
      setSyncing(false)
    }
  }, [emails])

  const clearInbox = useCallback(async () => {
    setError(null)
    setNotice(null)
    try {
      setEmails(await emailApi.clear())
      setNotice('Your inbox has been cleared.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The inbox could not be cleared.')
    }
  }, [])

  const restoreInbox = useCallback(async () => {
    setError(null)
    setNotice(null)
    try {
      setEmails(await emailApi.restore())
      setNotice('The starter demo emails have been restored.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The starter inbox could not be restored.')
    }
  }, [])

  const updateEmail = useCallback<EmailContextValue['updateEmail']>(async (emailId, patch) => {
    setError(null)
    setNotice(null)
    try {
      setEmails(await emailApi.update(emailId, patch))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The email could not be updated.')
    }
  }, [])

  const value = useMemo(
    () => ({ emails, loading, syncing, error, notice, clearNotice, refreshInbox, syncInbox, clearInbox, restoreInbox, updateEmail }),
    [emails, loading, syncing, error, notice, clearNotice, refreshInbox, syncInbox, clearInbox, restoreInbox, updateEmail],
  )
  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>
}

export function useEmailData(): EmailContextValue {
  const context = useContext(EmailContext)
  if (!context) throw new Error('useEmailData must be used within EmailProvider.')
  return context
}
