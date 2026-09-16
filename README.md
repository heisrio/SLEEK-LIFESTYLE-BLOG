# KULTURE

KULTURE is a MongoDB-backed editorial blog for women, covering beauty, style, culture, music, wellness, and news.

## Local setup

1. Start MongoDB locally on `mongodb://127.0.0.1:27017`.
2. Run `npm install` at the repository root and `npm install` in `frontend`.
3. Run `npm run dev` at the repository root.

The API seeds these accounts on first connection:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@kulture.com` | `KultureAdmin2026!` |
| Editor | `editor@kulture.com` | `KultureEditor2026!` |

Set `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `FRONTEND_URL` in the environment to override local defaults.