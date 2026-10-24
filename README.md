# CivicPulse

**CivicPulse** is an explainable dashboard for exploring repeated Boston 311 service-request patterns and supporting equitable human review. It was built for the **Hackachusetts 2026 — Civic Action** track.

> **Important:** CivicPulse is a demonstration project, not an official City of Boston service. It does not make enforcement, benefit, emergency, or eligibility decisions.

## The problem

Public service-request data can show where recurring issues may need attention, but raw records are hard to interpret quickly and can be misused. CivicPulse turns aggregate patterns into plain-language review prompts while keeping the final judgement with people.

## What CivicPulse does

- Filters Boston 311-style requests by neighborhood, service topic, department, case status, and date.
- Summarizes total requests, open cases, neighborhoods, and service topics.
- Ranks neighborhood-and-topic combinations using an explainable score based on open cases, repeated requests, delayed resolutions, and aggregate outreach context.
- Provides an expandable Action Brief explaining what the data shows, why human review may be useful, the source, snapshot date, and limitations.
- Shows Massachusetts FEMA declarations strictly as historical preparedness context, never as a live alert or risk assessment.
- Documents every dataset, its limitations, and links to official public sources.

## Run locally

Requires Node.js 24+ and npm.

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

The app intentionally ships with **synthetic demonstration data**. It is modeled on public data structures but is not a live feed and must not be used to infer an individual resident, an exact address, a current case outcome, or an official operational decision.

| Data context | In-app use | Official reference |
| --- | --- | --- |
| Boston 311 | Aggregate service-request patterns | [Boston 311 Open Data](https://data.boston.gov/) |
| Environmental Justice | Aggregate neighborhood outreach context only | [Massachusetts EJ population data](https://www.mass.gov/info-details/environmental-justice-populations-in-massachusetts) |
| FEMA | Historical Massachusetts disaster declarations | [FEMA OpenFEMA](https://www.fema.gov/about/openfema) |

No personal information is collected, shown, or used for profiling. The environmental-justice indicator is a neighborhood-level context flag, not a claim about any person. FEMA information is historical only; use official emergency channels for current information.

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
src/data/               Typed local synthetic datasets and scoring utilities
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
