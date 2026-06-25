# Index Backend

Simple Node.js, TypeScript, Express, PostgreSQL, Zod, and OpenAPI backend for the Index assessment.

## Setup

Use the Node version from `.nvmrc`:

```powershell
nvm use
```

Copy the environment file:

```powershell
Copy-Item .env.example .env
```

Install dependencies:

```powershell
npm install
```

For local running, you will probably need PostgreSQL installed and running on your machine.

You may also need to create the PostgreSQL user yourself, or change the values in `.env` to match a user you already have.

Then set up the database:

```powershell
npm run db:setup
```

Start the server:

```powershell
npm run dev
```

The API runs at `http://localhost:3003`.

`npm run db:setup` creates `DB_NAME` if it does not exist yet, then applies `src/db/schema.sql`.

## Swagger Docs

generate by running
```powershell
npm run openapi
```

then the Swagger UI will be available at:

`http://localhost:3003/docs`

## Tests

Run backend tests with:

```powershell
npm test
```

There is also API testing support in two other places:

- `postman/Index Projects API.postman_collection.json` for Postman
- `src/test.rest` for the VS Code REST Client extension

## Project Structure

```text
index-backend/
├── src/
│   ├── config/           # environment config
│   ├── controllers/      # route handlers
│   ├── db/               # pool, schema, local db setup
│   ├── middlewares/      # validation and error handling
│   ├── models/           # SQL access layer
│   ├── openapi/          # OpenAPI registry and generation
│   ├── routes/           # Express routes
│   ├── schemas/          # Zod request/response schemas
│   ├── __tests__/        # Jest tests
│   ├── app.ts            # Express app setup
│   ├── server.ts         # server entry point
│   ├── test.rest         # REST Client requests
│   └── types.ts          # shared backend types
├── postman/              # Postman collection and local environment
├── .env.example          # example environment variables
├── package.json          # scripts and dependencies
└── README.md
```

## Useful Commands

```powershell
npm run dev
npm run db:setup
npm run openapi
npm run build
npm run check
npm test
```
