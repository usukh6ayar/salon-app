# Salon App API

Node.js + Express backend for the salon app.

## Setup

```bash
cp .env.example .env
npm install
```

Edit `.env` with your database URL and JWT secret.

## Scripts

| Command       | Description                    |
|---------------|--------------------------------|
| `npm run dev` | Start with nodemon (hot reload)|
| `npm start`   | Start production server        |

## Health check

```bash
curl http://localhost:3000/health
```

Response: `{ "status": "ok" }`
