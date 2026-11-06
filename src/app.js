/**
 * Express app configuration.
 * Responsibilities:
 *  - Base routes (/, /health)
 *  - IGGT API routes (/api/gardens, /api/species, /api/plants, /api/care-logs)
 *  - Auto-mount all routers in src/routes/auto/*.route.js
 *  - Global error handler (consistent JSON for errors)
 */
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { errorHandler } from './utils/errorHandler.js'

// IGGT routes (Lab 5)
import gardensRouter from './routes/auto/gardens.route.js'
import speciesRouter from './routes/auto/species.route.js'
import plantsRouter from './routes/auto/plants.route.js'
import careLogsRouter from './routes/auto/careLogs.route.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

const app = express()

// Parse JSON bodies before handling requests (needed for POST)
app.use(express.json())

// Simple root + health endpoints
app.get('/', (_req, res) => res.json({ ok: true, message: 'Hello from CI/CD demo 👋' }))
app.get('/health', (_req, res) => res.status(200).send('OK'))

// IGGT API routes
app.use('/api/gardens', gardensRouter)
app.use('/api/species', speciesRouter)
app.use('/api/plants', plantsRouter)
app.use('/api/care-logs', careLogsRouter)

// Auto-mount additional routers, excluding explicitly mounted routers
const autoDir = path.join(__dirname, 'routes', 'auto')

const explicitlyMounted = new Set([
  'gardens.route.js',
  'species.route.js',
  'plants.route.js',
  'careLogs.route.js'
])

if (fs.existsSync(autoDir)) {
  const files = fs.readdirSync(autoDir).filter(
    file => file.endsWith('.route.js') && !explicitlyMounted.has(file)
  )

  for (const file of files) {
    const full = path.join(autoDir, file)
    const mod = require(full)
    const router = mod.default || mod

    if (router) {
      app.use('/', router)
    }
  }
}

// Global error middleware last
app.use(errorHandler)

export default app
