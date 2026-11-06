/**
 * Integration test for GET /health.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

const validBody = {
  plantId: 3,
  kind: 'care',
  action: 'arrosage',
  heightCm: 20,
  symptoms: ['dryness'],
  photoUrl: 'http://example.com/photo.jpg',
  source: 'user'
}

const createLog = async (overrides = {}) => {
  const res = await request(app)
    .post('/api/care-logs')
    .send({ ...validBody, ...overrides })
  return res.body
}

describe('GET /api/care-logs', () => {
  it('returns 200 and the plant history', async () => {
    const res = await request(app).get('/api/care-logs?plantId=3')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.every(l => l.plantId === 3)).toBe(true)
  })

  it('returns 200 and an empty array for a plant without logs', async () => {
    const res = await request(app).get('/api/care-logs?plantId=999')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns 200 and all logs when plantId is not provided', async () => {
    const res = await request(app).get('/api/care-logs')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(2)
  })
})

describe('POST /api/care-logs', () => {
  it('returns 201 and an id', async () => {
    const res = await request(app)
      .post('/api/care-logs')
      .send({ ...validBody, action: 'rempotage' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it('makes the new log appear in the plant history', async () => {
    const log = await createLog({ plantId: 3, action: 'engrais' })
    const res = await request(app).get('/api/care-logs?plantId=3')
    expect(res.body.some(l => l.id === log.id)).toBe(true)
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
      .send(createLog({ action: 'danse' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 if kind, source, symptoms or heightCm are invalid', async () => {
    const invalidBodies = [
      { kind: 'inconnu' },
      { source: 'robot' },
      { symptoms: 'dryness' },
      { heightCm: -5 }
    ]
    for (const invalid of invalidBodies) {
      const res = await request(app)
        .post('/api/care-logs')
        .send({ ...validBody, ...invalid })
      expect(res.status).toBe(400)
    }
  })

  it('returns 400 if the body is empty', async () => {
    const res = await request(app).post('/api/care-logs').send()
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/care-logs/:id', () => {
  it('returns 200 and the updated log', async () => {
    const log = await createLog()
    const res = await request(app)
      .put(`/api/care-logs/${log.id}`)
      .send({ action: 'engrais', heightCm: 50 })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: log.id, action: 'engrais', heightCm: 50 })
  })

  it('returns 404 if the log does not exist', async () => {
    const res = await request(app).put('/api/care-logs/99999').send({ action: 'taille' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/care-logs/:id', () => {
  it('returns 204 and removes the log', async () => {
    const log = await createLog({ plantId: 4 })
    const res = await request(app).delete(`/api/care-logs/${log.id}`)
    expect(res.status).toBe(204)

    const history = await request(app).get('/api/care-logs?plantId=4')
    expect(history.body.some(l => l.id === log.id)).toBe(false)
  })

  it('returns 404 if the log does not exist', async () => {
    const res = await request(app).delete('/api/care-logs/99999')
    expect(res.status).toBe(404)
  })
})
