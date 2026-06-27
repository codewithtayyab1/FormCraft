const request = require('supertest')
const app     = require('../app')

const createUser = async ({ name, email }) => {
  const res = await request(app).post('/api/auth/signup')
    .send({ name, email, password: 'password123' })
  return res.body.token
}

describe('Responses — /api/forms/:id/responses', () => {
  let ownerToken, otherToken, formId, shareId

  beforeEach(async () => {
    ownerToken = await createUser({ name: 'Owner', email: 'owner@test.com' })
    otherToken = await createUser({ name: 'Other', email: 'other@test.com' })

    // Create and publish a form
    const formRes = await request(app).post('/api/forms')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Resp Test Form',
        fields: [{ id: 'q1', type: 'short_text', label: 'Msg', required: false, options: [], placeholder: '' }],
      })

    formId  = formRes.body._id
    shareId = formRes.body.shareId

    await request(app).put(`/api/forms/${formId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ isPublished: true })

    // Submit two responses
    await request(app).post(`/api/public/forms/${shareId}/submit`).send({ answers: [{ fieldId: 'q1', value: 'First'  }] })
    await request(app).post(`/api/public/forms/${shareId}/submit`).send({ answers: [{ fieldId: 'q1', value: 'Second' }] })
  })

  it('owner can fetch all responses for their form', async () => {
    const res = await request(app).get(`/api/forms/${formId}/responses`)
      .set('Authorization', `Bearer ${ownerToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it('non-owner gets 403', async () => {
    const res = await request(app).get(`/api/forms/${formId}/responses`)
      .set('Authorization', `Bearer ${otherToken}`)
    expect(res.status).toBe(403)
  })

  it('unauthenticated request gets 401', async () => {
    const res = await request(app).get(`/api/forms/${formId}/responses`)
    expect(res.status).toBe(401)
  })

  it('summary endpoint returns total and fieldSummaries', async () => {
    const res = await request(app).get(`/api/forms/${formId}/responses/summary`)
      .set('Authorization', `Bearer ${ownerToken}`)
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2)
    expect(res.body.byDay).toBeDefined()
  })

  it('owner can delete a single response', async () => {
    const listRes = await request(app).get(`/api/forms/${formId}/responses`)
      .set('Authorization', `Bearer ${ownerToken}`)
    const responseId = listRes.body[0]._id

    const del = await request(app).delete(`/api/forms/${formId}/responses/${responseId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
    expect(del.status).toBe(200)

    // Confirm it's gone
    const afterDel = await request(app).get(`/api/forms/${formId}/responses`)
      .set('Authorization', `Bearer ${ownerToken}`)
    expect(afterDel.body).toHaveLength(1)
  })
})
