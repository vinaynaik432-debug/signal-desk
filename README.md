# Signal Desk

Signal Desk helps industrial automation teams turn public company evidence into a research shortlist and a useful first conversation. It connects source excerpts, dates, process scope, research priority and reviewable outreach drafts in an English/German workspace.

The implemented use case is **CNC machining and machine loading in Germany, Austria and Switzerland**. Its rules cover manufacturer operations, equipment investment, production staffing and specific automation projects. Applying the workflow to other industries requires adapting the source checks, signal definitions and scoring rules.

[Open the live demo on GitHub Pages](https://vinaynaik432-debug.github.io/signal-desk/) · [Download the offline demo](https://github.com/vinaynaik432-debug/signal-desk/archive/refs/heads/gh-pages.zip)

The offline download contains a single self-contained page. Unzip it and open `index.html` in a browser.

## Explore the recorded research

The public demo contains **29 company accounts, 33 source records and 40 recorded discovery runs**. Its **39 linked sources** include supporting pages cited by individual facts. Sources were collected on **9 November 2026** and assessed with the current rules on **20 November 2026**. These dates distinguish retrieval from reassessment. Building or opening the demo uses the saved evidence.

1. Open **Accounts** and choose a manufacturer. Its brief connects a production observation to a question that still needs an answer.
2. Open the **Scorecard** and **Signals** tabs to inspect the points, original quotations, dates and the cited machine or site. **Sources** preserves the individual evidence records.
3. Choose **Explore recorded searches** to inspect a saved query. **Run history** shows retained companies, page decisions and recorded search stages where available.
4. Open **Segments** for four conversation starting points—capacity expansion, shift operations, part handling and series, and varied parts and batch sizes.
5. Open **Contacts & draft** for the suggested role and a role-based draft. Use **EN/DE** to switch the interface and draft language. Original source quotations retain their wording.

Koch Maschinenbau illustrates the calculation with 30 fit points and 23 points for a dated CNC investment. SACS illustrates a night-shift staffing observation and a cited locality whose country still needs verification. ZT Odenwald illustrates a process whose scope already includes robotic automation. Open each source to inspect the evidence supporting that treatment.

The public build supports browsing and copying evidence and drafts. Local mode also supports saved manual review decisions and optional provider actions. Named contact records and contact-specific drafts are excluded from the public sample.

## What the score means

The 0–100 score ranks research priority for a cited process. It is a rule-based assessment, with weights chosen for this prototype. It is not a calibrated probability of purchase.

| Component | Available points | Rule |
| --- | ---: | --- |
| DACH location | 10 | Source evidence establishes a location in Germany, Austria or Switzerland. |
| CNC fit | 20 | The source establishes the operator's machining application. |
| Strongest buying signal | Up to 60 | The strongest supported, current signal receives its defined weight. |
| Corroborating signals | Up to 10 | Distinct evidence for the same named site and project contributes one tenth of each additional weight, rounded down. |

The catalog contains twelve defined buying signals, including an open machine-loading RFQ, an invitation to a feasibility study, loader replacement, an unattended-production goal, a documented loading bottleneck, an approved automation budget, pilot rollout, a new series contract, insourcing, a CNC addition, an ergonomics project and a role owning loading automation. Each has its own evidence requirements and weight.

For a CNC addition, a purchase verb alone does not confirm the signal. For example, “we have not purchased a new CNC machining center” and “wir haben keine neue CNC-Drehmaschine bestellt” earn no points. Ambiguous statements containing a denial stay unconfirmed.

Evidence for a separate machine or site remains visible on the company account. The score credits the selected process. A review hold, missing eligibility evidence, unavailable source or documented automation coverage can reduce its final priority to zero and pause drafting. An explicit, current replacement or retrofit requirement can establish a new opportunity for an already automated process.

Dated buying events expire after 365 days, while RFQs require a verifiable open submission deadline. Explicit capability pages use their observation date to assess current operating context and retain their original publication date. News announcements and vacancies keep their event-date rules. Future dates and unavailable pages remain ineligible. An extracted locality can be shown while its country remains unresolved.

Four **research triggers** help formulate questions and earn zero buying-signal points—manual CNC loading duties, CNC shift staffing, quantified machining batch sizes, and a prepared robot interface. These observations can establish operating context without establishing an automation purchase project.

## Recorded discovery results

The sample preserves unsuccessful searches and partial results alongside retained accounts. The four staged research searches below used a German web search followed by retrieval of original pages. Counts refer to that recorded run.

| Research focus | Search results returned | Original URLs selected | Original pages returned | Companies retained | Companies with a research trigger |
| --- | ---: | ---: | ---: | ---: | ---: |
| Manual CNC loading duties | 20 | 10 | 10 | 0 | 0 |
| CNC shift staffing | 20 | 12 | 11 | 2 | 2 |
| Machining lot size | 20 | 12 | 12 | 6 | 4 |
| Prepared robot interface | 11 | 6 | 6 | 0 | 0 |

The shift search is marked partial because one selected page did not return. All four runs confirmed **zero buying signals**. Their retained records support further research. Page count, company count and confirmed evidence are separate measures, and earlier runs may have less stage detail.

New localized search runs also record **raw provider rows**. The search-result count excludes the provider’s own upgrade link; the selected-URL count shows how many distinct eligible pages went to the crawler.

Source filters check that the evidence belongs to the operating company. Search snippets, unverified job boards, supplier product marketing, customer stories and manufacturing brokers are screened before company intake. Exact quotations and source links support review of accepted claims. The saved examples demonstrate the workflow and its limits, rather than a measured discovery success rate for the wider market.

## Run the public demo locally

Use **Node.js 22.13 or later**.

```sh
npm ci
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:8788/`. The build writes a self-contained `dist/index.html` with embedded application assets and the public research sample. It can also be opened directly as a file. Source links open external websites. Set `PORT` to change the preview port.

The public GitHub Pages site serves the built `index.html` from the root of the `gh-pages` branch. To update the published sample, run the tests and build on `main`, then publish the resulting `dist/index.html` as `index.html` on `gh-pages`.

The build works from checked-in source data and does not need provider credentials. Its browser content uses a restrictive policy that disables API connections.

## Run a local research workspace

```sh
npm start
```

Open `http://127.0.0.1:8787/`. The local server initializes the recorded sample in `.local/prospect-desk.sqlite`, then preserves local discoveries and review decisions there. It binds to the loopback interface. Set `PORT` to change the port.

For live discovery, copy `.env.example` to `.env` and supply your provider credentials. Environment variables are also supported. The local server retains compatibility with `../secrets/providers.env` when `.env` is absent. Credential files and the local database are ignored by Git.

| Setting | Purpose |
| --- | --- |
| `APIFY_API_TOKEN` | Search and retrieve original public pages. |
| `FEATHERLESS_API_KEY` | Extract proposed facts from retrieved source text. |
| `FEATHERLESS_MODEL` | Optional model override. The default is `Qwen/Qwen3-30B-A3B-Instruct-2507`. |
| `HUNTER_API_KEY` | Optional lookup of named contacts with reported leadership or operations roles. |

Live discovery requires Apify and Featherless. Choose five or twelve pages and a signal focus in **Discover accounts**. Buying-signal searches use Apify's RAG Web Browser. The four research-trigger focuses use a German-localized search followed by a crawl of selected original URLs. Accepted model proposals must match source text and pass the relevant rule checks.

The adapter requests an Apify ceiling of **USD 0.05 per discovery**, using USD 0.01 for the search stage and USD 0.04 for the page-retrieval stage on the research-trigger route. These are configured request caps. Featherless and Hunter usage has separate provider charges. Results can be partial or empty. The application retains received pages, records outcomes and reuses recent requests to reduce duplicate work.

Hunter results preserve their reported roles, sources and verification information for review. A named role does not establish budget authority for the specific process. Drafts can be reviewed and copied for a human handoff.

## Project layout

| File or directory | Responsibility |
| --- | --- |
| `public/` | Bilingual interface and bundled fonts. |
| `domain.mjs` | Scoring, scope handling, conversation segments and drafts. |
| `buying-signals.mjs` | Twelve buying-signal definitions and evidence checks. |
| `research-triggers.mjs` | Four zero-point operating observations and shared source handling. |
| `providers.mjs` | Bounded search, source extraction and contact provider adapters. |
| `repository.mjs`, `local-db.mjs`, `server/schema/` | Persistence and schema. |
| `server/audited-dataset.json` | Reviewed public sample and recorded discovery traces. |
| `public-data.mjs`, `snapshot.mjs`, `build.mjs` | Public-data filtering and reproducible static packaging. |
| `api.mjs`, `local.mjs` | Local workspace routes and server. |

`npm test` covers scoring and source boundaries, provider response handling with mocks, storage, API behavior and public exports. GitHub Actions runs the checks and static build. The interface bundles DM Sans and IBM Plex Mono with their licences in `public/brand/`.

An independent portfolio project by **Vinay Naik**.
