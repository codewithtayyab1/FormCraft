const request = require('supertest')
const app     = require('../app')

/* ── helpers ──────────────────────────────────────────────────────────────── */
const createUser = async ({ name, email }) => {
  const res = await request(app).post('/api/auth/signup')
    .send({ name, email, password: 'password123' })
  return res.body.token
}

const createForm = (token, body = {}) =>
  request(app).post('/api/forms').set('Authorization', `Bearer ${token}`).send(body)

const getForm   = (id, token) => request(app).get(`/api/forms/${id}`).set('Authorization', `Bearer ${token}`)
const updateForm = (id, token, body) => request(app).put(`/api/forms/${id}`).set('Authorization', `Bearer ${token}`).send(body)
const deleteForm = (id, token) => request(app).delete(`/api/forms/${id}`).set('Authorization', `Bearer ${token}`)

/* ── tests ────────────────────────────────────────────────────────────────── */
describe('Forms — /api/forms', () => {
  let tokenA, tokenB

  beforeEach(async () => {
    tokenA = await createUser({ name: 'Alice', email: 'alice@test.com' })
    tokenB = await createUser({ name: 'Bob',   email: 'bob@test.com'   })
  })

  /* ── create ──────────────────────────────────────────────────────────── */
  describe('POST /api/forms', () => {
    it('creates a blank form with default title', async () => {
      const res = await createForm(tokenA)
      expect(res.status).toBe(201)
      expect(res.body.title).toBe('Untitled form')
      expect(res.body.shareId).toBeDefined()
    })

    it('creates a pre-filled form when body contains title + fields', async () => {
      const res = await createForm(tokenA, {
        title: 'Customer Survey',
        fields: [{ id: 'f1', type: 'short_text', label: 'Name', required: true, options: [], placeholder: '' }],
      })
      expect(res.status).toBe(201)
      expect(res.body.title).toBe('Customer Survey')
      expect(res.body.fields).toHaveLength(1)
    })

    it('returns 401 when called without a token', async () => {
      const res = await request(app).post('/api/forms')
      expect(res.status).toBe(401)
    })
  })

  /* ── list ────────────────────────────────────────────────────────────── */
  describe('GET /api/forms', () => {
    it("returns only the caller's own forms", async () => {
      await createForm(tokenA)
      await createForm(tokenA)
      await createForm(tokenB)
      const res = await request(app).get('/api/forms').set('Authorization', `Bearer ${tokenA}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })

    it('includes responseCount in the listing', async () => {
      await createForm(tokenA)
      const res = await request(app).get('/api/forms').set('Authorization', `Bearer ${tokenA}`)
      expect(res.body[0]).toHaveProperty('responseCount')
    })
  })

  /* ── get one ─────────────────────────────────────────────────────────── */
  describe('GET /api/forms/:id', () => {
    let formId

    beforeEach(async () => {
      formId = (await createForm(tokenA)).body._id
    })

    it('owner can read their own form', async () => {
      const res = await getForm(formId, tokenA)
      expect(res.status).toBe(200)
    })

    it('non-owner gets 403', async () => {
      const res = await getForm(formId, tokenB)
      expect(res.status).toBe(403)
    })

    it('unauthenticated request gets 401', async () => {
      const res = await request(app).get(`/api/forms/${formId}`)
      expect(res.status).toBe(401)
    })
  })

  /* ── update ──────────────────────────────────────────────────────────── */
  describe('PUT /api/forms/:id', () => {
    let formId

    beforeEach(async () => {
      formId = (await createForm(tokenA)).body._id
    })

    it('owner can update title and fields', async () => {
      const res = await updateForm(formId, tokenA, {
        title: 'Updated title',
        fields: [{ id: 'q1', type: 'email', label: 'Email', required: true, options: [], placeholder: '' }],
      })
      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Updated title')
      expect(res.body.fields).toHaveLength(1)
    })

    it('owner can publish the form', async () => {
      const res = await updateForm(formId, tokenA, { isPublished: true })
      expect(res.status).toBe(200)
      expect(res.body.isPublished).toBe(true)
    })

    it('non-owner gets 403', async () => {
      const res = await updateForm(formId, tokenB, { title: 'Hacked' })
      expect(res.status).toBe(403)
    })
  })

  /* ── delete ──────────────────────────────────────────────────────────── */
  describe('DELETE /api/forms/:id', () => {
    let formId

    beforeEach(async () => {
      formId = (await createForm(tokenA)).body._id
    })

    it('owner can delete their form', async () => {
      const del = await deleteForm(formId, tokenA)
      expect(del.status).toBe(200)
      // Confirm it's gone
      const get = await getForm(formId, tokenA)
      expect(get.status).toBe(404)
    })

    it('non-owner gets 403 and form is untouched', async () => {
      const res = await deleteForm(formId, tokenB)
      expect(res.status).toBe(403)
      const get = await getForm(formId, tokenA)
      expect(get.status).toBe(200)
    })
  })
})
