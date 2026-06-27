const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterEach(async () => {
  // Wipe every collection between tests so each test starts clean
  await Promise.all(
    Object.values(mongoose.connection.collections).map(c => c.deleteMany({}))
  )
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})
