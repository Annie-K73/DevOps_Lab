import express from 'express'
const router = express.Router()

const gardens = [
  { id: 1, name: 'Backyard', type: 'outdoor', city: 'Paris' },
  { id: 2, name: 'Living room', type: 'indoor', city: 'Paris' }
]

router.get('/', (req, res) => res.status(200).json(gardens))

router.post('/', (req, res) => {
  const { name, type, city } = req.body
  if (!name || !type) {
    return res.status(400).json({ error: 'Missing required fields: name, type' })
  }
  if (type !== 'indoor' && type !== 'outdoor') {
    return res.status(400).json({ error: "type must be 'indoor' or 'outdoor'" })
  }
  const newGarden = { id: gardens.length + 1, name, type, city: city || null }
  gardens.push(newGarden)
  res.status(201).json(newGarden)
})

router.get('/:id', (req, res) => {
  const garden = gardens.find(g => g.id === Number(req.params.id))
  if (!garden) return res.status(404).json({ error: 'Garden not found' })
  res.json(garden)
})

router.put('/:id', (req, res) => {
  const index = gardens.findIndex(g => g.id === Number(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Garden not found' })
  gardens[index] = { ...gardens[index], ...req.body }
  res.json(gardens[index])
})

router.delete('/:id', (req, res) => {
  const index = gardens.findIndex(g => g.id === Number(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Garden not found' })
  gardens.splice(index, 1)
  res.status(204).end()
})

export default router
