<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Architecture

Feature-first, with a server-only Data Access Layer. Follows the Next.js
"Data Access Layer" guidance in `node_modules/next/dist/docs/01-app/02-guides/data-security.md`.

```
src/
  app/                  routes only — composition, no data access
  components/           UI shared across features
  features/<name>/
    data/               'server-only': authorization + queries + DTOs
    actions/            'use server': parse input, delegate to data/, revalidate
    ui/                 components belonging to this feature
  lib/                  framework/infra singletons (db clients, auth, form-state)
  paths.ts              the only place route strings are written
```

Rules:

- **Only `features/*/data/` may import a database client** — `@/lib/prisma` or
  `@/lib/ph-stocks-db`. Nothing in `app/`, `components/`, or `ui/` touches a
  database.
- **There are two databases.** `@/lib/prisma` is this app's own, the one it
  owns and migrates. `@/lib/ph-stocks-db` is a read-only `pg` pool over the PH
  market data (`market_data`, `PH_STOCKS_DATABASE_URL`) — a second instance
  owned and migrated by another application. It is a plain pool rather than a
  second Prisma client because Prisma cannot hold two datasources in one
  schema, and a generated model would invite `prisma migrate` to enforce our
  schema against a table we do not control. Never write to it.
- **Every data function calls `requireUser()` first.** Server Actions are
  reachable by direct POST, so the page-level check is not the boundary — the
  data layer is. `PageGuard` is presentation only.
- **Data functions return DTOs from `data/dto.ts`, never Prisma models or raw
  query rows.** Use Prisma `select` to fetch only the DTO's fields; with raw
  SQL, map the rows to the DTO inside the data function.
- **Actions stay thin**: validate `FormData` with Zod, call one data function,
  then `revalidatePath` / `redirect`. Wrap the call in `try/catch` and start the
  catch with `unstable_rethrow(err)` so framework control-flow errors pass
  through. Never return a raw error message to the client — use
  `toUnexpectedFormError`.
- **Features do not import each other**, except from `features/auth`, which is
  the shared kernel.
