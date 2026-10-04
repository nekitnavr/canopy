import OpenAI from 'openai'
import type { Email, EmailCategory, ExtractedInformation } from './email-model'

export type AzureEmailEnvironment = {
  AZURE_OPENAI_API_KEY?: string
}

type GeneratedEmail = Pick<
  Email,
  | 'sender'
  | 'senderEmail'
  | 'subject'
  | 'summary'
  | 'category'
  | 'relevanceScore'
  | 'urgencyScore'
  | 'actionRequired'
  | 'keyInformation'
  | 'extractedInformation'
  | 'originalContent'
  | 'recommendedAction'
>

type ConfiguredAzureEmailEnvironment = AzureEmailEnvironment & {
  AZURE_OPENAI_API_KEY: string
}

const azureOpenAIBaseUrl = 'https://dtl-1680-resource.services.ai.azure.com/openai/v1'
const deploymentName = 'gpt-5-mini'
const categories: EmailCategory[] = ['attention', 'worth-knowing', 'no-action']
const informationKinds: NonNullable<ExtractedInformation['kind']>[] = [
  'deadline',
  'amount',
  'eligibility',
  'event',
  'other',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

function isStringArray(value: unknown, maxItems: number, maxLength: number): value is string[] {
  return Array.isArray(value) && value.length <= maxItems && value.every((item) => isText(item, maxLength))
}

function isEmailCategory(value: unknown): value is EmailCategory {
  return categories.some((category) => category === value)
}

function isInformationKind(value: unknown): value is NonNullable<ExtractedInformation['kind']> {
  return informationKinds.some((kind) => kind === value)
}

function isExtractedInformation(value: unknown): value is ExtractedInformation[] {
  return (
    Array.isArray(value) &&
    value.length <= 12 &&
    value.every(
      (item: unknown) =>
        isRecord(item) &&
        isText(item.label, 100) &&
        isText(item.value, 300) &&
        (item.kind === undefined || isInformationKind(item.kind)),
    )
  )
}

function isGeneratedEmail(value: unknown): value is GeneratedEmail {
  if (!isRecord(value)) return false
  return (
    isText(value.sender, 120) &&
    isText(value.senderEmail, 254) &&
    isText(value.subject, 180) &&
    isText(value.summary, 500) &&
    isEmailCategory(value.category) &&
    typeof value.relevanceScore === 'number' &&
    Number.isFinite(value.relevanceScore) &&
    value.relevanceScore >= 0 &&
    value.relevanceScore <= 100 &&
    typeof value.urgencyScore === 'number' &&
    Number.isFinite(value.urgencyScore) &&
    value.urgencyScore >= 0 &&
    value.urgencyScore <= 100 &&
    typeof value.actionRequired === 'boolean' &&
    isStringArray(value.keyInformation, 8, 180) &&
    isExtractedInformation(value.extractedInformation) &&
    isText(value.originalContent, 6000) &&
    isText(value.recommendedAction, 500)
  )
}

export function parseGeneratedEmail(output: string): GeneratedEmail {
  if (output.length > 10_000) throw new Error('Azure AI returned an oversized email.')

  let value: unknown
  try {
    value = JSON.parse(output)
  } catch {
    throw new Error('Azure AI did not return valid JSON for the generated email.')
  }

  if (!isGeneratedEmail(value)) {
    throw new Error('Azure AI returned email data in an unexpected format.')
  }
  return value
}

export function isAzureEmailConfigured(env: AzureEmailEnvironment): env is ConfiguredAzureEmailEnvironment {
  return Boolean(env.AZURE_OPENAI_API_KEY?.trim())
}

export async function generateAzureEmail(env: AzureEmailEnvironment): Promise<Email> {
  if (!isAzureEmailConfigured(env)) {
    throw new Error('Azure AI is not configured. Add the AZURE_OPENAI_API_KEY Worker secret.')
  }

  const openAIClient = new OpenAI({
    apiKey: env.AZURE_OPENAI_API_KEY,
    baseURL: azureOpenAIBaseUrl,
  })
  const response = await openAIClient.responses.create({
    model: deploymentName,
    input: [
      'Generate one fictional email for a personal inbox demo. Do not use real people or personal data.',
      'Return only a valid JSON object with exactly these fields:',
      'sender, senderEmail, subject, summary, category, relevanceScore, urgencyScore, actionRequired,',
      'keyInformation, extractedInformation, originalContent, recommendedAction.',
      'category must be "attention", "worth-knowing", or "no-action". Scores must be numbers from 0 to 100.',
      'keyInformation must be an array of strings. extractedInformation must be an array of objects with',
      'label, value, and optional kind ("deadline", "amount", "eligibility", "event", or "other").',
      'Use ISO YYYY-MM-DD values for extracted deadlines and event dates. Do not wrap the JSON in markdown.',
    ].join(' '),
  })
  const generated = parseGeneratedEmail(response.output_text)
  return {
    ...generated,
    id: `email-${crypto.randomUUID()}`,
    receivedAt: new Date().toISOString(),
    reminderState: 'none',
    reminderDate: null,
  }
}
