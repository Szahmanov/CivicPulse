# CivicPulse

**CivicPulse** is an explainable dashboard for exploring repeated Boston 311 service-request patterns and supporting equitable human review. It was built for the **Hackachusetts 2026 — Civic Action** track.

> **Important:** CivicPulse is a demonstration project, not an official City of Boston service. It does not make enforcement, benefit, emergency, or eligibility decisions.

## Live demo

Visit **[civic-pulse-eight-rho.vercel.app](https://civic-pulse-eight-rho.vercel.app/)** for the public static demo.

## The problem

Public service-request data can show where recurring issues may need attention, but raw records are hard to interpret quickly and can be misused. CivicPulse turns aggregate patterns into plain-language review prompts while keeping the final judgement with people.

## What CivicPulse does

- Filters Boston 311-style requests by neighborhood, service topic, department, case status, and date.
- Summarizes total requests, open cases, neighborhoods, and service topics.
- Ranks neighborhood-and-topic combinations using an explainable score based on open cases, repeated requests, and on-time status.
- Provides an expandable Action Brief explaining what the data shows, why human review may be useful, the source, snapshot date, and limitations.
- Shows Massachusetts FEMA declarations strictly as historical preparedness context, never as a live alert or risk assessment.
- Documents every dataset, its limitations, and links to official public sources.

## Run locally

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality checks:

```bash
npm test
npm run build
```

`npm run build` creates a static export in `out/`.

## Data and limitations

The app ships with static, de-identified extracts supplied in the Hackachusetts starter kit and saved on 2026-10-18. It is not a live feed and must not be used to infer an individual resident, an exact address, a current case outcome, or an official operational decision.

| Data context | In-app use | Official reference |
| --- | --- | --- |
| Boston 311 | 4,990 valid de-identified service-request rows from the supplied 5,000-row extract | [Boston 311 Service Requests](https://data.boston.gov/dataset/311-service-requests) |
| Environmental Justice | Citywide Boston block-group context only; it does not affect the score | [MassGIS 2020 Environmental Justice Populations](https://www.mass.gov/info-details/massgis-data-2020-environmental-justice-populations) |
| FEMA | 415 historical Massachusetts declaration rows from the supplied extract | [OpenFEMA Disaster Declarations Summaries v2](https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2) |

No personal information is collected, shown, or used for profiling. The environmental-justice extract is not mapped to neighborhoods and does not affect priority scores. FEMA information is historical only; use official emergency channels for current information.

To regenerate the derived JSON data from the committed starter-kit CSV extracts:

```bash
npm run prepare-data
```

## AI in the development process

AI-assisted development was used to build and verify CivicPulse. The product itself makes no runtime LLM or AI API calls: its ranking is a transparent, deterministic calculation so users can inspect the evidence behind each review prompt.

## How Kiro was used

Kiro IDE was the primary development environment for this project.

1. We created a structured specification in [`.kiro/specs/civicpulse/`](.kiro/specs/civicpulse/) with requirements, design, and a task plan before implementation.
2. Kiro scaffolded the Next.js, TypeScript, and Tailwind project and implemented the tasks from that spec.
3. Kiro supported the test and accessibility workflow, including real axe-core accessibility audits and build verification.
4. The committed `.kiro` directory preserves the project process and can be reviewed alongside the implementation.

## Project structure

```text
.kiro/specs/civicpulse/  Kiro requirements, design, and task traceability
src/app/                Dashboard, preparedness, and data-limitation pages
src/components/         Filters, cards, tables, charts, and accessible UI
kit-data/               Supplied, de-identified CSV extracts and provenance notes
scripts/                Reproducible CSV-to-JSON conversion
src/data/               Typed local extract loaders and scoring utilities
src/test/               Test setup and accessibility checks
```

## Responsible-use principles

- Human review first: priority scores help decide what to inspect, not what action to take.
- Explainability: each priority card exposes its factors and a plain-language Action Brief.
- Privacy: no people, addresses, or resident-level profiles.
- Transparency: visible sources, snapshot dates, and limitations.
- Accessibility: keyboard-accessible controls, responsive layout, and automated accessibility checks.

## License

Created for Hackachusetts 2026.
