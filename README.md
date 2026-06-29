# Bookstore Management System — NestJS + MikroORM + Vue + PrimeVue (OpenSpec)

Spec-driven scaffold for Claude Code.

## Structure
```
CLAUDE.md             # tech stack + conventions (read first)
back/                 # NestJS API
front/                # Vue 3 app
openspec/
├── project.md
├── specs/            # archived source-of-truth
└── changes/bookstore-system/
    ├── proposal.md   # why + scope
    ├── design.md     # architecture + DBML + MikroORM entities
    ├── tasks.md      # implementation checklist
    └── specs/
        ├── master-data/spec.md
        ├── registration/spec.md
        ├── purchasing/spec.md
        ├── importing/spec.md
        ├── selling/spec.md
        ├── reservation/spec.md
        └── reporting/spec.md
```

## Quick start with Claude Code
1. Open this folder in Claude Code — it reads `CLAUDE.md` automatically.
2. Review `proposal.md` + `design.md`.
3. Tell Claude: "Implement tasks.md section 1, then continue section by section."

## Stack
- Backend: NestJS + MikroORM (`back/`)
- Frontend: Vue 3 + PrimeVue + Vite + Pinia (`front/`)
- DB: MySQL/PostgreSQL — DBML in design.md → https://dbdiagram.io

## Dev commands (after scaffold)
```
cd back  && npm run start:dev
cd front && npm run dev
cd back  && npx mikro-orm migration:up
```
