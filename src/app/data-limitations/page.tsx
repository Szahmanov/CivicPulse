/**
 * Data & Limitations page — Server Component.
 *
 * Explains the three datasets used in CivicPulse, what they show, what they
 * cannot show, and provides official source links for each.
 */

import { ALL_EJ_RECORDS, DATA_SNAPSHOT_DATE } from '@/data/loaders';

export const metadata = {
  title: 'Data Sources & Limitations — CivicPulse',
  description:
    'What each dataset in CivicPulse contains, what it cannot show, and where to find the official sources.',
};

export default function DataLimitationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* ------------------------------------------------------------------ */}
      {/* Page heading                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Data Sources &amp; Limitations
        </h1>

        {/* ---------------------------------------------------------------- */}
        {/* Introductory paragraph                                           */}
        {/* ---------------------------------------------------------------- */}
        <p className="text-gray-700 leading-relaxed">
          CivicPulse uses saved, de-identified Hackachusetts starter-kit
          extracts. This page explains what each dataset contains, what it
          cannot show, and where to find the official sources.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 1: Boston 311 Service Requests                             */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="section-311" className="space-y-3">
        <h2
          id="section-311"
          className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2"
        >
          Boston 311 Service Requests
        </h2>

        <div className="space-y-2 text-gray-700 leading-relaxed">
          <p>
            <strong>What it contains:</strong> A saved, de-identified extract
            of Boston&#39;s 311 non-emergency service requests. Fields include
            service topic, neighborhood, department, case status, submission
            date, and an on-time status.
          </p>
          <p>
            <strong>What it shows:</strong> Patterns of service demand by
            neighborhood and service type over time.
          </p>
          <p>
            <strong>How CivicPulse maps the extract:</strong> Rows whose source
            status is <em>Closed</em> are shown as closed; all other source
            statuses are shown as open for review. The source on-time field is
            used as the dashboard&#39;s on-time status.
          </p>
          <p>
            <strong>What it cannot show:</strong> Individual resident
            information, exact addresses, source case IDs, close dates, or
            current operational status. This is a saved extract, not a live
            feed.
          </p>
        </div>

        <p className="text-sm text-gray-500">
          Starter-kit snapshot date: {DATA_SNAPSHOT_DATE}
        </p>

        <p>
          <a
            href="https://data.boston.gov/dataset/311-service-requests"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Boston 311 Open Data on data.boston.gov (opens in new tab)"
            className="text-blue-700 underline underline-offset-2 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded text-sm"
          >
            Boston 311 Open Data on data.boston.gov (opens in new tab)
          </a>
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: Environmental Justice Outreach Context                  */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="section-ej" className="space-y-3">
        <h2
          id="section-ej"
          className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2"
        >
          Environmental Justice Outreach Context
        </h2>

        <div className="space-y-2 text-gray-700 leading-relaxed">
          <p>
            <strong>What it contains:</strong> A saved MassGIS extract of
            environmental-justice block groups. The supplied extract contains{' '}
            {ALL_EJ_RECORDS[0]?.flaggedBlockGroupCount ?? 0} rows flagged
            EJ=Yes for the municipality of Boston.
          </p>
          <p>
            <strong>What it shows:</strong> Citywide context only. The source
            extract does not provide a reliable mapping from block groups to
            the Boston neighborhoods used by this dashboard.
          </p>
          <p>
            <strong>What it cannot show:</strong> Individual resident
            characteristics, income, race, or any personal information. It
            does not support a neighborhood-level claim in CivicPulse.
          </p>
        </div>

        {/* Important limitation box */}
        <div
          role="note"
          className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 rounded-r text-blue-900 text-sm leading-relaxed"
        >
          The EJ extract is not used in priority scores. It is included as
          citywide context only, does not profile individual residents, and
          does not constitute an official environmental justice determination.
        </div>

        <p className="text-sm text-gray-500">
          Starter-kit snapshot date: {DATA_SNAPSHOT_DATE}
        </p>

        <p>
          <a
            href="https://www.mass.gov/info-details/environmental-justice-populations-in-massachusetts"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MA Environmental Justice Population Data on mass.gov (opens in new tab)"
            className="text-blue-700 underline underline-offset-2 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded text-sm"
          >
            MA Environmental Justice Population Data on mass.gov (opens in new
            tab)
          </a>
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3: FEMA Disaster Declarations                              */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="section-fema" className="space-y-3">
        <h2
          id="section-fema"
          className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2"
        >
          FEMA Disaster Declarations (Historical)
        </h2>

        <div className="space-y-2 text-gray-700 leading-relaxed">
          <p>
            <strong>What it contains:</strong> Historical FEMA Major Disaster
            Declarations for Massachusetts, from the OpenFEMA public dataset
            supplied in the Hackachusetts starter kit.
          </p>
          <p>
            <strong>What it shows:</strong> A record of past federally declared
            disasters in Massachusetts, useful as historical civic preparedness
            context.
          </p>
          <p>
            <strong>What it cannot show:</strong> Current hazard conditions,
            current emergency alerts, or risk assessments. This data is
            historical only.
          </p>
        </div>

        {/* Important limitation box */}
        <div
          role="note"
          className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r text-amber-900 text-sm leading-relaxed"
        >
          FEMA data shown in CivicPulse is historical context only. It is not a
          live emergency alert and is not a current risk assessment. CivicPulse
          does not issue emergency notifications.
        </div>

        <p className="text-sm text-gray-500">
          Starter-kit snapshot date: {DATA_SNAPSHOT_DATE}
        </p>

        <p>
          <a
            href="https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FEMA Disaster Declarations Summary on fema.gov (opens in new tab)"
            className="text-blue-700 underline underline-offset-2 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded text-sm"
          >
            FEMA Disaster Declarations Summary on fema.gov (opens in new tab)
          </a>
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Additional Resources section                                        */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="section-resources" className="space-y-3">
        <h2
          id="section-resources"
          className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2"
        >
          Additional Resources
        </h2>

        <ul className="space-y-3 text-gray-700" role="list">
          <li>
            <a
              href="https://www.mass211.org"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Massachusetts 211 — find local social services help (opens in new tab)"
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded font-medium"
            >
              Massachusetts 211 — Find local help
            </a>{' '}
            — Free, confidential social services referral for Massachusetts
            residents.
          </li>
          <li>
            <a
              href="https://www.mass.gov/emergency-management"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Massachusetts Emergency Management Agency website (opens in new tab)"
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded font-medium"
            >
              Massachusetts Emergency Management Agency
            </a>{' '}
            — Current emergency information for Massachusetts.
          </li>
        </ul>
      </section>
    </div>
  );
}
