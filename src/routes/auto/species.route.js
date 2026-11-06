import express from 'express'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { parse } from 'csv-parse/sync'

const router = express.Router()

// Chemin vers le CSV situé dans DevOps_Lab/data/
const csvPath = fileURLToPath(
  new URL('../../../data/waterwise-plants.csv', import.meta.url)
)

let speciesCache = null

async function getSpecies() {
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

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q
    const limit = Number(req.query.limit ?? 20)

    // Validate search query
    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A search query (q) is required'
      })
    }

    // Validate result limit
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer between 1 and 100'
      })
    }

    const species = await getSpecies()
    const searchTerm = normalize(query)

    // Search by common name or botanical name
    const results = species
      .filter(plant => {
        const commonName = normalize(plant['Common Name'])
        const botanicalName = normalize(plant['Botanical Name'])

        return commonName.includes(searchTerm) ||
          botanicalName.includes(searchTerm)
      })
      // Prioritize exact matches, then names starting with the query
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
    console.error('SPECIES ROUTE ERROR:', error)
    next(error)
  }
})

export default router
