import express from 'express'

const router = express.Router()

const allowedActions = ['arrosage', 'engrais', 'rempotage', 'taille']
const allowedKinds = ['care', 'observation']
const allowedSources = ['user', 'sensor']

let careLogs = [
  { id: 1, plantId: 1, kind: 'care', action: 'arrosage', heightCm: 25, symptoms: ['dots', 'dryness'], photoUrl: '', source: 'user', date: '2026-11-01T10:00:00.000Z' },
  { id: 2, plantId: 2, kind: 'observation', action: 'engrais', heightCm: 43, symptoms: ['holes'], photoUrl: '', source: 'sensor', date: '2026-11-02T09:30:00.000Z' }
]
let nextId = 3

// GET all, ou historique d'une plante avec ?plantId=1
router.get('/', (req, res) => {
  const { plantId } = req.query
  if (plantId === undefined) {
    return res.status(200).json(careLogs)
  }
  return res.status(200).json(careLogs.filter(log => log.plantId === Number(plantId)))
})

// POST : ajout une plante et l'action d'entretien réalisé dessus
router.post('/', (req, res) => {
  const { plantId, kind, action, heightCm, symptoms, photoUrl, source } = req.body ?? {}

  if (!plantId || !kind || !action || !heightCm || !symptoms || !photoUrl || !source) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  if (!allowedActions.includes(action)) {
    return res.status(400).json({
      error: `Unknown action. Allowed: ${allowedActions.join(', ')}`
    })
  }

  if (!allowedSources.includes(source)) {
    return res.status(400).json({
      error: `Unknown source. Allowed: ${allowedSources.join(', ')}`
    })
  }

  if (!allowedKinds.includes(kind)) {
    return res.status(400).json({
      error: `Unknown care log kind. Allowed: ${allowedKinds.join(', ')}`
    })
  }

  if (!Number.isInteger(heightCm) || heightCm < 0) {
    return res.status(400).json({
      error: 'Invalid height. Needs to be a positive integer'
    })
  }

  if (!Array.isArray(symptoms) || !symptoms.every(symptom => typeof symptom === 'string')) {
    return res.status(400).json({
      error: 'Invalid symptoms. Every symptoms need to be strings'
    })
  }
  const log = {
    id: nextId++,
    plantId,
    kind,
    action,
    heightCm,
    symptoms,
    photoUrl,
    source,
    date: new Date().toISOString()
  }
  careLogs.push(log)

  return res.status(201).json(log)
})

// PUT
router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = careLogs.findIndex(log => log.id === id)
  if (index === -1) {
    return res.status(404).json({ error: 'No record found' })
  }

  careLogs[index] = { ...careLogs[index], ...req.body }
  return res.status(200).json(careLogs[index])
})

// DELETE
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const before = careLogs.length
  careLogs = careLogs.filter(log => log.id !== id)
  if (careLogs.length === before) {
    return res.status(404).json({ error: 'No record found' })
  }
  res.status(204).end()
})

export default router
