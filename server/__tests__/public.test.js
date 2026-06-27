const request = require('supertest')
const app     = require('../app')

/* ── helpers ──────────────────────────────────────────────────────────────── */
const createUser = async () => {
  const res = await request(app).post('/api/auth/signup')
    .send({ name: 'Owner', email: 'owner@test.com', password: 'password123' })
  return res.body.token
}

describe('Public form — /api/public', () => {
  let token, formId, shareId

  beforeEach(async () => {
    token = await createUser()

    // Create a form with one required and one optional field
    const formRes = await request(app).post('/api/forms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Survey',
        fields: [
          { id: 'q1', type: 'short_text', label: 'Name',  required: true,  options: [], placeholder: '' },
          { id: 'q2', type: 'email',       label: 'Email', required: false, options: [], placeholder: '' },
        ],
      })

    formId  = formRes.body._id
    shareId = formRes.body.shareId
  })

  /* ── GET /api/public/forms/:shareId ─────────────────────────────────── */
  describe('GET /api/public/forms/:shareId', () => {
    it('returns 404 when the form is not published', async () => {
      const res = await request(app).get(`/api/public/forms/${shareId}`)
      expect(res.status).toBe(404)
    })

    it('returns public form data after publishing', async () => {
      await request(app).put(`/api/forms/${formId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isPublished: true })

      const res = await request(app).get(`/api/public/forms/${shareId}`)
      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Test Survey')
      expect(res.body.fields).toHaveLength(2)
      expect(res.body.owner).toBeUndefined() // must NOT leak owner
    })
  })

  /* ── POST /api/public/forms/:shareId/submit (published form) ─────────── */
  describe('POST /api/public/forms/:shareId/submit', () => {
    beforeEach(async () => {
      await request(app).put(`/api/forms/${formId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isPublished: true })
    })

    it('saves a valid response (201)', async () => {
      const res = await request(app).post(`/api/public/forms/${shareId}/submit`)
        .send({ answers: [{ fieldId: 'q1', value: 'Alice' }] })
      expect(res.status).toBe(201)
      expect(res.body.message).toMatch(/recorded/i)
    })

    it('rejects when a required field is missing (400)', async () => {
      const res = await request(app).post(`/api/public/forms/${shareId}/submit`)
        .send({ answers: [] }) // q1 required but absent
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/required/i)
    })

    it('links the saved response to the correct form', async () => {
      await request(app).post(`/api/public/forms/${shareId}/submit`)
        .send({ answers: [{ fieldId: 'q1', value: 'Bob' }] })

      const res = await request(app).get(`/api/forms/${formId}/responses`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].answers.find(a => a.fieldId === 'q1').value).toBe('Bob')
    })

    it('returns 404 when trying to submit to an unpublished form via wrong shareId', async () => {
      const res = await request(app).post('/api/public/forms/nonexistent-share/submit')
        .send({ answers: [] })
      expect(res.status).toBe(404)
    })
  })
})
