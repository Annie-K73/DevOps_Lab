import express from 'express'

const router = express.Router()

const allowedActions = ['arrosage', 'engrais', 'rempotage', 'taille']

const careLogs = [
  { id: 1, plantId: 1, action: 'arrosage', date: '2026-11-01T10:00:00.000Z' },
  { id: 2, plantId: 2, action: 'engrais', date: '2026-11-02T09:30:00.000Z' }
]
let nextId = 3
// GET a plant history by its ID
router.get('/', (req, res) => {
  const plantId = Number(req.query.plantId)
  if (!req.query.plantId || Number.isNaN(plantId)) { return res.status(400).json({ error: 'Missing or invalid plantId' }) }

  const history = careLogs.filter(log => log.plantId === plantId)
  return res.status(200).json(history)
})

// POST : ajout une plante et l'action d'entretien réalisé dessus
router.post('/', (req, res) => {
  const { plantId, action } = req.body ?? {}

  if (!plantId || !action) {
    return res.status(400).json({ error: 'plantId and action are required' })
  }

  if (!allowedActions.includes(action)) {
    return res.status(400).json({
      error: `Unknown action. Allowed: ${allowedActions.join(', ')}`
    })
  }

  const log = {
    id: nextId++,
    plantId: Number(plantId),
    action,
    date: new Date().toISOString()
  }
  careLogs.push(log)

  return res.status(201).json({ id: log.id })
})

export default router
