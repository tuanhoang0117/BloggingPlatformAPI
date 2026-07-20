# Blogging Platform API — Project Plan

Source project: [roadmap.sh/projects/blogging-platform-api](https://roadmap.sh/projects/blogging-platform-api)
Parent roadmap: [roadmap.sh Backend](https://roadmap.sh/backend) (see `backend - Copy copy.pdf` in this repo)

This is a learn-by-doing build. The goal isn't just a working API — it's using this
project as a vehicle to pick up specific nodes off the Backend roadmap that you're
currently weak on or new to (per your mentor-mode profile: shaky on JS fundamentals
and HTTP/API/caching concepts, new to Node.js + Express).

---

## 1. What the project actually requires

A RESTful API for a personal blog, **no auth/authorization**, plain CRUD:

**Post model:** `id`, `title`, `content`, `category`, `tags[]`, `createdAt`, `updatedAt`

**Endpoints:**

| Method | Route | Success | Failure |
|---|---|---|---|
| POST | `/posts` | 201 | 400 |
| GET | `/posts` | 200 | — |
| GET | `/posts?term=keyword` | 200 (wildcard match on title/content/category) | — |
| GET | `/posts/{id}` | 200 | 404 |
| PUT | `/posts/{id}` | 200 | 400 / 404 |
| DELETE | `/posts/{id}` | 204 | 404 |

That's the whole spec. Everything past this section is scope you're deliberately
adding to turn a small CRUD exercise into a proper learning arc.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js | Named as "new to" in your profile — this project's whole point |
| Framework | Express | Roadmap-recommended, minimal magic, forces you to understand middleware/routing yourself instead of a framework hiding it |
| Database | PostgreSQL | Roadmap.sh's own top pick for relational DBs; gives you real SQL, not just an ORM abstraction |
| ORM | Prisma (or raw `pg` if you want more pain/learning) | Prisma gives you migrations + a query layer without hand-writing every SQL string; swap to raw SQL later as a stretch goal if you want the harder version |
| Testing | Jest + Supertest | Standard Node pairing for unit + HTTP integration tests |
| API docs | OpenAPI (Swagger) via `swagger-ui-express` | Roadmap node "Open API Specs" |
| Validation | `zod` or `express-validator` | Keeps 400-handling logic out of your route handlers |

MongoDB is the roadmap's suggested NoSQL alternative — noted as a stretch/variant in
§5, not the primary path, since you'll get more transferable SQL/ORM/migration
learning from Postgres.

---

## 3. Roadmap coverage — what this project does and doesn't teach

Referencing the Backend roadmap PDF in this repo:

### Covered by this project
- **Pick a Language** → JavaScript
- **Version Control Systems / Repo Hosting** → Git, GitHub
- **Internet** → HTTP methods, status codes, request/response cycle (your "new to Node/Express" gap lives here)
- **Learn about APIs** → REST, JSON APIs (not GraphQL/SOAP/gRPC — out of scope)
- **Relational Databases** → PostgreSQL
- **More about Databases** → ORMs (Prisma), Migrations
- **Web Security** (partial) → basic input validation only, not hashing/HTTPS/OWASP in depth
- **Testing** → Unit Testing, Integration Testing (Functional testing lightly, via end-to-end request tests)

### Deliberately out of scope for this project
These are real roadmap nodes this project does **not** touch — don't expect this repo
to teach them; pick a different project for these later:
- **Authentication** (JWT/OAuth/sessions) — spec explicitly says no auth
- **Caching** (Redis/CDN/server-side) — no caching layer needed at this scale
- **Message Brokers** (RabbitMQ/Kafka) — no async job/event use case here
- **Containerization/Kubernetes** — optional stretch, not required
- **Scaling Databases** (sharding, replication, CAP) — single small DB, not a scaling problem
- **Search Engines** (Elasticsearch/Solr) — the `?term=` filter is a SQL `LIKE`/wildcard query, not a search engine
- **Web Servers** (Nginx/Caddy config), **DevOps/Observability**, **Microservices/Architectural patterns** — single monolithic Express app, no ops layer
- **Real-Time Data** (WebSockets, SSE, polling), **GraphQL**

---

## 4. Milestones & Sprints

Self-paced — sprints are scoped by deliverable, not calendar time. Don't start a
sprint until the previous one's "Definition of Done" is met.

### Milestone 0 — Environment & Foundations
**Goal:** a running "hello world" Express server under version control, and enough
Node fundamentals to know what's happening when a request comes in.

- [ ] Install Node LTS, init repo, `.gitignore`, first commit
- [ ] `npm init`, install Express, build a single `GET /health` route
- [ ] Learn: event loop basics, `require`/`import`, `async`/`await` vs promises, what middleware actually is (`app.use`)
- [ ] Learn: anatomy of an HTTP request/response — verbs, headers, status codes, body

**DoD:** server starts, `/health` returns 200, you can explain what `app.use()` does out loud without notes.

### Milestone 1 — In-memory CRUD (no DB yet)
**Goal:** get the full REST contract working against a plain JS array first, so DB
concerns don't tangle with routing/HTTP concerns.

- [ ] Define the Post shape (id, title, content, category, tags, createdAt, updatedAt)
- [ ] Implement all 6 routes from §1 against an in-memory array
- [ ] Wire up correct status codes (201/200/204/400/404) per route
- [ ] Manual testing via curl/Postman/Insomnia for every route + error path

**DoD:** every endpoint in the spec table works and returns the right status code, verified manually.

### Milestone 2 — Database integration
**Goal:** swap the in-memory array for real persistence without changing the route contract.

- [ ] Stand up PostgreSQL locally (or Docker container if you want that exposure)
- [ ] Set up Prisma, define the Post model/schema, run first migration
- [ ] Replace in-memory logic in each route with Prisma queries
- [ ] Re-verify all 6 routes still behave identically from the client's perspective

**DoD:** data survives a server restart; migrations directory exists and is reproducible from scratch.

### Milestone 3 — Validation, search, error handling
**Goal:** make the API actually robust to bad input, and implement the `?term=` search.

- [ ] Add request validation (zod/express-validator) on POST/PUT — reject malformed bodies with 400 + useful message
- [ ] Implement `GET /posts?term=keyword` with wildcard match across title/content/category
- [ ] Centralize error handling (Express error-handling middleware) instead of try/catch soup in every route
- [ ] Confirm 404 behavior is consistent for GET/PUT/DELETE on missing ids

**DoD:** invalid payloads never 500; search returns correct subset for title/content/category matches.

### Milestone 4 — Testing
**Goal:** a test suite that would catch a regression if you refactored tomorrow.

- [ ] Unit tests for any pure logic (validation rules, search-matching logic) with Jest
- [ ] Integration tests for every route with Supertest, covering success + error paths
- [ ] Wire `npm test` into a simple CI check (GitHub Actions) — optional but cheap roadmap coverage for CI/CD

**DoD:** `npm test` is green, and covers at minimum one success + one failure case per endpoint.

### Milestone 5 — Docs & polish
**Goal:** the repo is legible to a stranger (or future you).

- [ ] Write an OpenAPI spec (or generate via `swagger-ui-express` annotations) and serve it at `/docs`
- [ ] README: setup instructions, env vars, how to run migrations, how to run tests
- [ ] Postman/Insomnia collection checked into the repo (optional but handy)

**DoD:** someone could clone the repo, follow the README, and hit every endpoint with zero prior context.

---

## 5. Stretch goals (post-MVP, pick freely — each maps to a roadmap node you skipped)

Only do these once Milestones 0–5 are solid. Treat each as its own mini-project.

- **Auth** — add JWT-based auth so only the post owner can edit/delete → picks up the Authentication node
- **Caching** — Redis cache for `GET /posts` → picks up Caching
- **Pagination & rate limiting** → API design maturity + a taste of API Security Best Practices
- **Dockerize** the app + Postgres via `docker-compose` → Containerization vs Virtualization
- **Deploy** (Render/Railway/Fly.io) → basic Web Servers/hosting exposure
- **MongoDB variant** — reimplement persistence with Mongoose instead of Prisma/Postgres, same routes → NoSQL Databases node, and a good compare/contrast exercise for relational vs document modeling

---

## 6. Notes on how to work this plan

- Work one milestone at a time; don't jump to DB integration before in-memory CRUD is fully correct — you'll end up debugging two unknowns at once.
- When stuck on the *why* (not just the *how*), that's the moment to actually read the roadmap node's linked resources rather than just asking for code.
