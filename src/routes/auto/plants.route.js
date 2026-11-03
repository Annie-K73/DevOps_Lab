import express from 'express'
const router = express.Router()

const plants = [
  { id: 1, name: 'Camellia', color: '#FFAAAA' },
  { id: 2, name: 'Dahlia', color: '#FFAA00' }
]

// Get all plants
router.get('/', (req, res) => res.status(200).json(plants))

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

export default router
