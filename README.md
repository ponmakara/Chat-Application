# Chat Application

Full-stack real-time chat starter built with React, Node.js, Socket.io, and MySQL.

## What is included

- JWT-based register/login flow
- User sidebar with online/offline presence
- One-to-one messaging
- Message history loaded from MySQL
- Socket.io real-time updates
- Clean project separation between `frontend/` and `backend/`

## Project structure

```text
frontend/
  src/
    context/              shared React auth state
    features/
      auth/               auth pages, components, services
      chat/               chat pages, components, services
    lib/                  shared API and socket helpers
backend/
  src/
    config/               database connection
    middleware/           JWT protection
    modules/
      auth/               auth routes, controller, service
      chat/               chat routes, controller, service
      users/              user routes, controller, service
    sockets/              Socket.io setup
```

## Quick start

1. Install dependencies:

```bash
npm run install:all
```

2. Create environment files:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Create the MySQL schema:

- Run the SQL inside [backend/database/schema.sql](/C:/Users/MAKARA.PON/Desktop/Chat%20App/backend/database/schema.sql)

4. Start the backend:

```bash
npm run dev:backend
```

5. Start the frontend in another terminal:

```bash
npm run dev:frontend
```

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/chat/messages/:userId`
- `POST /api/chat/messages/:userId`

## Suggested next upgrades

- Add conversation list previews and unread counts
- Move presence state to Redis when scaling beyond one server
- Add typing indicators, attachments, and read receipts
- Add form validation and toast notifications
