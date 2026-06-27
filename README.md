# FormCraft

No-code form & survey builder — MERN stack monorepo.

## Project structure

```
/client   React + Vite frontend
/server   Node + Express backend
```

## Running locally

**Terminal 1 — backend**
```bash
cd server
npm run dev
```
Runs on http://localhost:5000

**Terminal 2 — frontend**
```bash
cd client
npm run dev
```
Runs on http://localhost:5173

## Testing

### Backend (Jest + Supertest + mongodb-memory-server)
```bash
cd server
npm test
```
Uses an in-memory MongoDB instance — no Atlas connection needed. Covers:
- **Auth**: signup, duplicate-email rejection, login, wrong-password 401, `/me` with and without token
- **Forms**: CRUD for the owner; 403 for any non-owner (the key security invariant)
- **Public form**: 404 when unpublished; valid submit saves a response; required-field validation; response linked to the correct form
- **Responses**: owner access; non-owner 403; summary endpoint; single-response deletion

**35 tests · ~18 s**

### Frontend (Vitest + React Testing Library)
```bash
cd client
npm test          # single run
npm run test:watch  # watch mode
```
Mocks the API and auth context so no server is required. Covers:
- **Login**: renders, validates empty/invalid input, calls `login()` on valid submit, shows server errors
- **Signup**: same pattern plus password-length validation
- **ThemeToggle**: renders all three options, calls `setMode()` on click, marks the active mode
- **PublicForm field rendering**: all 7 field types render the correct element (input, textarea, select, radios, stars, 0–10 NPS buttons); loading and error states

**25 tests · ~6 s**

## Environment

Copy `server/.env` and fill in real values before connecting to MongoDB:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/formcraft
JWT_SECRET=replace_with_a_strong_secret
```
