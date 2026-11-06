import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe('Gardens API', () => {
  it('GET /api/gardens should return an array', async () => {
    const res = await request(app).get('/api/gardens')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/gardens should add a new garden', async () => {
    const res = await request(app)
      .post('/api/gardens')
      .send({ name: 'Balcony', type: 'outdoor', city: 'Lyon' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it('POST /api/gardens should return 400 if a field is missing', async () => {
    const res = await request(app)
      .post('/api/gardens')
      .send({ name: 'Balcony' })
    expect(res.status).toBe(400)
  })
})
