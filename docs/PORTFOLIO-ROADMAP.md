# Portfolio Web App — Implementation Roadmap

> Phased plan to migrate the Google Sheets portfolio rebalancing system to a web app
> Generated: 2026-03-18

---

## Summary

| Phase | Name | Focus | Dependencies |
|-------|------|-------|-------------|
| 1 | Foundation | DB schema, auth, basic CRUD | Supabase project exists |
| 2 | Core Engine | Rebalancing algorithm + price fetching | Phase 1 |
| 3 | Scoring System | Questionnaire builder + asset scoring | Phase 2 |
| 4 | Data Migration | Import spreadsheet data into DB | Phase 3 |
| 5 | Polish & History | Charts, contributions log, mobile UX | Phase 4 |

---

## Phase 1: Foundation

**Goal**: Database schema, authentication integration, basic asset type/group/asset CRUD.

### Tasks

- [ ] **1.1 Database schema & migrations**
  - Create all tables from PORTFOLIO-ARCHITECTURE.md
  - Run `supabase db push` or create migration files
  - Verify RLS policies work correctly
  - Seed with the 10 asset types from the spreadsheet

- [ ] **1.2 API routes — Portfolio CRUD**
  - `GET/POST /api/portfolio/types` — list & create asset types
  - `PUT/DELETE /api/portfolio/types/[id]` — update target %, archive
  - `GET/POST /api/portfolio/groups` — groups within a type
  - `GET/POST /api/portfolio/assets` — assets within a group
  - `PUT /api/portfolio/assets/[id]` — update quantity, toggle active

- [ ] **1.3 Central dashboard page**
  - `/dashboard/portfolio` — Astro page with React islands
  - Display asset types with target % and current value (static initially)
  - Contribution amount input (UI only, no calculation yet)
  - Navigation to asset type pages

- [ ] **1.4 Asset type page**
  - `/dashboard/assets/[type]` — shows groups in the type
  - Group cards with name, target %, asset count
  - Link to group detail page

- [ ] **1.5 Group detail page**
  - `/dashboard/assets/[type]/[group]` — asset table
  - Display ticker, quantity, manual price, value
  - Add/edit/remove assets

### Deliverables
- Working CRUD for the entire type → group → asset hierarchy
- Dashboard showing portfolio structure (without live prices)
- All data persisted in Supabase

---

## Phase 2: Core Engine

**Goal**: Live price fetching, exchange rates, and the complete rebalancing algorithm.

### Tasks

- [ ] **2.1 Price API integration**
  - brapi.dev client for B3 stocks & FIIs (~120 tickers)
  - Yahoo Finance client for US ETFs (~20 tickers)
  - Price cache table with 5-minute TTL
  - Batch refresh endpoint (`POST /api/prices/refresh`)

- [ ] **2.2 Exchange rate fetching**
  - USD/BRL via exchangerate-api.com
  - BTC/BRL and BTC/USD (for crypto assets)
  - Cache with 15-minute TTL
  - `GET /api/exchange-rates`

- [ ] **2.3 Rebalancing engine**
  - Implement the 3-level algorithm in `src/lib/rebalance.ts`
  - L1: Distribute contribution across asset types (deficit-based)
  - L2: Distribute within type to groups (by target %)
  - L3: Distribute within group to assets (by score/ideal %)
  - Handle currency conversion for international assets
  - `POST /api/rebalance` endpoint

- [ ] **2.4 Dashboard integration**
  - Pie chart: current allocation vs target (Recharts)
  - Real-time prices displayed in asset tables
  - Auto-refresh toggle (5min interval)
  - Contribution input → triggers rebalance → shows results
  - "Units to buy" column in results

- [ ] **2.5 Price display in asset tables**
  - Show live prices in group detail page
  - Color coding: green (up), red (down) vs previous close
  - Last updated timestamp
  - Manual refresh button

### Deliverables
- Live prices for all 140+ assets
- Working rebalancing calculation matching spreadsheet results
- Interactive contribution simulation on dashboard

---

## Phase 3: Scoring System

**Goal**: Questionnaire builder, asset scoring, and score-driven ideal % calculation.

### Tasks

- [ ] **3.1 Questionnaire CRUD**
  - `/dashboard/questionnaires` — list presets
  - `/dashboard/questionnaires/[id]` — edit questions
  - Add/edit/delete questions
  - Support for inverted questions (Yes = -1)
  - Weight per question (default 1)

- [ ] **3.2 Asset scoring UI**
  - Scoring modal: select asset → answer questions → see score
  - Batch scoring: "Score All" button for a group
  - Score preview: show how score converts to ideal %
  - Visual indicator: scored/unscored assets

- [ ] **3.3 Manual allocation mode**
  - Toggle between "questionnaire" and "manual" per group
  - Manual mode: user directly sets ideal % per asset
  - Validation: percentages must sum to 100% within group

- [ ] **3.4 Score normalization**
  - Implement the spreadsheet's score → ideal % formula
  - Handle negative scores (exclude from allocation)
  - Handle Grupo 0 (excluded assets)
  - Real-time recalculation when scores change

- [ ] **3.5 "Vou aportar?" toggle**
  - Per-asset toggle to include/exclude from rebalancing
  - Overrides scoring — if excluded, asset gets 0 contribution
  - Persisted in `assets.manual_override` column

### Deliverables
- Full questionnaire system matching spreadsheet's Balanceamentos tab
- Score-driven rebalancing identical to spreadsheet calculations
- Manual override capability

---

## Phase 4: Data Migration

**Goal**: Import all existing spreadsheet data into the web app.

### Tasks

- [ ] **4.1 Migration script**
  - Parse `data/portfolio.xlsx` using xlsx library
  - Extract all asset types, groups, assets, quantities
  - Extract all questionnaire answers and scores
  - Map spreadsheet groups (Grupo 1-5) to DB records

- [ ] **4.2 Data validation**
  - Compare rebalancing results: spreadsheet vs web app
  - Verify total portfolio value matches
  - Verify contribution distribution matches
  - Fix any discrepancies in the algorithm

- [ ] **4.3 Questionnaire migration**
  - Extract questions from Balanceamentos tab
  - Create questionnaire presets in DB
  - Import all asset scores/answers
  - Verify score → ideal % matches spreadsheet

- [ ] **4.4 Historical data**
  - Import any historical contribution data if available
  - Set initial avg_cost from available data
  - Note: historical prices not available from spreadsheet

### Deliverables
- Complete data migration from spreadsheet to web app
- Verified numerical parity between spreadsheet and web app
- Clean, validated dataset

---

## Phase 5: Polish & History

**Goal**: Charts, contribution tracking, export, mobile responsiveness.

### Tasks

- [ ] **5.1 Contribution history**
  - `/dashboard/contributions` — log of past contributions
  - Record each applied rebalancing with distribution details
  - Date, amount, per-asset breakdown
  - Running total and growth over time

- [ ] **5.2 Performance metrics**
  - Portfolio value over time (requires price history)
  - ROI per asset (current value vs invested amount)
  - Dividend yield tracking (monthly income estimate)
  - Asset allocation drift chart

- [ ] **5.3 Export functionality**
  - Export current portfolio to CSV
  - Export rebalancing plan to CSV
  - Print-friendly view for contribution results

- [ ] **5.4 Mobile responsive**
  - Test and fix all pages on mobile
  - Touch-friendly scoring modal
  - Collapsible tables for narrow screens
  - Bottom navigation on mobile

- [ ] **5.5 Notifications**
  - Email/Telegram notification when prices refresh
  - Alert when allocation drift exceeds threshold (e.g., >5% deviation)
  - Monthly portfolio summary via OpenClaw

### Deliverables
- Complete portfolio management web app
- Contribution tracking with history
- Mobile-friendly interface
- Export and notification capabilities

---

## Data Model: Spreadsheet → Web App Mapping

| Spreadsheet Concept | Web App Equivalent |
|---------------------|--------------------|
| Tab "Distribuição de aporte" | `asset_types` table + rebalance API |
| Tab "RI, RV e RF" / "FII" / "Ações" / "Exterior" | `asset_groups` + `assets` tables |
| Tab "Balanceamentos" | `questionnaires` + `asset_scores` tables |
| GOOGLEFINANCE() | brapi.dev / Yahoo Finance APIs |
| "Grupo 0" (excluded) | `assets.is_active = false` |
| "Vou aportar?" column | `assets.manual_override = true` |
| Row "TOTAL" / "Soma" | Computed at query time (SUM aggregates) |
| Cell references between tabs | JOIN queries + application logic |
| Manual input cells (qty, target %) | Editable fields in UI + DB updates |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| brapi.dev rate limit | Can't refresh prices | Implement longer cache, fallback to StatusInvest scraping |
| Yahoo Finance API changes | US prices unavailable | Use Alpha Vantage as backup (500 req/day free) |
| Algorithm mismatch | Wrong rebalancing results | Phase 4.2 validates against spreadsheet with real data |
| Supabase free tier limits | Service degradation | Single user is well within limits; upgrade to Pro ($25/mo) if needed |
| Browser timezone issues | Wrong market hours detection | Use server-side market hour checks in Edge Functions |

---

## Success Criteria

Phase is complete when:
1. All tasks are checked off
2. Rebalancing results match the spreadsheet within R$ 0.01 tolerance
3. No console errors in browser
4. Works on mobile Chrome/Safari
5. Data persists correctly in Supabase
