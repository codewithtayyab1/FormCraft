// Sets env vars before any module is required.
// Keeps tests isolated from the real .env file.
process.env.JWT_SECRET = 'test-secret-do-not-use-in-production'
process.env.NODE_ENV   = 'test'
