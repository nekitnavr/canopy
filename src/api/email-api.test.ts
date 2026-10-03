import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emailApi } from './email-api'
import { createSeedEmails, createSyncedEmail } from '../mock-emails'

const values = new Map<string, string>()
const localStorage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
}

beforeEach(() => {
  values.clear()
  vi.stubGlobal('window', { localStorage })
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const path = new URL(String(input), 'https://mailmind.test').pathname
    return path === '/api/emails/sync'
      ? Response.json(createSyncedEmail())
      : Response.json(createSeedEmails())
  }))
})

afterEach(() => vi.unstubAllGlobals())

describe('email API', () => {
  it('loads and persists the API inbox for subsequent pages', async () => {
    const initial = await emailApi.list()
    const restored = await emailApi.list()

    expect(initial).toHaveLength(11)
    expect(restored).toEqual(initial)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('persists reminder and action changes to the shared email record', async () => {
    await emailApi.list()
    const updated = await emailApi.update('health-enrollment', {
      reminderState: 'added',
      reminderDate: '2026-10-12',
      actionRequired: false,
    })
    const refreshed = await emailApi.list()
    const saved = refreshed.find((email) => email.id === 'health-enrollment')

    expect(updated).toEqual(refreshed)
    expect(saved).toMatchObject({ reminderState: 'added', reminderDate: '2026-10-12', actionRequired: false })
  })

  it('adds messages returned by the sync API to the same inbox', async () => {
    await emailApi.list()
    const added = await emailApi.sync()
    const refreshed = await emailApi.list()

    expect(refreshed).toHaveLength(12)
    expect(refreshed[0]).toEqual(added)
  })
})
