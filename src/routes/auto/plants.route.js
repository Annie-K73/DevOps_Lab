import express from 'express'
const router = express.Router()

let plants = [
  { id: 1, name: 'Camellia', color: '#FFAAAA' },
  { id: 2, name: 'Dahlia', color: '#FFAA00' }
]

// GET ALL plants
router.get('/', (req, res) => res.status(200).json(plants))

// GET by ID
router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  const plant = plants.find(d => d.id === id)
  if (!plant) return res.status(404).json({ error: 'Plant not found' })
  res.json(plant)
})

// POST new plant
router.post('/', (req, res) => {
  const { name, color } = req.body
  if (!name || !color) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const newPlant = { id: plants.length + 1, name, color }
  plants.push(newPlant)
  res.status(201).json(newPlant)
})

// PUT
router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = plants.findIndex(d => d.id === id)
  if (index === -1) {
    return res.status(404).json({ error: 'Plant not found' })
  }
  plants[index] = { ...plants[index], ...req.body }
  res.json(plants[index])
})

// DELETE
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const before = plants.length
  plants = plants.filter(d => d.id !== id)
  if (plants.length === before) {
    return res.status(404).json({ error: 'Plant not found' })
  }
  res.status(204).end()
})

export default router
