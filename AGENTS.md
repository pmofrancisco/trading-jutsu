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
  lib/                  framework/infra singletons (prisma, auth, form-state)
  paths.ts              the only place route strings are written
```

Rules:

- **Only `features/*/data/` may import `@/lib/prisma`.** Nothing in `app/`,
  `components/`, or `ui/` touches the database.
- **Every data function calls `requireUser()` first.** Server Actions are
  reachable by direct POST, so the page-level check is not the boundary — the
  data layer is. `PageGuard` is presentation only.
- **Data functions return DTOs from `data/dto.ts`, never Prisma models.** Use
  Prisma `select` to fetch only the DTO's fields.
- **Actions stay thin**: validate `FormData` with Zod, call one data function,
  then `revalidatePath` / `redirect`. Wrap the call in `try/catch` and start the
  catch with `unstable_rethrow(err)` so framework control-flow errors pass
  through. Never return a raw error message to the client — use
  `toUnexpectedFormError`.
- **Features do not import each other**, except from `features/auth`, which is
  the shared kernel.
