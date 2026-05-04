# Documentation

This page is the entry point for project documentation.

## Active documents

- [Quick Start](./QUICK_START.md): install, run, and verification commands.
- [Architecture](./ARCHITECTURE.md): backend/frontend organization and core conventions.
- [API](./API.md): stable endpoints, response formats, and errors.
- [Deployment target](./DEPLOYMENT_TARGET.md): frontend/API/PostgreSQL separation.
- [Docker deployment](./DOCKER_DEPLOYMENT.md): PM2 -> Docker Compose + Nginx runbook.
- [Project Structure](./PROJECT_STRUCTURE.md): current folders and key files.

## Project status

Current priority is API stability and frontend integration:

- Fastify/TypeScript backend.
- Prisma/PostgreSQL persistence.
- JWT auth with hashed passwords.
- Users, exercises, workouts routes.
- Workouts persisted with exercises and sets.
- API tests with `fastify.inject()`.
- React frontend now includes auth and a first dashboard.

## Historical docs

The files below come from an older setup phase and may contain outdated references:

- `00_START_HERE.txt`
- `GETTING_STARTED.txt`
- `PHASE_0_READY.txt`
- `PHASE_0_SETUP.md`
- `README_SETUP.md`
- `SUMMARY.md`

Do not use them as source of truth without review.

## Maintenance rule

When code changes:

1. Update `README.md` if setup, scripts, or runtime behavior changed.
2. Update `ARCHITECTURE.md` if technical structure changed.
3. Update `QUICK_START.md` if commands changed.
4. Add or update API tests before documenting a route as stable.
