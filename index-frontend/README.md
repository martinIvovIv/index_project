# Index Frontend

Simple Vue 3 + Vuetify frontend for the projects and tasks assessment.

## Setup

This frontend needs the backend running as well.

Use the Node version from `.nvmrc`:

```powershell
nvm use
```

Copy the frontend environment file:

```powershell
Copy-Item .env.example .env
```

Install frontend dependencies:

```powershell
npm install
```

Set up the backend database in a separate terminal:

```powershell
cd ..\index-backend
Copy-Item .env.example .env
npm install
npm run db:setup
```

Start the backend:

```powershell
cd ..\index-backend
npm run dev
```

Start the frontend in another terminal:

```powershell
npm run dev
```

The frontend usually runs on `http://localhost:5173`.

## Tests
There's (almost) full unit test coverage on the app.
The unit tests use Vitest:

```powershell
npm run test:unit
```

The Cypress e2e tests have been postponed for the next release.