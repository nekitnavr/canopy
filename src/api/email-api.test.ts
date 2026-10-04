import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emailApi } from './email-api'
import { createRandomSyncedEmail, createSeedEmails, createSyncedEmail } from '../mock-emails'

const values = new Map<string, string>()
const localStorage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
}

beforeEach(() => {
  values.clear()
  vi.stubGlobal('window', { localStorage })
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const path = new URL(String(input), 'https://canopy.test').pathname
    return path === '/api/emails/sync'
      ? Response.json(createSyncedEmail('worth-knowing'))
      : Response.json(createSeedEmails())
  }))
})

afterEach(() => vi.unstubAllGlobals())

describe('email API', () => {
  it('loads and persists the API inbox for subsequent pages', async () => {
    const initial = await emailApi.list()
    const restored = await emailApi.list()

    expect(initial).toHaveLength(11)
    expect(initial.every((email) => email.reminderState === 'none')).toBe(true)
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

  it('leaves the inbox unchanged when the sync API has no new email', async () => {
    await emailApi.list()
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(null))

    expect(await emailApi.sync()).toBeNull()
    expect(await emailApi.list()).toHaveLength(11)
  })

  it('shows configuration errors returned by the email-generation service', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ error: 'Azure AI is not configured.' }, { status: 503 }),
    )

    await expect(emailApi.sync()).rejects.toThrow('Azure AI is not configured.')
  })

  it('randomly returns emails from all categories or no email', () => {
    const sequence = (...values: number[]) => () => values.shift() ?? 0

    expect(createRandomSyncedEmail(() => 0.1)).toBeNull()
    expect(createRandomSyncedEmail(sequence(0.9, 0))?.category).toBe('attention')
    expect(createRandomSyncedEmail(sequence(0.9, 0.5))?.category).toBe('worth-knowing')
    expect(createRandomSyncedEmail(sequence(0.9, 0.99))?.category).toBe('no-action')
  })
})
