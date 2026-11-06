/**
 * Integration test for GET /health.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('GET /api/care-logs', () => {
  it('returns 200 status and the plant history', async () => {
    const res = await request(app).get('/api/care-logs?plantId=1')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.every(l => l.plantId)).toBe(true)
  })

  it('returns 400 if plantId is missing', async () => {
    const res = await request(app).get('/api/care-logs')
    expect(res.status).toBe(400)
  })
})

describe('POST /api/care-logs', () => {
  it('returns 201 and an id', async () => {
    const res = await request(app)
      .post('/api/care-logs')
      .send({ plantId: 1, action: 'rempotage' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it('returns 400 if plantId is missing', async () => {
    const res = await request(app).post('/api/care-logs').send({ action: 'arrosage' })
    expect(res.status).toBe(400)
  })

  it('returns 400 if action is missing', async () => {
    const res = await request(app).post('/api/care-logs').send({ plantId: 1 })
    expect(res.status).toBe(400)
  })

  it('returns 400 if action is unknown', async () => {
    const res = await request(app)
      .post('/api/care-logs')
      .send({ plantId: 1, action: 'danse' })
    expect(res.status).toBe(400)
  })
})
