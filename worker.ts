import { Hono } from 'hono'
import { generateAzureEmail, isAzureEmailConfigured, isEmailCategory, type AzureEmailEnvironment } from './src/azure-email'
import { createSeedEmails } from './src/mock-emails'

type Env = {
  Bindings: {
    ASSETS: Fetcher
  } & AzureEmailEnvironment
}

const app = new Hono<Env>()

app.get('/api/emails', (context) => context.json(createSeedEmails()))
app.post('/api/emails/sync', async (context) => {
  if (!isAzureEmailConfigured(context.env)) {
    return context.json(
      { error: 'Azure AI is not configured. Add the AZURE_OPENAI_API_KEY Worker secret.' },
      503,
    )
  }
  const requestedCategory = context.req.query('category')
  const category = isEmailCategory(requestedCategory) ? requestedCategory : undefined
  return context.json(await generateAzureEmail(context.env, category))
})
app.get('/api/health', (context) => context.json({ status: 'ok', source: 'mock' }))

app.all('*', async (context) => {
  const asset = await context.env.ASSETS.fetch(context.req.raw)
  if (asset.status !== 404 || (context.req.method !== 'GET' && context.req.method !== 'HEAD')) return asset
  const url = new URL('/', context.req.url)
  return context.env.ASSETS.fetch(new Request(url, { method: context.req.method }))
})

app.onError((error, context) => {
  console.error(error)
  return context.json({ error: 'The request could not be completed.' }, 500)
})

export default app
