import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { emailApi } from '../api/email-api'
import type { Email } from '../email-model'

type EmailContextValue = {
  emails: Email[]
  loading: boolean
  syncing: boolean
  error: string | null
  refreshInbox: () => Promise<void>
  syncInbox: () => Promise<void>
  updateEmail: (emailId: string, patch: Partial<Pick<Email, 'actionRequired' | 'reminderState' | 'reminderDate'>>) => Promise<void>
}

const EmailContext = createContext<EmailContextValue | null>(null)

export function EmailProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    void refreshInbox()
  }, [refreshInbox])

  const syncInbox = useCallback(async () => {
    setSyncing(true)
    setError(null)
    try {
      await emailApi.sync()
      setEmails(await emailApi.list())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'New email could not be checked.')
    } finally {
      setSyncing(false)
    }
  }, [])

  const updateEmail = useCallback<EmailContextValue['updateEmail']>(async (emailId, patch) => {
    setError(null)
    try {
      setEmails(await emailApi.update(emailId, patch))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The email could not be updated.')
    }
  }, [])

  const value = useMemo(
    () => ({ emails, loading, syncing, error, refreshInbox, syncInbox, updateEmail }),
    [emails, loading, syncing, error, refreshInbox, syncInbox, updateEmail],
  )
  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>
}

export function useEmailData(): EmailContextValue {
  const context = useContext(EmailContext)
  if (!context) throw new Error('useEmailData must be used within EmailProvider.')
  return context
}
