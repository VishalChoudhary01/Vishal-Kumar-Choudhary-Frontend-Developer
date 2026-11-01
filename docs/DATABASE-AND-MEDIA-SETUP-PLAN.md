# Portfolio Database & Media Services — Setup and Implementation Plan

**Document status:** Planning baseline  
**Created:** 1 November 2026  
**Project:** Personal Portfolio — Next.js App Router  
**Services:** MongoDB Atlas + Mongoose, Cloudinary

> This document covers the infrastructure setup and integration foundation. It does not assume which portfolio features will create, edit, or upload records. Feature-specific schemas, API routes, and admin workflows should be designed only after those use cases are confirmed.

---

## 1. Objective

Set up two managed services for the portfolio application:

- **MongoDB Atlas + Mongoose:** persist structured application data, with database access restricted to trusted server-side code.
- **Cloudinary:** store, transform, optimize, and deliver image/media assets. Store asset references and metadata in MongoDB rather than storing the binary files in database documents.

The implementation must preserve the existing portfolio UI and behavior. Database and media integration should be introduced incrementally and must not add client-side access to secrets.

## 2. Confirmed setup and current status

### MongoDB Atlas

| Item | Current selection / status |
|---|---|
| Atlas organization | Existing personal organization |
| Atlas project | `portfolio` |
| Cluster | `portfolio` |
| Cluster tier | Free (M0) |
| Cloud provider | AWS |
| Region | Mumbai (`ap-south-1`) |
| MongoDB version | 8.0 |
| Storage shown in Atlas | 0.5 GB |
| ODM selected in the connection flow | Mongoose (confirm the final selection in Atlas if the dropdown was not saved) |
| Network access | Atlas indicated that an IP address had been added to the IP Access List |
| Database credential | Created/available locally; password must remain private |

The cluster overview showed the cluster as **ACTIVE**. Atlas also displayed a deployment/configuration banner in the later screenshots. Before implementation, confirm that Atlas has finished applying any pending cluster changes and that the Connect flow is available.

### Cloudinary

Cloudinary setup has not yet been confirmed. The project owner will create or select a Cloudinary product environment and enter its credentials locally.

### Application

| Item | Plan |
|---|---|
| Framework | Next.js App Router |
| Language | JavaScript (ESNext) |
| Database integration | Mongoose |
| Media integration | Cloudinary Node.js SDK |
| Environment file | `.env.local` at the project root |
| Deployment | Existing Vercel deployment; production environment variables and Atlas network access must be configured before production database access is enabled |

---

## 3. Target architecture

```text
Browser
  |
  | HTTPS requests / UI interactions
  v
Next.js App Router
  |
  +--> Route Handlers / Server Actions (only where appropriate)
  |       |
  |       +--> Server-side validation and authorization
  |       |
  |       +--> Mongoose connection utility
  |       |       |
  |       |       v
  |       |    MongoDB Atlas
  |       |    Structured application records
  |       |
  |       +--> Cloudinary server utility / signature endpoint
  |               |
  |               v
  |            Cloudinary
  |            Original media + transformed/delivered assets
  |
  +<-- Safe response data (never database credentials or API secrets)
```

### Responsibility boundaries

**MongoDB stores:** application records, relationships, status fields, timestamps, and Cloudinary asset references/metadata when a feature needs them.

**Cloudinary stores:** actual uploaded image/video/file assets and their transformed/delivered versions.

**Next.js server code owns:** database reads/writes, authorization, upload signatures, authenticated Cloudinary operations, and secret access.

**Browser code owns:** UI, file selection, previews, upload progress, and display of public/deliverable asset URLs. It must not contain `MONGODB_URI` or `CLOUDINARY_API_SECRET`.

---

## 4. Phase 0 — Project and account preflight

Before modifying application code:

1. Confirm the correct portfolio repository and active branch.
2. Confirm the repository's package manager from its lockfile (`package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`). Use that package manager consistently.
3. Confirm whether the application uses a root-level `app/` directory or `src/app/`; follow the existing project structure rather than creating a second application tree.
4. Confirm `mongoose` is present in `package.json`. It was previously installed as part of the setup walkthrough; do not reinstall it if already present.
5. Confirm the Atlas cluster has finished provisioning/deploying and that the intended database user exists.
6. Create/select a Cloudinary account and locate its **Cloud name**, **API Key**, and **API Secret** in the Cloudinary Console.

**Do not send passwords, connection strings, API secrets, or screenshots containing them in chat.** Enter all credentials directly into local environment files or the deployment provider's secret settings.

---

## 5. Phase 1 — Finish MongoDB Atlas setup

### 5.1 Verify the Atlas database user

- Use a dedicated database user for the portfolio application; do not use an Atlas account login as an application database credential.
- Grant only the permissions needed by the application database (normally read/write on the selected application database).
- Keep the username and password in a password manager or other secure local storage.
- If a password contains reserved URI characters (for example `@`, `#`, `/`, or `:`), percent-encode the credential portion correctly when using it in the URI. Do not encode the entire connection string.

### 5.2 Verify Network Access

- Keep the current development machine's public IP entry in the Atlas project's **Network Access / IP Access List**.
- Add only trusted source addresses required by the application runtime.
- Do not use `0.0.0.0/0` as a permanent shortcut. It allows connections from every IPv4 address and weakens the network boundary.
- A home/office public IP may change. If local development stops connecting, re-check the current public IP and update the Atlas list.
- Before enabling production access, identify the deployment runtime's supported outbound IP strategy. Do not assume the local development IP will also be used by Vercel. If the deployment does not provide stable outbound IPs under the current plan, choose an appropriate supported network strategy before opening Atlas access broadly.

### 5.3 Obtain the application connection string

In Atlas:

1. Open the `portfolio` cluster.
2. Select **Connect**.
3. Choose **Drivers and Client Libraries**.
4. Select **JavaScript** and the **Mongoose** option if available in the ODM/ORM list (otherwise the Node.js driver URI is also usable by Mongoose).
5. Copy the Atlas-generated SRV URI.
6. Replace the credential placeholders locally. Do not paste the completed URI into chat, source code, or a public issue.

The URI should begin with `mongodb+srv://`. Use the host generated by Atlas; do not guess or manually invent the cluster hostname.

### 5.4 Create local environment variables

Create or update `.env.local` in the same directory as `package.json`:

```dotenv
# MongoDB Atlas — server only
MONGODB_URI="<paste the Atlas-generated URI here, with credentials filled in locally>"
MONGODB_DB_NAME="portfolio"
```

`portfolio` is the proposed application database name. The cluster name and database name are separate concepts; the database is created when the application first writes to it. Confirm the database name before production use if the product requirements call for a different name.

Do not prefix these variables with `NEXT_PUBLIC_`.

---

## 6. Phase 2 — Configure Cloudinary

### 6.1 Create/select the Cloudinary product environment

1. Sign in to Cloudinary.
2. Open the product environment dashboard.
3. Locate the **Cloud name**, **API Key**, and **API Secret** under the API Keys / Console settings area.
4. Keep the API Secret private. It is a server-side credential.
5. Choose a consistent asset folder convention only after the portfolio media use cases are confirmed. A proposed root folder is `portfolio/`; feature folders can be added later.

### 6.2 Add local environment variables

Append these values to `.env.local`:

```dotenv
# Cloudinary — server only
CLOUDINARY_CLOUD_NAME="<your-cloud-name>"
CLOUDINARY_API_KEY="<your-api-key>"
CLOUDINARY_API_SECRET="<your-api-secret>"
```

Do not use `NEXT_PUBLIC_` for the API key/secret. The cloud name is an identifier, not a secret, but the initial integration can keep all Cloudinary configuration on the server for a simpler security boundary.

### 6.3 Upload strategy

**Recommended default: signed browser-to-Cloudinary uploads, with signatures generated by Next.js on the server.**

This avoids sending large file bodies through the application server while keeping the Cloudinary API Secret on the server:

1. An authorized UI asks a Next.js route handler for an upload signature.
2. The route handler authenticates/authorizes the requester and signs only a server-approved set of upload parameters.
3. The browser uploads directly to Cloudinary using the returned signature, timestamp, and public API key.
4. The browser receives Cloudinary's upload response.
5. The application saves the resulting asset reference in MongoDB only after server-side validation and authorization.

Do not create a public upload-signature endpoint without an actual protected upload feature. If the portfolio only needs developer-managed static media, assets can be uploaded through the Cloudinary Console instead; no public upload endpoint is required.

### 6.4 Upload restrictions

When an upload feature is approved, define and enforce:

- Allowed resource types and MIME types (do not trust filename extensions alone).
- Maximum file size and, for images, reasonable dimension limits.
- Approved Cloudinary folder and any allowed transformations.
- Authentication and authorization requirements (for example, admin-only uploads).
- Request rate limits and clear error handling.
- Whether assets are public or restricted. Do not make private content public by accident.

Never allow the browser to choose arbitrary privileged upload parameters or to call Cloudinary's authenticated destroy/admin APIs directly.

---

## 7. Phase 3 — Dependencies and environment hygiene

### 7.1 Dependencies

Check the existing dependency list first. If Mongoose is already installed, leave it as-is. Add Cloudinary's Node.js SDK using the repository's package manager. With npm, the command is:

```bash
npm install cloudinary
```

Do not add another database ORM, upload library, or Cloudinary wrapper unless a concrete requirement justifies it.

### 7.2 Git and example environment file

Verify that `.env.local` is ignored by Git. Keep a sanitized `.env.example` (or the repository's existing environment template) containing names only:

```dotenv
MONGODB_URI=
MONGODB_DB_NAME=portfolio
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

The example file must never contain real values. Do not commit `.env.local`.

### 7.3 Secret handling rules

- No MongoDB or Cloudinary secrets in React components, public runtime config, screenshots, logs, analytics events, or API responses.
- No `NEXT_PUBLIC_MONGODB_URI`, `NEXT_PUBLIC_CLOUDINARY_API_SECRET`, or equivalent public secret variables.
- Keep database and Cloudinary modules server-only.
- Validate required environment variables at server startup/use and fail with a clear, non-secret error message.
- If a secret is ever committed or exposed, rotate it in the provider immediately and update local/deployment secrets.

---

## 8. Phase 4 — Application integration design

The following is the proposed structure. Adapt the prefix to the repository's existing `src/` convention; do not duplicate folders if equivalent utilities already exist.

```text
src/
  lib/
    db/
      mongoose.js          # Cached Atlas/Mongoose connection
    cloudinary.js          # Server-side Cloudinary SDK configuration
  app/
    api/
      <feature>/route.js   # Add only for a confirmed feature
      <upload>/signature/route.js # Add only for an approved signed-upload flow
```

For a project without `src/`, use the corresponding root-level `lib/` and `app/` paths.

### 8.1 Mongoose connection utility

Implementation requirements:

- Read `MONGODB_URI` and `MONGODB_DB_NAME` only on the server.
- Use a shared connection/promise cache (for example, a `globalThis` cache) so development hot reloads and repeated server invocations do not create unnecessary connections.
- Reuse an in-flight connection promise to avoid concurrent duplicate connection attempts.
- Handle missing configuration and connection failures clearly without returning credentials or full URIs in errors.
- Ensure database-dependent Route Handlers use the Node.js runtime; Mongoose must not be imported into Edge-only code.
- Do not connect to MongoDB from Client Components or browser event handlers.

### 8.2 Cloudinary utility

Implementation requirements:

- Configure the Node.js SDK from server-only environment variables.
- Keep all authenticated upload, signature, delete, and administrative calls on the server.
- Generate signatures only from server-approved parameters; never sign an arbitrary client-supplied parameter object.
- Return only the minimum fields required by the browser.
- Handle provider errors without leaking API credentials.

### 8.3 MongoDB asset references

When a confirmed feature needs media, store references such as:

- `publicId`
- `secureUrl`
- `resourceType`
- `format`
- `width` and `height` (when applicable)
- `bytes`
- `createdAt` / `updatedAt`

Store only the fields that the feature actually needs. Do not save raw file buffers or base64 media data in MongoDB documents.

### 8.4 Record and asset lifecycle

For any feature that creates both a MongoDB record and a Cloudinary asset, define how partial failures are handled. For example, if the asset upload succeeds but the database write fails, the application should clean up the unreferenced asset when safe to do so. Deletion should first authorize the operation, then remove the asset using its stored `publicId`, and handle database/provider failures consistently.

---

## 9. Phase 5 — Testing and verification

### MongoDB checks

- [ ] Local server can connect to the intended Atlas cluster.
- [ ] The selected database name is the expected one.
- [ ] A controlled test read/write succeeds in a development-only test path or script.
- [ ] Repeated requests reuse the connection cache.
- [ ] Invalid/missing credentials produce a safe, actionable error.
- [ ] No database operation is attempted from client-side code.
- [ ] Atlas rejects a connection from an IP address not on the allowlist.

### Cloudinary checks

- [ ] Server can initialize the Cloudinary SDK using local environment variables.
- [ ] An authorized test upload succeeds with the chosen upload strategy.
- [ ] The returned `secure_url` and `public_id` are available to server code.
- [ ] The media URL can be delivered and displayed by the portfolio.
- [ ] File type and size restrictions are enforced by the application/provider configuration.
- [ ] Unauthorized requests cannot obtain upload signatures or delete assets.
- [ ] API Secret does not appear in the browser bundle, network responses, or logs.

### Deployment checks

- [ ] Production environment variables are added through the deployment provider's secret/environment settings, not committed files.
- [ ] Production Atlas network access matches the actual server runtime's outbound connectivity.
- [ ] A production smoke test verifies database and media access without exposing secrets.
- [ ] Development and production credentials are separated where practical.

---

## 10. Implementation phases and deliverables

| Phase | Work | Deliverable / exit condition |
|---|---|---|
| 0. Preflight | Verify repository structure, package manager, Atlas readiness, and Cloudinary account | Confirmed prerequisites; no application code changed |
| 1. Atlas setup | Verify DB user, IP access list, and connection URI; configure local variables | Local Atlas credentials configured privately |
| 2. Cloudinary setup | Create/select product environment and configure local credentials | Local Cloudinary credentials configured privately |
| 3. Environment hygiene | Verify `.gitignore`, sanitized environment template, and dependencies | No secrets tracked; required SDK dependencies present |
| 4. Service utilities | Implement cached Mongoose connection and server-only Cloudinary configuration | Reusable server-side service modules |
| 5. Smoke tests | Validate connection, safe error handling, and one controlled media operation | Repeatable local verification |
| 6. Feature integration | Design schemas, route handlers, authorization, and UI for a confirmed portfolio feature | Feature-specific vertical slice; scope decided separately |
| 7. Production rollout | Configure deployment variables and network access; verify live behavior | Production integration verified |

**Implementation should proceed phase by phase.** Do not create speculative collections, upload endpoints, public forms, admin screens, or API routes before the feature requirements and authorization model are agreed.

---

## 11. Decisions still required before feature implementation

These are product decisions, not credential questions:

1. Which portfolio feature will use MongoDB first (for example, contact submissions, project/content management, or another confirmed requirement)?
2. Which media items need Cloudinary (for example, project screenshots, thumbnails, profile media, or admin-managed uploads)?
3. Will uploads be admin-only, user-submitted, or managed manually through the Cloudinary Console?
4. What authentication/authorization mechanism protects any write or upload operation?
5. Confirm the final MongoDB database name (proposed: `portfolio`).

Until these are decided, build only the secure service configuration and connection foundation.

---

## 12. Completion criteria

The setup is complete when:

- Atlas and Cloudinary credentials are configured locally and never shared in chat or committed.
- `.env.local` is ignored by Git and a sanitized environment template exists.
- The application connects to Atlas through one reusable Mongoose utility.
- Cloudinary is configured through a server-only utility.
- At least one controlled development smoke test passes for each service.
- No secret is exposed to the browser.
- Production network access and environment variables are explicitly configured before deployment relies on these services.
- Feature-specific database models and upload flows remain aligned with approved requirements.

---

## 13. Official references

- [MongoDB Atlas — Connect to a cluster with client libraries](https://www.mongodb.com/docs/atlas/driver-connection/)
- [MongoDB Atlas — Manage the IP Access List](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/)
- [MongoDB Atlas — Network security guidance](https://www.mongodb.com/docs/atlas/architecture/current/network-security/)
- [Mongoose — Using Mongoose with Next.js](https://mongoosejs.com/docs/nextjs.html)
- [Cloudinary — Node.js SDK quick start](https://cloudinary.com/documentation/node_quickstart)
- [Cloudinary — Node.js integration](https://cloudinary.com/documentation/node_integration)
- [Cloudinary — Client-side uploading](https://cloudinary.com/documentation/client_side_uploading)
- [Cloudinary — Generating authentication signatures](https://cloudinary.com/documentation/authentication_signatures)
- [Cloudinary — Upload assets in a Next.js app](https://cloudinary.com/documentation/upload_assets_in_nextjs_tutorial)

---

**Security reminder:** You do not need to give the assistant your MongoDB password, complete connection URI, Cloudinary API key, or Cloudinary API Secret. Keep them in `.env.local` and in your deployment provider's private environment-variable settings.


---

## 14. Phase 0 preflight findings — 1 November 2026

**Status:** Remote-repository inspection completed; local and provider verification still pending.  
**Scope:** Read-only inspection of `main` and `docs/portfolio-platform-spec`. No application source, dependency manifest, lockfile, environment file, or provider setting was changed.

### 14.1 Verified repository conventions

- The project uses **`src/app/`** as its App Router root.
- Existing server-side helpers live under **`src/app/lib/`**. For this integration, prefer `src/app/lib/db/` and `src/app/lib/cloudinary/` unless the actual local checkout reveals a more suitable established convention.
- Existing API routes live under **`src/app/api/`**:
  - `contact/route.js`
  - `source-snapshot/route.js`
- The application already uses JavaScript/JSX, Next.js App Router, React 19, Tailwind CSS v4 and `next.config.mjs`.
- `package-lock.json` is present and the repository scripts use npm. Preserve npm and keep `package.json` / `package-lock.json` synchronized.
- Existing scripts are `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, and `npm run validate:seo`. The build script runs SEO validation before `next build`.

### 14.2 Dependency status in GitHub

The inspected `package.json` and `package-lock.json` on both `main` and `docs/portfolio-platform-spec` do **not** currently contain:

- `mongoose`
- `mongodb` (MongoDB Node.js driver dependency)
- `cloudinary`

Therefore, the repository version currently available on GitHub does not prove that the earlier local Mongoose installation has been committed. Check the local checkout before installing again; do not duplicate an already installed dependency. Cloudinary SDK installation remains pending until its account/environment is ready and the integration phase begins.

### 14.3 Environment and secret handling

- Root `.gitignore` ignores `.env*` and explicitly allows `.env.example`. This already protects `.env.local` from normal Git tracking.
- The committed `.env.example` currently lists `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, optional `RESEND_FROM_EMAIL`, and `NEXT_PUBLIC_SITE_URL`; it does not yet list MongoDB or Cloudinary variables.
- The inspected contact Route Handler reads `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `CONTACT_TO_EMAIL` and uses Nodemailer/Gmail SMTP. This does not match the committed Resend-oriented example file. Treat it as pre-existing environment documentation drift; resolve it in a separate, explicitly scoped contact-email cleanup rather than changing contact behavior during the database/media foundation.
- `scripts/setup-env.cjs` creates `.env.local` with a `NEXT_PUBLIC_SITE_URL` template only when no file exists. When `.env.local` already exists, it intentionally does not overwrite it. Preserve this behavior; add new variables manually or through a carefully reviewed setup change.
- No private local `.env.local` contents were accessed or requested.

### 14.4 Integration-specific findings

- There is no existing MongoDB connection helper, Mongoose model folder, Cloudinary utility, or Cloudinary upload route in the inspected application paths.
- Portfolio/project content currently comes from JavaScript modules under `src/app/data/`. Do not migrate these records to MongoDB as part of connection setup; data migration requires a separate feature and compatibility plan.
- `next.config.mjs` configures Next Image formats, sizes and quality values, but it does not currently declare Cloudinary remote image hosts. When the actual Cloudinary delivery hostname and media use case are confirmed, add the narrowest suitable `images.remotePatterns` entry. Do not add a broad wildcard pre-emptively.
- Keep the connection and Cloudinary SDK utilities server-only. Database-dependent route handlers must use the Node.js runtime, not Edge-only runtime.

### 14.5 Provider and local checks that remain unverified

The remote repository cannot establish the state of local files or private provider settings. These items remain **OPEN**:

- [ ] Confirm the local working tree is on the intended implementation branch and inspect `git status`.
- [ ] Run `npm ls mongoose` locally to determine whether the earlier Mongoose install exists in the local checkout; compare `package.json` and `package-lock.json` before installing.
- [ ] Confirm Atlas has finished any pending deployment/configuration operation, and verify the dedicated database user and development IP access entry in Atlas.
- [ ] Confirm the exact Atlas-generated SRV URI is stored privately in local `.env.local`; do not share the value.
- [ ] Create/select the Cloudinary product environment and obtain its Cloud Name, API Key and API Secret privately.
- [ ] Add the intended Cloudinary credentials to local `.env.local`; do not share the values.
- [ ] Run `npm ci`, `npm run lint`, `npm run validate:seo`, and `npm run build` in the local checkout. Capture pre-existing failures separately from any future integration failures.

### 14.6 Phase 0 exit decision

**Repository inspection:** Complete for the GitHub branch and the corresponding `main` files reviewed.  
**Full Phase 0:** Not yet complete. The local working tree, Atlas private configuration, Cloudinary account configuration, and runtime baseline checks still require verification.

No database connection utility, Cloudinary client, upload-signature endpoint, schema, model, or API route should be implemented until the remaining local/provider checks are complete. This avoids writing integration code against unknown local dependency state or unverified credentials/network access.
