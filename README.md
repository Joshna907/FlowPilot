# FlowPilot

Voice-first workflow automation builder.

FlowPilot lets a user describe an automation in plain English, review the generated workflow graph, fill missing setup, test a step, save it, and run it.

## What It Does

- Turns voice/text prompts into workflow drafts.
- Builds a visual automation graph.
- Supports manual starts, webhooks, HTTP requests, Slack, Discord, WhatsApp, and email-style actions.
- Lets users test one step before running the full workflow.
- Stores workflows in Postgres.
- Queues workflow runs through Redis.
- Runs automations in a separate worker process.

## Why FlowPilot

Zapier starts with apps and forms.

FlowPilot starts with intent:

> "When I run this manually, send a Slack message."

The product then drafts the workflow, shows what needs setup, and lets the user test before running.

## Architecture

```txt
frontend/   Next.js app: landing page, workflow dashboard, visual editor
backend/    Express API: workflows, credentials, voice planning, run queue
execution/  Worker: reads queued runs and executes workflow nodes
infra/      Docker Compose for Postgres and Redis
```

## Core Flow

1. User creates or opens a workflow.
2. User uses Voice Builder or adds steps manually.
3. Frontend saves nodes and links to backend.
4. Backend stores workflow data in Postgres.
5. User runs workflow.
6. Backend validates setup and queues the run in Redis.
7. Worker reads the run, loads the workflow graph, and executes each step.
8. Recent runs show whether it succeeded or failed.

## Local Setup

Start infra:

```powershell
docker compose -f infra/docker-compose.yml up -d
```

Backend:

```powershell
cd backend
pnpm install
$env:DATABASE_URL="postgresql://admin:password@localhost:5432/n8n"
$env:JWT_SECRET="dev-secret"
$env:BASE_URL="http://localhost:3001"
$env:CLIENT_URL="http://localhost:3000"
$env:GROQ_API_KEY="your_groq_key"
$env:GROQ_MODEL="llama-3.3-70b-versatile"
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm dlx tsx index.ts
```

Worker:

```powershell
cd execution
pnpm install
$env:DATABASE_URL="postgresql://admin:password@localhost:5432/n8n"
pnpm dlx tsx index.ts
```

Frontend:

```powershell
cd frontend
pnpm install
pnpm run dev
```

Open:

```txt
http://localhost:3000
```

## Demo Script

1. Open FlowPilot.
2. Create a new workflow.
3. Open Voice Builder.
4. Try: `When I run this manually, send a Slack message.`
5. Apply the draft to canvas.
6. Open the Slack step.
7. Add Slack webhook URL and message.
8. Click `Test step`.
9. Click `Save`.
10. Click `Run workflow`.

## Deployment Notes

- Deploy `frontend` to Vercel, Netlify, or any Next.js host.
- Deploy `backend` as a Node service.
- Deploy `execution` as a separate worker service.
- Use managed Postgres and Redis in production.
- Store API keys and webhook secrets in environment variables.

## Status

This is a portfolio/demo project focused on:

- voice-first workflow creation
- Zapier-style editor UX
- real Slack/Discord/webhook execution paths
- explainable backend-worker architecture
