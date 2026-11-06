
import express from 'express'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { parse } from 'csv-parse/sync'

const router = express.Router()

const csvPath = fileURLToPath(
  new URL('../../../data/waterwise-plants.csv', import.meta.url)
)

let speciesCache = null

async function getSpecies () {
  if (!speciesCache) {
    const csvContent = await readFile(csvPath, 'utf-8')

    speciesCache = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true
    })
  }

  return speciesCache
}

function normalize (value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// GET search by common or botanical name
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q
    const limit = Number(req.query.limit ?? 20)

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A search query (q) is required'
      })
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer between 1 and 100'
      })
    }

    const species = await getSpecies()
    const searchTerm = normalize(query)

    const results = species
      .filter(plant => {
        const commonName = normalize(plant['Common Name'])
        const botanicalName = normalize(plant['Botanical Name'])

        return commonName.includes(searchTerm) ||
          botanicalName.includes(searchTerm)
      })
      .sort((a, b) => {
        const score = plant => {
          const common = normalize(plant['Common Name'])
          const botanical = normalize(plant['Botanical Name'])

          if (common === searchTerm || botanical === searchTerm) return 0
          if (common.startsWith(searchTerm) || botanical.startsWith(searchTerm)) return 1

          return 2
        }

        return score(a) - score(b)
      })

    const totalMatches = results.length

    const data = results.slice(0, limit).map(plant => ({
      id: plant['Plant ID'],
      code: plant['Plant Code'],
      botanicalName: plant['Botanical Name'],
      commonName: plant['Common Name'],
      plantType: plant['Plant Type'],
      waterNeeds: plant['Water Needs'],
      lightNeeds: plant['Light Needs'],
      climateZones: plant['Climate Zones']
    }))

    return res.status(200).json({
      success: true,
      query: query.trim(),
      totalMatches,
      returned: data.length,
      data
    })
  } catch (error) {
    next(error)
  }
})

// GET species by ID
router.get('/:id', async (req, res, next) => {
  try {
    const species = await getSpecies()

    const plant = species.find(
      item => String(item['Plant ID']) === req.params.id
    )

    if (!plant) {
      return res.status(404).json({
        error: 'Species not found'
      })
    }

    return res.status(200).json(plant)
  } catch (error) {
    next(error)
  }
})

// GET all species
router.get('/', async (req, res, next) => {
  try {
    const species = await getSpecies()
    return res.status(200).json(species)
  } catch (error) {
    next(error)
  }
})

// POST create a species
router.post('/', async (req, res, next) => {
  try {
    const species = await getSpecies()
    const newPlant = req.body

    if (!newPlant || typeof newPlant !== 'object' || Array.isArray(newPlant)) {
      return res.status(400).json({
        error: 'Invalid request body'
      })
    }

    const requiredFields = [
      'Plant ID',
      'Botanical Name',
      'Common Name'
    ]

    const missingFields = requiredFields.filter(
      field => !String(newPlant[field] ?? '').trim()
    )

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      })
    }

    const existingPlant = species.find(
      plant => String(plant['Plant ID']) === String(newPlant['Plant ID'])
    )

    if (existingPlant) {
      return res.status(409).json({
        error: 'A species with this ID already exists'
      })
    }

    species.push(newPlant)

    return res.status(201).json(newPlant)
  } catch (error) {
    next(error)
  }
})

// PUT update a species
router.put('/:id', async (req, res, next) => {
  try {
    const species = await getSpecies()

    const index = species.findIndex(
      plant => String(plant['Plant ID']) === req.params.id
    )

    if (index === -1) {
      return res.status(404).json({
        error: 'Species not found'
      })
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        error: 'Invalid request body'
      })
    }

    // The ID cannot be changed
    const { ['Plant ID']: ignoredId, ...updates } = req.body

    species[index] = {
      ...species[index],
      ...updates,
      'Plant ID': species[index]['Plant ID']
    }

    return res.status(200).json(species[index])
  } catch (error) {
    next(error)
  }
})

// DELETE a species
router.delete('/:id', async (req, res, next) => {
  try {
    const species = await getSpecies()

    const index = species.findIndex(
      plant => String(plant['Plant ID']) === req.params.id
    )

    if (index === -1) {
      return res.status(404).json({
        error: 'Species not found'
      })
    }

    species.splice(index, 1)

    return res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
