# PeerPicks

PeerPicks is a social curation platform where users create picks, discuss them, and get real-time notifications for social activity. The stack has a Next.js app (frontend) and an Express/Mongoose API (backend).

## Project structure
- client/web-peerpicks: Next.js 14 (App Router), SSE notification toasts, dashboard UI.
- server: Express + TypeScript + Mongoose (auth, picks, comments, notifications, social actions).
- uploads: Static assets served by the backend.

## Quick start
1) Install dependencies
   - cd server && npm install
   - cd ../client/web-peerpicks && npm install
2) Environment
   - Backend: MONGO_URI is required; PORT defaults to 3000. Email creds optional for password reset.
   - Frontend: NEXT_PUBLIC_API_URL can be empty for same-origin dev; set to http://localhost:3000 when API runs separately.
3) Run dev servers
   - Backend (cwd: server): npm run dev
   - Frontend (cwd: client/web-peerpicks): npm run dev (Next rewrites /api/* to backend)
4) Open http://localhost:3000 (or the port Next prints) and register/login.

## Environment variables (common)
- Backend: MONGO_URI, PORT=3000, JWT_SECRET, EMAIL_USER/EMAIL_PASS (if mailers used).
- Frontend: NEXT_PUBLIC_API_URL (optional; empty means use same origin), NEXT_PUBLIC_APP_URL (optional for links).

## API routes (server)

### Auth
| Method | Path | Purpose | Sample body |
| --- | --- | --- | --- |
| POST | /api/auth/register | Create account | `{ "email": "a@b.com", "password": "Secret123", "fullName": "Alex" }` |
| POST | /api/auth/login | Login | `{ "email": "a@b.com", "password": "Secret123" }` |
| GET | /api/auth/me | Current user | Bearer token cookie/header |

### Picks
| Method | Path | Purpose | Sample body |
| --- | --- | --- | --- |
| GET | /api/picks/feed | Paginated feed | query: page, limit |
| GET | /api/picks/:id | Pick detail | path: id |
| POST | /api/picks | Create pick | `{ "title": "Best tacos", "description": "Downtown list", "images": ["/uploads/x.jpg"] }` |
| PUT | /api/picks/:id | Update pick | `{ "title": "Updated title" }` |
| DELETE | /api/picks/:id | Delete pick | path: id |

### Comments
| Method | Path | Purpose | Sample body |
| --- | --- | --- | --- |
| POST | /api/social/comment | Add comment | `{ "pickId": "<pickId>", "content": "Nice pick!" }` |
| GET | /api/picks/:id/discussion | List comments | path: pick id |
| PUT | /api/social/comment/:id | Edit comment | `{ "content": "Updated text" }` |
| DELETE | /api/social/comment/:id | Remove comment | path: comment id |

### Social actions
| Method | Path | Purpose |
| --- | --- | --- |
| POST | /api/social/vote/:pickId | Upvote a pick |
| POST | /api/social/favorite/:pickId | Toggle favorite |
| POST | /api/social/follow/:userId | Follow a user |

### Notifications
| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/notifications/stream | SSE stream for real-time signals |
| GET | /api/notifications | List notifications |
| GET | /api/notifications/unread-count | Count unread |
| POST | /api/notifications/read | Mark all as read |
| DELETE | /api/notifications/:id | Delete one |

## Frontend notes
- SSE: NotificationProvider and SignalListener connect to /api/notifications/stream and show toasts.
- API endpoints are centralized in client/web-peerpicks/lib/api/endpoints.ts.
- Rewrites in next.config.ts proxy /api/* and /uploads/* to the backend in dev.

## Testing
- Backend (cwd: server)
  - npm test — runs Jest unit/integration suites.
  - npm test -- <pattern> — filter by file name pattern.
- Frontend (cwd: client/web-peerpicks)
  - npm run test:e2e — run Playwright specs in tests/e2e.
  - npx playwright test tests/e2e/<file>.spec.ts — run a single spec.

## Example JSON payloads
- Create pick
```json
{
  "title": "Best pizza spots",
  "description": "NYC slices ranked",
  "images": ["/uploads/pizza.jpg"],
  "categories": ["food", "nyc"]
}
```

- Post comment
```json
{
  "pickId": "64fa...",
  "content": "Love this list!"
}
```

- Login
```json
{
  "email": "user@example.com",
  "password": "Secret123"
}
```

## Deployment notes
- Serve frontend and API under the same origin when possible; otherwise set NEXT_PUBLIC_API_URL to the API base.
- Ensure uploads/ is served by the backend; Next image remotePatterns allow http://localhost:3000/uploads/** in dev.

## Troubleshooting notifications
- In browser Network tab, confirm an EventSource to /api/notifications/stream stays open.
- If API is on another host/port, set NEXT_PUBLIC_API_URL to that origin.
- Self-actions are skipped; use a second account to trigger comment/vote notifications.
