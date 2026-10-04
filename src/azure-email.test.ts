import { describe, expect, it } from 'vitest'
import { isAzureEmailConfigured, parseGeneratedEmail } from './azure-email'

const generatedEmail = {
  sender: 'Northstar Foundation',
  senderEmail: 'grants@example.com',
  subject: 'Your community grant application is almost due',
  summary: 'Two supporting documents are still needed for your application.',
  category: 'attention',
  relevanceScore: 94,
  urgencyScore: 88,
  actionRequired: true,
  keyInformation: ['Due in three days', 'Two documents missing'],
  extractedInformation: [{ label: 'Submission deadline', value: '2026-10-06', kind: 'deadline' }],
  originalContent: 'Hello Alex,\n\nPlease submit the remaining documents by October 6.',
  recommendedAction: 'Upload the missing documents before the deadline.',
}

describe('Azure email generation', () => {
  it('accepts complete, schema-valid agent output', () => {
    expect(parseGeneratedEmail(JSON.stringify(generatedEmail))).toEqual(generatedEmail)
  })

  it('rejects malformed or incomplete agent output', () => {
    expect(() => parseGeneratedEmail('not json')).toThrow('valid JSON')
    expect(() => parseGeneratedEmail(JSON.stringify({ ...generatedEmail, category: 'other' }))).toThrow(
      'unexpected format',
    )
  })

  it('requires the Azure OpenAI API key', () => {
    expect(isAzureEmailConfigured({})).toBe(false)
    expect(isAzureEmailConfigured({ AZURE_OPENAI_API_KEY: 'key' })).toBe(true)
  })
})
