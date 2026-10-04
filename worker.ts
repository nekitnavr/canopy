import { Hono } from 'hono'
import { createSeedEmails, createRandomSyncedEmail } from './src/mock-emails'

type Env = {
  Bindings: {
    ASSETS: Fetcher
  }
}

const app = new Hono<Env>()

app.get('/api/emails', (context) => context.json(createSeedEmails()))
app.post('/api/emails/sync', (context) => context.json(createRandomSyncedEmail()))
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
