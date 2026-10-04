import { describe, expect, it, vi } from 'vitest'
import { isAzureEmailConfigured, parseGeneratedEmail, generateAzureEmail } from './azure-email'

const { responsesCreate } = vi.hoisted(() => ({ responsesCreate: vi.fn() }))

vi.mock('openai', () => ({
  default: class {
    responses = { create: responsesCreate }
  },
}))

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
  it('generates emails across attention and worth-knowing categories', async () => {
    const random = vi.spyOn(Math, 'random')
    responsesCreate.mockResolvedValueOnce({ output_text: JSON.stringify(generatedEmail) })
    responsesCreate.mockResolvedValueOnce({
      output_text: JSON.stringify({ ...generatedEmail, category: 'attention', actionRequired: true }),
    })

    random.mockReturnValueOnce(0.1).mockReturnValueOnce(0.5)
    const important = await generateAzureEmail({ AZURE_OPENAI_API_KEY: 'key' })
    const worthKnowing = await generateAzureEmail({ AZURE_OPENAI_API_KEY: 'key' })

    expect(important).toMatchObject({ category: 'attention', actionRequired: true })
    expect(worthKnowing).toMatchObject({ category: 'worth-knowing', actionRequired: false })
    expect(responsesCreate.mock.calls[0][0].input).toContain('category MUST be "attention"')
    expect(responsesCreate.mock.calls[1][0].input).toContain('category MUST be "worth-knowing"')
    random.mockRestore()
  })

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
