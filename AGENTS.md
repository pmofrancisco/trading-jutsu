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

- **Only `features/*/data/` may import a database client** — `@/lib/ph-stocks-db`
  or `@/lib/us-stocks-db`, and a feature reads only its own market's pool.
  Nothing in `app/`, `components/`, or `ui/` touches a database.
- **None of the databases are ours.** `@/lib/ph-stocks-db` and
  `@/lib/us-stocks-db` are read-only `pg` pools over the PH and US market data —
  a `market_data` table in each, behind `PH_STOCKS_DATABASE_URL` and
  `US_STOCKS_DATABASE_URL`. They are wholly separate instances, same columns but
  their own symbols and sessions, so the two never share a pool. Each is owned
  and migrated by another application; never write to either. This app has no
  schema and no ORM of its own: it reads with hand-written SQL through plain
  pools, so nothing here can migrate a table we do not control. Adding a
  database this app owns means adding that ORM back deliberately.
- **Every data function calls `requireUser()` first.** Server Actions are
  reachable by direct POST, so the page-level check is not the boundary — the
  data layer is. `PageGuard` is presentation only.
- **Data functions return DTOs from `data/dto.ts`, never raw query rows.**
  Select only the DTO's fields, and map the rows to the DTO inside the data
  function.
- **Actions stay thin**: validate `FormData` with Zod, call one data function,
  then `revalidatePath` / `redirect`. Wrap the call in `try/catch` and start the
  catch with `unstable_rethrow(err)` so framework control-flow errors pass
  through. Never return a raw error message to the client — use
  `toUnexpectedFormError`.
- **Features do not import each other**, except from `features/auth`, which is
  the shared kernel.
