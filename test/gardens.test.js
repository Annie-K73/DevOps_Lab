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

  it('GET /api/gardens/:id returns the garden', async () => {
    const res = await request(app).get('/api/gardens/1')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id', 1)
  })

  it('GET /api/gardens/:id returns 404 if not found', async () => {
    const res = await request(app).get('/api/gardens/9999')
    expect(res.status).toBe(404)
  })

  it('PUT /api/gardens/:id updates a garden', async () => {
    const res = await request(app)
      .put('/api/gardens/1')
      .send({ city: 'Lyon' })
    expect(res.status).toBe(200)
    expect(res.body.city).toBe('Lyon')
    expect(res.body.name).toBe('Backyard')
  })

  it('PUT /api/gardens/:id returns 404 if not found', async () => {
    const res = await request(app).put('/api/gardens/9999').send({ city: 'Lyon' })
    expect(res.status).toBe(404)
  })

  it('DELETE /api/gardens/:id deletes a garden', async () => {
    const created = await request(app)
      .post('/api/gardens')
      .send({ name: 'ToDelete', type: 'indoor' })
    const res = await request(app).delete(`/api/gardens/${created.body.id}`)
    expect(res.status).toBe(204)

    const check = await request(app).get(`/api/gardens/${created.body.id}`)
    expect(check.status).toBe(404)
  })

  it('DELETE /api/gardens/:id returns 404 if not found', async () => {
    const res = await request(app).delete('/api/gardens/9999')
    expect(res.status).toBe(404)
  })
})
