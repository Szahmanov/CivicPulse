/**
 * Converts the Hackachusetts V2 starter-kit CSV extracts into the static JSON
 * consumed by CivicPulse. Run with: npm run prepare-data
 *
 * The parser intentionally handles the CSV features used by the supplied
 * extracts (quoted fields, commas inside quotes, CRLF, and escaped quotes)
 * without adding a runtime dependency.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const kitData = join(root, 'kit-data');
const appData = join(root, 'data');
const snapshotDate = '2026-10-18';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

async function readCsv(name) {
  const rows = parseCsv(await readFile(join(kitData, name), 'utf8'));
  const [headers, ...values] = rows;
  return values.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
  );
}

async function writeJson(name, value) {
  await writeFile(join(appData, name), JSON.stringify(value, null, 2) + '\n');
}

const source311 = await readCsv('boston-311.csv');
const requestRecords = source311
  .filter(
    (row) =>
      row.open_date &&
      row.case_topic &&
      row.neighborhood &&
      row.assigned_department,
  )
  .map((row, index) => ({
    // The extract does not contain a case identifier. This is a local row key
    // only; it is never displayed as an official Boston case number.
    caseId: 'kit-row-' + (index + 1),
    serviceTopic: row.case_topic,
    neighborhood: row.neighborhood,
    department: row.assigned_department,
    status: row.case_status === 'Closed' ? 'closed' : 'open',
    submittedDate: row.open_date.slice(0, 10),
    // The supplied extract has no close-date column.
    closedDate: null,
    onTimeResolution: row.on_time === 'ONTIME',
  }));

await writeJson('311-requests.json', {
  meta: {
    snapshotDate,
    source:
      'Boston 311 service requests — Hackachusetts starter-kit extract (de-identified)',
    officialUrl: 'https://data.boston.gov/dataset/311-service-requests',
    limitations:
      'Saved extract from 2026-10-18, not a live feed. Street address, photos, coordinates, and source case IDs are not included. Closed cases have no close-date field in this extract.',
  },
  records: requestRecords,
});

const sourceEj = await readCsv('ej.csv');
const bostonEjCount = sourceEj.filter(
  (row) => row.municipality.trim().toLowerCase() === 'boston' && row.ej === 'Yes',
).length;

await writeJson('ej-outreach-context.json', {
  meta: {
    snapshotDate,
    source:
      'MassGIS environmental justice block groups — Hackachusetts starter-kit extract',
    officialUrl:
      'https://www.mass.gov/info-details/environmental-justice-populations-in-massachusetts',
    limitations:
      'This extract is available at municipality and block-group level, not Boston-neighborhood level. It is shown as citywide context only and does not affect CivicPulse priority scores.',
  },
  records: [
    {
      municipality: 'Boston',
      flaggedBlockGroupCount: bostonEjCount,
      note: 'Count of rows flagged EJ=Yes in the supplied 2026-10-18 extract.',
    },
  ],
});

const sourceFema = await readCsv('fema.csv');
await writeJson('fema-declarations.json', {
  meta: {
    snapshotDate,
    source:
      'OpenFEMA Disaster Declarations Summaries (v2), Massachusetts — Hackachusetts starter-kit extract',
    officialUrl:
      'https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2',
    limitations:
      'Historical declarations only. One row represents a designated area, so one disaster can appear several times. This is not a live alert or a current risk assessment.',
  },
  records: sourceFema.map((row) => ({
    declarationNumber: row.declarationType + '-' + row.disasterNumber,
    title: row.declarationTitle,
    disasterType: row.incidentType,
    declarationDate: row.declarationDate.slice(0, 10),
    state: 'Massachusetts',
    county: row.designatedArea || null,
    programsActivated: [],
  })),
});

console.log(
  'Wrote ' + requestRecords.length + ' 311 records, ' + bostonEjCount +
    ' Boston EJ block groups, and ' + sourceFema.length + ' FEMA rows.',
);
