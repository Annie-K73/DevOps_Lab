import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('Species API', () => {
  // Test 1: Search species by common name
  it('GET /api/species/search should find species by common name', async () => {
    const res = await request(app)
      .get('/api/species/search?q=lavender')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  // Test 2: Search species by botanical name
  it('GET /api/species/search should find species by botanical name', async () => {
    const res = await request(app)
      .get('/api/species/search?q=Lavandula')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  // Test 3: Search should be case-insensitive
  it('GET /api/species/search should ignore uppercase and lowercase', async () => {
    const res = await request(app)
      .get('/api/species/search?q=LAVENDER')

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  // Test 4: Search should support partial matches
  it('GET /api/species/search should support partial names', async () => {
    const res = await request(app)
      .get('/api/species/search?q=lav')

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  // Test 5: Search with no matching species
  it('GET /api/species/search should return an empty array when no species match', async () => {
    const res = await request(app)
      .get('/api/species/search?q=nonexistentplant123')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.totalMatches).toBe(0)
  })

  // Test 6: Missing search parameter
  it('GET /api/species/search should return 400 when query is missing', async () => {
    const res = await request(app)
      .get('/api/species/search')

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  // Test 7: Invalid limit
  it('GET /api/species/search should return 400 when limit is invalid', async () => {
    const res = await request(app)
      .get('/api/species/search?q=lavender&limit=500')

    expect(res.status).toBe(400)
  })

  // Test 8: Limit results
  it('GET /api/species/search should respect the result limit', async () => {
    const res = await request(app)
      .get('/api/species/search?q=a&limit=2')

    expect(res.status).toBe(200)
    expect(res.body.returned).toBeLessThanOrEqual(2)
  })
})
