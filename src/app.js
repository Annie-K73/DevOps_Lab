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
import gardensRouter from './routes/gardens.route.js'
import speciesRouter from './routes/species.route.js'
import plantsRouter from './routes/plants.route.js'
import careLogsRouter from './routes/careLogs.route.js'

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

// Auto-mount all routers placed under src/routes/auto
const autoDir = path.join(__dirname, 'routes', 'auto')
if (fs.existsSync(autoDir)) {
  const files = fs.readdirSync(autoDir).filter(f => f.endsWith('.route.js'))
  for (const f of files) {
    const full = path.join(autoDir, f)
    const mod = require(full)
    const router = mod.default || mod
    if (router) app.use('/', router)
  }
}

// Global error middleware last
app.use(errorHandler)

export default app