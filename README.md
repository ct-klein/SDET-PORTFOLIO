# SDET Portfolio – Christopher Klein

Automated test suite demonstrating end-to-end, API, and data-integrity testing
using **Playwright** and **TypeScript**, with CI/CD integration via **Azure DevOps**.

---

## Why This Stack

| Technology | Reason |
|---|---|
| Playwright | Modern, cross-browser, first-class TypeScript support. Faster and more reliable than Selenium for most use cases. |
| TypeScript | Type safety catches bugs at write-time. Industry standard for Playwright projects. Carried over from 6+ years of professional TypeScript/JavaScript development. |
| Azure DevOps | Used professionally at CAPTRUST for CI/CD pipeline management — not learned for this portfolio, applied from real experience. |

---

## Project Structure

```
sdet-portfolio/
├── tests/
│   ├── e2e/
│   │   └── todo.spec.ts        # E2E suite – TodoMVC app (Page Object Model)
│   ├── api/
│   │   └── posts.spec.ts       # API suite – REST CRUD + data integrity checks
│   └── utils/
│       └── TodoPage.ts         # Page Object Model for the Todo app
├── reports/                    # Generated after test run (gitignored)
├── playwright.config.ts        # Multi-browser config, reporters, retries
├── azure-pipelines.yml         # CI/CD pipeline – runs on PR and main push
└── package.json
```

---

## What This Suite Demonstrates

### Design Patterns
- **Page Object Model (POM)** — UI interactions abstracted into reusable classes.
  Tests stay readable; if the UI changes, only the POM needs updating.
- **Data-driven testing** — Parameterized edge-case inputs (special characters,
  unicode, XSS payloads, boundary lengths).
- **Shared context management** — `beforeAll`/`beforeEach` hooks ensure test
  isolation without redundant setup.

### Test Coverage
- **Positive paths** — happy path CRUD flows
- **Negative paths** — 404 handling, empty inputs, missing fields
- **Edge cases** — whitespace-only input, very long strings, special characters
- **Data integrity** — relational validation between API entities (comments → posts)
- **Response time assertions** — SLA-aware checks relevant to financial systems
- **Schema validation** — every API response field typed and verified

### CI/CD Integration
- Runs on every PR and push to `main`/`develop`
- Parallel browser execution (Chromium, Firefox, WebKit)
- JUnit XML results published to Azure DevOps test dashboard
- HTML report uploaded as pipeline artifact
- Failure traces, screenshots, and videos captured automatically

---

## Running Locally

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests (headless)
npm test

# Run only E2E tests
npm run test:e2e

# Run only API tests
npm run test:api

# Run with browser visible
npm run test:headed

# Open HTML report after run
npm run test:report
```

---

## Background

I bring 15+ years of professional software development experience across
financial services and fintech — including C#, TypeScript, SQL Server, and
Azure DevOps — to the SDET discipline. This portfolio demonstrates applied
test automation skills built on a strong existing technical foundation.

Key transferable strengths for SDET work:
- **Azure DevOps CI/CD** used professionally — not learned for this project
- **TypeScript/JavaScript** used professionally at CAPTRUST (2019–2025)
- **SQL Server** — database validation is a core SDET skill; deep expertise here
- **Financial domain knowledge** — critical for fintech and financial software QA
- **API integration experience** — built and maintained third-party API integrations

---

## Contact

Christopher Klein | Durham, NC
ct_klein@hotmail.com | 919.599.4221
[LinkedIn](https://www.linkedin.com/in/christopher-klein-9684b823)
