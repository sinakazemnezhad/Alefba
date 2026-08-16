# Alefbâ — Commercial Scientific Plan

<!-- dis-brand-agent: repo=PLUS ONE product=DIS BRAND tag=DIS-PLUSONE-ALEFBA-GOVERNANCE-COMMERCIAL-SCIENTIFIC-PLAN-MD name="DIS BRAND Governed Agent" action=edit at=2026-08-09T19:10:50.813Z file=ALEFBA/governance/COMMERCIAL_SCIENTIFIC_PLAN.md -->

## 0. One-line company

**Alefbâ builds Persian foundation intelligence trained from the Persian alphabet upward through words, stories, and books — then ships it as API and vertical products.**

---

## 1. Scientific thesis

### 1.1 Problem

Multilingual models often allocate a small share of pretraining to Persian. Tokenizers can waste capacity on Latin bias. Evaluation can hide Persian gaps behind English-translated tasks. Cultural register (formal, poetic, colloquial, bureaucratic) can collapse into one flat “Farsi.”

### 1.2 Hypothesis

A model whose **pretraining curriculum is Persian-first** — alphabet and orthography → high-coverage lexicon → narrative prose → literary and scholarly books — can show meaningful lift over fair baselines on:

| Axis | Why it matters |
|------|----------------|
| Orthographic fidelity | ZWNJ, heh yeh forms, diacritic optionality |
| Morphological generalization | Verb paradigms, compounds, ezafe |
| Register control | News vs poetry vs chat vs legal |
| Long-form coherence | Story and book-length discourse |
| Cultural grounding | Allusion, proverb, historical reference |

### 1.3 Curriculum stages (scientific order)

| Stage | Content | Scientific goal |
|-------|---------|-----------------|
| **A0 Alphabet** | Letters, forms, joining rules, digits, punctuation | Character-level competence |
| **A1 Orthography** | Spelling norms, ZWNJ, common OCR errors | Noise-robust writing system |
| **L0 Lexicon** | Dictionaries, lemmas, collocations, named entities | Dense lexical coverage |
| **N0 Narrative** | Children’s stories, folk tales, modern short fiction | Plot, causality, dialogue |
| **B0 Books** | Classical + contemporary books, essays, textbooks | Long context + knowledge |
| **P0 Poetry** | Metered and free verse (controlled weight) | Prosody without overfitting rhyme |
| **C0 Contemporary** | News, forums (filtered), technical manuals | Living usage |
| **I0 Instruct** | Human-written Persian instruction pairs | Task following |
| **R0 Align** | Preference data with native raters | Helpfulness + cultural safety |

### 1.4 Model stack (research program)

1. **Tokenizer** — Persian-aware BPE/Unigram with alphabet coverage guarantees; Latin as secondary.
2. **Base** — decoder LLM sized for compute reality (start 1–3B research; scale when corpus + capital clear).
3. **Continual pretrain** — if bootstrapping from an open multilingual checkpoint, **Persian re-centering** must be measured (tokenizer remapping + heavy Persian replay).
4. **Instruct + DPO/ORPO** — native Persian preference loops.
5. **Retrieval option** — book/corpus RAG for grounded citation products.

### 1.5 Evaluation law (no slogan claims)

| Suite | Measures |
|-------|----------|
| Orthography / morphology probes | Script and form accuracy |
| Persian MMLU-style knowledge | Factual FA knowledge |
| Reading comprehension (FA) | Passage QA |
| Generation rubrics | Fluency, register, cultural fit (human panel) |
| Toxicity / refusal (FA) | Safety in Persian contexts |
| Translation FA↔EN | Bridge quality, not the product center |

**Ship gate:** publish score cards with date, split, and model hash. No capability claim without a receipt.

### 1.6 Data law

- Prefer **licensed, publisher-partnered, and public-domain** text.
- Track provenance, license class, PII filters, and quality grade per shard.
- Separate **train / validation / public eval** to prevent leakage.
- Never claim “all Persian books” — claim **curated volume bands** with provenance.

---

## 2. Commercial thesis

### 2.1 Market

Persian speakers need native AI for education, media, government-adjacent workflows, diaspora services, and enterprise support — where English-centric models degrade quality, trust, and brand.

### 2.2 Beachhead customers

| Segment | Pain | First offer |
|---------|------|-------------|
| EdTech / schools | Weak FA tutoring | Alefbâ Tutor API |
| Publishers / archives | Search + summarize corpus | Alefbâ Library tools |
| Media / content teams | Draft + edit FA copy | Alefbâ Studio |
| Enterprise (FA ops) | Support, docs, knowledge | Private endpoint |

### 2.3 Product ladder

1. **Alefbâ Research** — papers, eval cards, open small checkpoints (selectively)
2. **Alefbâ API** — chat + completion + embeddings (Persian-first)
3. **Alefbâ Studio** — vertical UIs (education, publisher, support)
4. **Alefbâ Private** — VPC / on-prem for regulated buyers

### 2.4 Revenue model

| Stream | Timing |
|--------|--------|
| API usage (tokens) | After instruct MVP |
| Studio seats | With vertical 1 |
| Private deployment + support | Enterprise |
| Corpus partnership (publisher revenue share on tools) | Parallel |

### 2.5 Research depth

1. **Curriculum + tokenizer** designed for Persian literature
2. **Licensed literary corpus** via publisher deals
3. **Native evaluation + rater network** — open to collaboration
4. **Vertical products** anchored in workflow and receipts

---

## 3. Eighteen-month roadmap

| Phase | Months | Outcome |
|-------|--------|---------|
| **P1 Foundation** | 0–3 | Corpus inventory · license map · tokenizer v1 · eval harness |
| **P2 Base research** | 3–8 | First base model · orthography/morphology score cards · paper draft |
| **P3 Instruct MVP** | 8–12 | Instruct model · API alpha · 3 design partners |
| **P4 Verticals** | 12–18 | Studio for education or publishers · paid pilots · Private path |

---

## 4. Team & capital shape (plan, not hire claim)

| Role | Why |
|------|-----|
| NLP / LLM lead | Training + eval science |
| Persian corpus lead | Licensing + quality |
| Backend / MLOps | Training runs + API |
| Product / GTM | Design partners |
| Legal counsel (fractional) | Copyright + data |

Capital use: **GPU + corpus licensing + raters + 18 months runway** — not marketing theater before eval receipts.

---

## 5. Risks & counters

| Risk | Counter |
|------|---------|
| Copyright | Publisher partnerships; public-domain first; scrapers banned as strategy |
| Compute cost | Start smaller; measure lift before scale |
| English-model chat parity | Focus on Persian depth + verticals with native measurement |
| Eval gaming | Hold out sets; human panels; public cards |
| Geopolitics / infra | Multi-region hosting options; Private lane |

---

## 6. Community capital lanes (startup page CTA)

Three public entry lanes on the commercial site:

| Lane | Who | What they unlock |
|------|-----|------------------|
| **Invest** | Angels · seed · funds | GPU runway · equity conversation · milestone updates |
| **Participate** | Builders · linguists · publishers · ambassadors | Corpus craft · eval guild · product crew |
| **Donate** | Community supporters | Training hours · book license packs · rater weeks · public score cards |

Capital use published on-page: GPU ~42% · corpus licenses ~28% · raters/eval ~18% · product/ops ~12%.

Interest captures to local ledger until outreach wiring is live.

---

## 7. Verdict definition

| Verdict | Meaning |
|---------|---------|
| `PASS_PLAN_LIVE` | Plan on disk + startup page serving on loopback |
| `PASS_SCIENCE_READY` | Tokenizer + eval harness + corpus inventory exist |
| `PASS_COMMERCIAL_PILOT` | Paying or contracted design partner on API/Studio |
