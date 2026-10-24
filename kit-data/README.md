# Hackachusetts starter-kit data

These CSV extracts were supplied with the Hackachusetts V2 starter kit and
saved on 2026-10-18. They are converted into the static application data by:

\`\`\`bash
npm run prepare-data
\`\`\`

- \`boston-311.csv\`: de-identified Boston 311 service-request extract
- \`ej.csv\`: MassGIS environmental-justice block-group extract
- \`fema.csv\`: OpenFEMA Massachusetts disaster-declaration extract

The conversion and application limitations are documented in
\`scripts/convert-kit-data.mjs\` and the Data & Limitations page.
