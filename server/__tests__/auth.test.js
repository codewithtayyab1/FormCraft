const request = require('supertest')
const app     = require('../app')

const BASE    = '/api/auth'
const USER    = { name: 'Alice', email: 'alice@test.com', password: 'password123' }

const signup = (data = USER) => request(app).post(`${BASE}/signup`).send(data)
const login  = (email, password) => request(app).post(`${BASE}/login`).send({ email, password })

describe('Auth — /api/auth', () => {

  /* ── signup ──────────────────────────────────────────────────────────── */
  describe('POST /signup', () => {
    it('creates a user and returns a JWT + sanitised user', async () => {
      const res = await signup()
      expect(res.status).toBe(201)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe(USER.email)
      expect(res.body.user.password).toBeUndefined() // must not leak password
    })

    it('rejects a duplicate email with 409', async () => {
      await signup()
      const res = await signup()
      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/already exists/)
    })

    it('rejects missing fields with 400', async () => {
      const res = await signup({ email: 'x@x.com', password: 'abc123' }) // no name
      expect(res.status).toBe(400)
    })

    it('rejects a password shorter than 6 chars with 400', async () => {
      const res = await signup({ ...USER, password: '123' })
      expect(res.status).toBe(400)
    })

    it('rejects an invalid email with 400', async () => {
      const res = await signup({ ...USER, email: 'not-an-email' })
      expect(res.status).toBe(400)
    })
  })

  /* ── login ───────────────────────────────────────────────────────────── */
  describe('POST /login', () => {
    beforeEach(() => signup())

    it('returns a token on correct credentials', async () => {
      const res = await login(USER.email, USER.password)
      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe(USER.email)
    })

    it('returns 401 on wrong password', async () => {
      const res = await login(USER.email, 'wrongpassword')
      expect(res.status).toBe(401)
    })

    it('returns 401 on unknown email', async () => {
      const res = await login('nobody@test.com', 'password123')
      expect(res.status).toBe(401)
    })
  })

  /* ── /me ─────────────────────────────────────────────────────────────── */
  describe('GET /me', () => {
    it('returns the logged-in user when token is valid', async () => {
      const { body: { token } } = await signup()
      const res = await request(app).get(`${BASE}/me`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body.user.email).toBe(USER.email)
    })

    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get(`${BASE}/me`)
      expect(res.status).toBe(401)
    })

    it('returns 401 when token is malformed', async () => {
      const res = await request(app).get(`${BASE}/me`)
        .set('Authorization', 'Bearer not-a-real-token')
      expect(res.status).toBe(401)
    })
  })
})
