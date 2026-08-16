# Agent handoff — Alefbâ (الفبا)

**Saved:** 2026-08-13 · **Baseline:** v0.2.1 · **Classification:** PRIVATE_CONFIDENTIAL  
**Local path:** `~/Desktop/ALEFBA/` (standalone Desktop folder; not the public PLR repo)

---

## North star (one line)

```text
Build Persian foundation intelligence whose first world is the alphabet, words, stories, and books —
then ship API and vertical products with scientific receipts, not slogans.
```

## One-line law

```text
PERSIAN FIRST · ALPHABET TO LITERATURE · SCIENCE BEFORE SLOGANS · RECEIPT BEFORE CLAIM
```

---

## What Alefbâ is · is not

| Alefbâ **is** | Alefbâ **is not** |
|---------------|-------------------|
| Commercial–scientific program for a **Persian-native foundation model** | An English LLM with Farsi paint |
| Corpus science + tokenizer + curriculum + native eval + products | A chatbot wrapper without corpus law |
| Charter site + white paper + gates + local receipts (`:5293`) | The public neutral atlas (that's **PLR**) |
| Founding thesis: close the gap the field documents | Self-promotion inside **Persian LLM Reference** registry |

**Entry line for market:** *Persian first. Alphabet to literature. Science before slogans.*

### Four-door package (`#audiences` on landing)

One charter, four entry paths on the same site:

| Door | Audience | CTA path |
|------|----------|----------|
| **Investor** | Capital | Data room · fund split · 18-month ladder |
| **Partner** | Publishers / corpus | Corpus brief · licensed shelf narrative |
| **Builder** | Research / engineering | Gates · white paper · join lane |
| **Public** | Society | Founding wall · donate · movement |

**Short-term bar:** each door obvious in one scroll — no explanation in person.

---

## Two products — never mix lanes

| | **Persian LLM Reference (PLR)** | **Alefbâ** |
|---|---|---|
| **Role** | Neutral field atlas — maps the ecosystem | Builds what the gap map says is missing |
| **Path** | `~/Desktop/PERSIAN-LLM-REFERENCE` | `~/Desktop/ALEFBA` |
| **Port** | `5294` | `5293` |
| **Tone** | Librarian · curator · cite everyone | Founder · charter · literary mission |
| **Public** | GitHub Pages · PyPI · CC-BY manifest | **Private/confidential** until founder promotes |
| **In PLR registry** | N/A | **None** until weights + measured evals → one earned row |

**PLR gap map (neutral mirror Alefbâ targets):**

1. No frontier model whose first world is licensed Persian literature  
2. Few native-rater preference loops at production scale  
3. Sparse literary register / book-memory evaluation  
4. Most open models = English-base adaptations under 15B  

Alefbâ may **cite** PLR's gap map in its white paper. PLR must **not** sell Alefbâ inside the registry.

**Partnership note (PLR lane):** Open developer communication with [Awesome-Persian-LLM](https://github.com/MohammadHeydari/Awesome-Persian-LLM) maintainer is partnership seeding for discovery — **not** Alefbâ marketing. Future corpus/eval collaboration possible; keep products separate.

---

## Mission arc

```text
charter live (now) → science ready (G1) → base model (G2) → instruct API (G3) → paying vertical (G4)
```

| Horizon | Focus |
|---------|--------|
| **Now** | Charter site · corpus law · tokenizer/eval design · honest local receipts |
| **Months 0–3 (P1)** | Corpus inventory · license map · tokenizer v1 · eval harness |
| **Months 3–8 (P2)** | First base model · ortho/morph score cards · paper draft |
| **Months 8–12 (P3)** | Instruct MVP · API alpha · 3 design partners |
| **Months 12–18 (P4)** | Studio or Private · paid pilots |

---

## Current state (v0.2.1)

| Asset | Status |
|-------|--------|
| **Concept brief** | `governance/CONCEPT_BRIEF.md` |
| **Commercial scientific plan** | `governance/COMMERCIAL_SCIENTIFIC_PLAN.md` |
| **White paper** | `governance/WHITE_PAPER.md` + `workspace/public/white-paper.html` |
| **Startup site** | `workspace/public/index.html` + pages (corpus, data-room, receipts, press) |
| **Local server** | `workspace/src/server.mjs` · `:5293` |
| **Content manifest** | `workspace/data/content-manifest.json` |
| **Interest ledger** | `workspace/data/interest.jsonl` (local) |
| **Receipts store** | `workspace/data/receipts.json` (gates, score cards — empty scaffold) |
| **E2E** | `workspace/scripts/e2e-local.mjs` (~74 checks when Playwright available) |
| **Git** | Desktop folder — optional private backup at `github.com/sinakazemnezhad/Alefba` (not ship surface) |

**Verdict now:** `PASS_PLAN_LIVE` (plan on disk + loopback site)  
**Not yet:** `PASS_SCIENCE_READY` · `PASS_COMMERCIAL_PILOT`

---

## SSOT map

| What | Path |
|------|------|
| Product identity | `ALEFBA.json` |
| Thesis | `governance/CONCEPT_BRIEF.md` |
| Commercial plan | `governance/COMMERCIAL_SCIENTIFIC_PLAN.md` |
| White paper (long) | `governance/WHITE_PAPER.md` |
| Web mirror | `workspace/public/white-paper.html` |
| Port law | `governance/PORT_LOCK.json` |
| Agent ops | `AGENTS.md` · this file |
| Runtime data | `workspace/data/` |

---

## Live surfaces (local)

| Surface | URL |
|---------|-----|
| **Startup** | http://127.0.0.1:5293/ |
| **White paper** | http://127.0.0.1:5293/white-paper.html |
| **Corpus** | http://127.0.0.1:5293/corpus.html |
| **Data room** | http://127.0.0.1:5293/data-room.html |
| **Receipts** | http://127.0.0.1:5293/receipts.html |
| **Press** | http://127.0.0.1:5293/press.html |
| **Health** | http://127.0.0.1:5293/api/health |

```bash
cd ~/Desktop/ALEFBA/workspace
npm start    # :5293
npm run e2e    # target GREEN ~74/74 (or current check count — all pass)
```

### Architecture map

```
~/Desktop/ALEFBA/
├── ALEFBA.json              # Product identity SSOT
├── INDEX.md · AGENTS.md · HANDOFF_AGENT.md
├── governance/
│   ├── CONCEPT_BRIEF.md · COMMERCIAL_SCIENTIFIC_PLAN.md · WHITE_PAPER.md
│   ├── HANDOFF.md           # This file
│   └── PORT_LOCK.json       # Port 5293 lock
└── workspace/
    ├── package.json · src/server.mjs
    ├── scripts/             # e2e-local.mjs · sync-content.mjs
    ├── data/                # content-manifest · receipts · interest.jsonl
    └── public/              # index · white-paper · receipts · corpus · press · data-room
```

### Landing sections (must remain)

`#why` · `#proof` · `#sample` · `#lanes` · `#pitch` · `#products` · `#science` · `#pattern` · `#roadmap` · `#audiences` · `#faq` · `#share` · `#ask`

### Local APIs (loopback)

| Endpoint | Role |
|----------|------|
| `GET /api/health` | Liveness |
| `GET /api/stats` | Local counters |
| `GET /api/receipts` | Gates G1–G4 (pending until measured) |
| `GET /api/content-manifest` | Governance sync SSOT |
| `GET /api/release.json` | Version receipt |
| `POST /api/interest` | Society signups → `interest.jsonl` |
| `GET /api/interest.csv` | CRM export |

### What's already built (preserve — do not rip out)

Ten upgrade plans completed before Desktop move. **Polish, don't rebuild.**

| Surface | Status |
|---------|--------|
| Design system (tokens, components, typography) | Done |
| Cinematic hero + sticky charter bar | Done |
| Science receipts + honest gate table | Done |
| Society roster + founding wall | Done |
| Investor data room index | Done |
| Product ladder marketing | Done |
| Governance → web content sync | Done |
| Corpus curriculum ladder + bookshelf UI | Done |
| Distribution (OG variants, press kit, UTM) | Done |
| Local server + E2E prove | Done — **64/64 GREEN** on Desktop (74 with Playwright browser smoke) |

**Content sync law:** After governance MD edits, run `npm run sync:content`.

### Desktop drift (fix on first session)

| Item | Status |
|------|--------|
| `ALEFBA.json` `repoRoot` → `~/Desktop/ALEFBA` | Fixed |
| `.github/workflows/e2e.yml` monorepo `ALEFBA/workspace` paths | Fixed → `workspace/` |
| `agentAttribution` blocks still say `repo=PLUS ONE` in HTML comments | Cosmetic — update when touching those files |
| Re-run E2E on Desktop after move | **64/64 GREEN** (2026-08-13) |

---

## Scientific program (summary)

### Curriculum stages (order matters)

| Stage | Content | Goal |
|-------|---------|------|
| **A0** Alphabet | Letters, joining, digits | Character competence |
| **A1** Orthography | ZWNJ, spelling norms | Script fidelity |
| **L0** Lexicon | Dictionaries, collocations | Lexical coverage |
| **N0** Narrative | Stories, dialogue | Plot + coherence |
| **B0** Books | Classical + contemporary | Long context + knowledge |
| **P0** Poetry | Metered / free verse | Prosody |
| **C0** Contemporary | News, manuals (filtered) | Living usage |
| **I0** Instruct | Persian instruction pairs | Task following |
| **R0** Align | Native-rater preferences | Helpfulness + cultural safety |

### Model stack

1. Persian-aware **tokenizer** (alphabet coverage guarantees)  
2. **Base** decoder (start 1–3B research class)  
3. Persian **re-centering** if bootstrapping from multilingual checkpoint  
4. **Instruct + preference** alignment (native raters)  
5. Optional **RAG** for book-grounded products  

### Pattern law (from `content-manifest.json`)

```text
Keep Latin factory; change door · rain · loss · eval
(tokenizer, Persian curriculum, Persian next-token loss, native score cards)
```

Precedent: Chinese-native LLM on Latin tooling — same factory, Persian-native doors.

---

## Go / No-Go gates (capital spends only after pass)

| Gate | Pass condition | Target month |
|------|----------------|--------------|
| **G1 Tokenizer** | Full alphabet coverage · better Persian fertility vs baseline · no vocab explosion | M3 |
| **G2 Base** | Lift on FA ortho/morph/reading vs fair baseline · **published score card** | M8 |
| **G3 Instruct** | Human rubrics above threshold · **3 active design partners** · API alpha | M12 |
| **G4 Product** | **One paying contract** or Private · real usage | M18 |

Store receipts in `workspace/data/receipts.json` — gates and score cards on disk, not in chat.

---

## Evaluation law

| Suite | Measures |
|-------|----------|
| Orthography / morphology probes | Script, ZWNJ, forms |
| Persian knowledge (MMLU-style) | FA factual knowledge |
| Reading comprehension | Passage QA |
| Generation rubrics | Fluency, register, culture (human panel) |
| Safety (FA) | Refusal in Persian context |

**Forbidden:** capability claims without benchmark name · split · date · model hash.

Cite external benchmarks (ELAB, TARAZ, MIZAN, ParsBench) — do not invent scores. PLR indexes them; Alefbâ **runs** against them when models exist.

---

## Corpus law

- Prefer **licensed, publisher-partnered, public-domain** text  
- Per shard: provenance · license class · volume band · quality grade  
- Train / val / public eval held out — no leakage  
- **No scraping as strategy** — partnerships and lawful corpora  
- Claim **curated volume bands**, not “all Persian books”

---

## Commercial ladder

| Product | Role |
|---------|------|
| **Alefbâ Research** | Papers · eval cards · selective small checkpoints |
| **Alefbâ API** | Chat · completion · embeddings (Persian-first) |
| **Alefbâ Studio** | Education · publishers · support UIs |
| **Alefbâ Private** | VPC / on-prem regulated buyers |

**Beachhead:** EdTech · publishers/archives · FA media · enterprise FA ops  

**Community capital lanes (site CTAs):** Invest · Participate · Donate  
Fund split (published): GPU 42% · corpus 28% · raters 18% · ops 12%

---

## Agent work classification

| Class | Do |
|-------|-----|
| **G0** | Explain thesis or plan (read-only) |
| **G1** | Single page or plan section edit |
| **G2** | Site + plan + config sync |
| **G3** | Full product verify + closeout |

Classify every task before editing.

---

## Hard rules (locked)

| Rule | Detail |
|------|--------|
| **Persian-first** | Never frame as English model with FA skin |
| **Receipt before claim** | No score without eval card on disk |
| **Corpus law** | Provenance + license on every shard claim |
| **Port 5293 only** | See `PORT_LOCK.json` — never share with PLR 5294 |
| **Scope** | Edit only `~/Desktop/ALEFBA/` — not PLR, not PLUS ONE unless ordered |
| **No PLR self-listing** | Do not add Alefbâ to `reference-manifest.json` until G2+ receipts |
| **No fake metrics** | Community counters = real local receipts only |
| **PRIVATE_CONFIDENTIAL** | No public GitHub push without founder authority |
| **Forbidden registers** | No invented benchmarks, no hype “AGI”, no vanity numbers |

---

## Coming online — staged plan

| Stage | “Online” means | Agent work |
|-------|----------------|------------|
| **A0 (now)** | Charter site on `:5293` · white paper · local interest/receipts | Maintain site · sync content · E2E green |
| **A1** | Public repo **if founder authorizes** · corpus inventory schema on disk | `corpus-inventory.json` · license map · methodology public slice |
| **A2** | Tokenizer spec + coverage report · eval harness repo | G1 gate evidence · fertility metrics |
| **A3** | HF weights or paper · first **measured** Persian eval | G2 score card · PLR earns **one row** (founder order) |
| **A4** | API endpoint · Studio alpha · design partners | G3 gate · security · usage receipts |
| **A5** | Paying vertical | G4 · `PASS_COMMERCIAL_PILOT` |

**Deploy authority:** Local loopback is default. Production domain, public repo, and fundraising copy require **explicit founder order** per stage.

---

## Short-term priorities (weeks 1–8) — local polish, not public

| # | Work |
|---|------|
| 1 | Desktop drift — `repoRoot`, workflow paths, stale PLUS ONE references |
| 2 | Re-run E2E on Desktop — confirm GREEN; fix RED |
| 3 | Persian copy pass — literary register, no calques |
| 4 | Four-door clarity — one obvious CTA per audience |
| 5 | Receipts honesty — gates stay `pending`; improve empty-state copy only |
| 6 | Corpus narrative — Gate 1 brief credible for publishers |
| 7 | Data room completeness — index matches disk |
| 8 | Society wall hygiene — filter `@alefba.local` E2E rows from display if shown |
| 9 | White paper sync — governance MD ↔ web WP |
| 10 | SEO/meta pass — OG, titles — for future launch only |

**Success:** Founder opens `:5293`, hands to investor / publisher / engineer — each finds their door in one session.

## Milestone ladder

| Stage | Bar |
|-------|-----|
| **Now** | Local `:5293` · four doors · E2E green · honest empty gates |
| **Private repo** | Optional GitHub backup — not marketing deploy |
| **Gate 1 receipt** | Tokenizer/corpus proof on disk + site |
| **Public charter** | Domain + polished site — founder order only |
| **Gate 2+** | Base + instruct + API alpha |
| **PLR entry** | One measured row in reference atlas — earned |

---

### Science
- [ ] Corpus inventory v1 (`license class` · `volume band` · `source` per shard)
- [ ] License map (publisher targets · public-domain corpus list)
- [ ] Tokenizer v1 spec + alphabet coverage test suite
- [ ] Eval harness v1 (ortho/morph probes · FA reading subset · rubric template)
- [ ] Baseline comparison doc (fair multilingual checkpoint + Persian replay plan)

### Site / charter
- [ ] `npm run e2e` green on `:5293`
- [ ] White paper ↔ governance sync (`sync-content.mjs`)
- [ ] Receipts page shows real gates only (no fake progress)
- [ ] Corpus page reflects inventory when it exists

### Governance
- [ ] Gate G1 criteria frozen in `receipts.json` when tokenizer passes
- [ ] Changelog for charter versions (mirror PLR discipline)

### Explicitly not Phase 1
- Training runs at scale without G1  
- Public API  
- PLR registry row  
- Competing with MohammadHeydari's Awesome list  

---

## Relation to PLR (coordination, not merger)

| PLR agent does | Alefbâ agent does |
|---------------|-------------------|
| Grow neutral atlas · PyPI · citations | Build tokenizer · corpus · model · API |
| Document gap honestly | Try to close gap #1–#4 with science |
| Credit Awesome · MIZAN · PartAI | Use PLR manifest as **field radar**, not SSOT for Alefbâ |
| Keep `alefbaAxes` / gap map current | When G2 ships → notify founder for **one** PLR row PR |

**Workflow:** Monthly read PLR `gapMap` + manifest stats — no code coupling between repos.

---

## Team & capital shape (plan only)

| Role | Why |
|------|-----|
| NLP / LLM lead | Training + eval |
| Persian corpus lead | Licensing + quality |
| MLOps | Runs + API |
| Product / GTM | Design partners |
| Legal (fractional) | Copyright + data |

Capital: **GPU + corpus licenses + raters + runway** — not marketing before eval receipts.

---

## Risks & counters

| Risk | Counter |
|------|---------|
| Copyright | Publisher deals · PD first · no scrape strategy |
| Compute | Start 1–3B · measure lift before scale |
| English-model competition | Persian depth + verticals |
| Eval gaming | Holdouts · human panels · public cards |
| Scope bleed into PLR | Port lock · separate repos · separate agents |

---

## First actions for new agent

1. Read `CONCEPT_BRIEF.md` → `COMMERCIAL_SCIENTIFIC_PLAN.md` → `WHITE_PAPER.md` (skim gates + forbidden failures)
2. `cd workspace && npm start` → open http://127.0.0.1:5293/
3. `npm run e2e` — must pass before claiming site work done
4. Classify task: **G0–G3**
5. If science work: corpus inventory or tokenizer spec — **not** more charter copy unless G1
6. **Do not** edit `~/Desktop/PERSIAN-LLM-REFERENCE/` unless explicitly ordered (PLR lane)

---

## Verdicts

| Verdict | Meaning |
|---------|---------|
| `PASS_PLAN_LIVE` | Plan on disk + startup site on loopback |
| `PASS_SCIENCE_READY` | Tokenizer + eval harness + corpus inventory exist |
| `PASS_COMMERCIAL_PILOT` | Paying or contracted partner on API/Studio |
| `BLOCKED_SCOPE_BREACH` | Touched PLR registry, wrong port, or public claim without receipt |
| `BLOCKED_PUBLIC_SHIP` | Deploy/fundraise without founder authority |

---

## Related (external)

| Resource | URL |
|----------|-----|
| PLR atlas (field mirror) | https://sinakazemnezhad.github.io/persian-llm-reference/ |
| PLR manifest | https://raw.githubusercontent.com/sinakazemnezhad/persian-llm-reference/main/data/reference-manifest.json |
| Awesome-Persian-LLM | https://github.com/MohammadHeydari/Awesome-Persian-LLM |

---

*Alefbâ / الفبا · v0.2.1 · PRIVATE_CONFIDENTIAL · Desktop standalone*
