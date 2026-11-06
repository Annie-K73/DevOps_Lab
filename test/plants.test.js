import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('Plants API', () => {
  it('GET/api/plants should return an array', async () => {
    const res = await request(app).get('/api/plants')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST/api/plants should add a new plant', async () => {
    const res = await request(app).post('/api/plants').send({ name: 'Tulip', color: '#FF0000' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })
})
