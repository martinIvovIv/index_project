# Running the application

Easiest way is via docker-compose

```powershell
docker compose up --build
```

Frontend URL: http://localhost:8080
Backend: http://localhost:3003
Backend docs: http://localhost:3003/docs/

Different parts can be ran serarately but the DB might need to be either created by the user and the
`.env` vars need to be updated.

For more information please refer to each project's ReadMe.md file.

# Architecture Overview

## Architecture

All parts were kept simple, except where the decisions had to be taken now, for example with table indexes.
The architecture is layered: models / controllers / routes are separated and zod was used for data validation.


## Database
The database was kept simple per requirements except for adding indexes for the two tables. 
They were added which would have been harder in the future.

A trade off was made early on by having the system made for a single tenant, which will need to be addressed in the future.
A new column can be added to the projects table (or even the tasks table) called `tenant_id`.
The `tenant_id` will be critical for authentication, having different access to different projects and keeping a log of changes.

## Backend
For the backend express was used in combination with Zod for data validation and OpenApi Swagger generation.
Zod schemas were used as a middleware and there's another for error handling.

For now there's no logging and auth but they can be added as middlewares too.
The Auth should be implemented via JWT token which can carry the tenant context and more.

Pagination will also be required for further scaling.

The app is separated into models, which handle storage, controllers for CRUD operations, schemas for validation and routes:
```text
├── src/
│   ├── config/
│   │   └── config.ts        // env vars
│   ├── controllers/
│   │   └── projectController.ts  // CRUD operations
│   │   └── taskController.ts  // CRUD operations
│   ├── middlewares/
│   │   └── errorHandler.ts    // Global typed error handling middleware
│   │   └── validateRequest.ts    // Data validation middleware
│   ├── models/
│   │   └── projectModel.ts          // Define item type and storage
│   │   └── taskModel.ts          // Define item type and storage
│   ├── routes/
│   │   └── projectRoutes.ts    // routes
│   ├── schemas/
│   │   └── schemas.ts    // data validation 
│   ├── openapi/
│   │   └── openapi.ts    // Swagger docs generation 
```

There's good unit test coverage, postman collection and test.rest (vscode extention) for working with the backend.

## Frontend
The frontend uses typescript and Vuetify as component library.
For state management Pinia was used as a store.
Currently there's just one store for both Projects and Tasks as they're closely coupled together
but in general Pinia is meant to be used as many small, light stores.

There's unit tests for the logic and the app is responsive.

## Trade-offs and future improvements

The following were out of scope:
- single tenant architecture that can be easily changed in the future
- authentication can be added (JWT for example) and logging all via middlewares
- pagination will be required as the volume of data increases
- e2e tests
- event driven patterns can be implemented (like for task created / status changed)
- caching when the traffic increases (redis, no frontend request caching)
- rate limiter to protect against malicious actors
- infrastructure as code can be added in the future