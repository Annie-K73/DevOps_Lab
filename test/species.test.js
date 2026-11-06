import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe('Species API', () => {
  it('should load the CSV successfully', async () => {
    const res = await request(app)
      .get('/api/species/search?q=lavender')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should search by common name', async () => {
    const res = await request(app)
      .get('/api/species/search?q=lavender')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should search by botanical name', async () => {
    const res = await request(app)
      .get('/api/species/search?q=Lavandula')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should support case-insensitive searches', async () => {
    const res = await request(app)
      .get('/api/species/search?q=LAVENDER')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should support partial searches', async () => {
    const res = await request(app)
      .get('/api/species/search?q=lav')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should return an empty array when no species match', async () => {
    const res = await request(app)
      .get('/api/species/search?q=nonexistentplant123')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.totalMatches).toBe(0)
  })

  it('should reject an empty search query', async () => {
    const res = await request(app)
      .get('/api/species/search')

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should reject an invalid limit', async () => {
    const res = await request(app)
      .get('/api/species/search?q=lavender&limit=500')

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should respect the result limit', async () => {
    const res = await request(app)
      .get('/api/species/search?q=a&limit=2')

    expect(res.status).toBe(200)
    expect(res.body.returned).toBeLessThanOrEqual(2)
  })
})
