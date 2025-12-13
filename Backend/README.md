# Simple Backend (Nonce Auth + Postgres)

Minimal Express server to support wallet nonce authentication and health checks. Nonces are persisted in Postgres (the `db` service in docker-compose).

## Prerequisites
- Node 18+ (if running locally) or use Docker

## Setup
```bash
cd Backend
npm install
npm run dev   # nodemon, PORT defaults to 3000
# or: npm start
```

## Endpoints
- `GET /health` → `{ status: "ok" }` (checks DB connectivity)
- `GET /auth/nonce?address=0x...` → returns `{ nonce }`, stores in Postgres
- `POST /auth/verify` with JSON `{ address, signature }` → verifies signature using `ethers.verifyMessage`, deletes nonce, returns `{ token }` (mock token)

## Environment Variables
- `PORT` (default `3000`)
- `ALLOWED_ORIGIN` (default `*`)
- `DATABASE_URL` (default `postgresql://postgres:postgres@localhost:5432/postgres`)

## Next Steps (Production)
- Replace mock token with JWT/session issuance.
- Add nonce expiration/cleanup and rate limiting.
- Add structured logging and HTTPS proxying.
