/**
 * SitewideLayout — React Server Component.
 *
 * Wraps every page with:
 *   1. Skip-to-main link
 *   2. Sticky sitewide safety banner (amber, WCAG AA contrast)
 *   3. Site header / nav bar (NavLinks is a client child for active-link state)
 *   4. <main id="main-content"> wrapping {children}
 *   5. Site footer with data-source links, MA 211, snapshot date, and disclaimer
 *
 * All external links: target="_blank" rel="noopener noreferrer" + descriptive aria-label.
 */

import React from 'react';
import NavLinks from './NavLinks';

export interface SitewideLayoutProps {
  children: React.ReactNode;
  /** ISO 8601 date shown in the footer. Defaults to "2024-01-15". */
  snapshotDate?: string;
}

export default function SitewideLayout({
  children,
  snapshotDate = '2024-01-15',
}: SitewideLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* Skip-to-main link — visually hidden until keyboard focused          */}
      {/* ------------------------------------------------------------------ */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-700 focus:underline focus:font-medium"
      >
        Skip to main content
      </a>

      {/* ------------------------------------------------------------------ */}
      {/* Sitewide safety banner                                              */}
      {/* amber-100 (#fef3c7) on gray-900 (#111827) ≈ 12.6:1 — passes AA   */}
      {/* ------------------------------------------------------------------ */}
      <header
        role="banner"
        className="sticky top-0 z-40 w-full bg-amber-100 border-b border-amber-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <p className="text-sm font-semibold text-gray-900 text-center leading-snug">
            <span className="font-bold">⚠ CivicPulse is not an official City of Boston service.</span>
            {' '}This tool does not make enforcement, benefit, emergency, or eligibility decisions.
          </p>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Site header / nav bar                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 py-3">
            {/* Brand */}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-tight">
                CivicPulse
              </span>
              <span className="text-xs text-gray-500">
                Boston 311 Pattern Dashboard
              </span>
            </div>

            {/* Navigation — NavLinks is a client component */}
            <nav aria-label="Main navigation">
              <NavLinks />
            </nav>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Page content                                                        */}
      {/* ------------------------------------------------------------------ */}
      <main id="main-content" className="flex-1 w-full">
        {children}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Site footer                                                         */}
      {/* gray-300 (#d1d5db) on gray-800 (#1f2937) ≈ 7.5:1 — passes AA     */}
      {/* ------------------------------------------------------------------ */}
      <footer className="w-full bg-gray-800 text-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left column — data source links */}
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Data Sources
              </h2>
              <ul className="space-y-2" role="list">
                <li>
                  <a
                    href="https://data.boston.gov/dataset/311-service-requests"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Boston 311 Open Data on data.boston.gov (opens in new tab)"
                    className="text-sm text-gray-300 hover:text-white underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                  >
                    Boston 311 Open Data
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="FEMA Disaster Declarations on fema.gov (opens in new tab)"
                    className="text-sm text-gray-300 hover:text-white underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                  >
                    FEMA Disaster Declarations
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.mass.gov/info-details/environmental-justice-populations-in-massachusetts"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="MA Environmental Justice Data on mass.gov (opens in new tab)"
                    className="text-sm text-gray-300 hover:text-white underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                  >
                    MA Environmental Justice Data
                  </a>
                </li>
              </ul>
            </div>

            {/* Right column — help & resources */}
            <div className="flex-1 md:text-right">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Help &amp; Resources
              </h2>
              <ul className="space-y-2" role="list">
                <li>
                  <a
                    href="https://www.mass211.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Massachusetts 211 — Find local social services help (opens in new tab)"
                    className="text-sm text-gray-300 hover:text-white underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                  >
                    Massachusetts 211 — Find local help
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer bottom row */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <p className="text-xs text-gray-400">
              Sample data snapshot: {snapshotDate}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              CivicPulse is not an official City of Boston service and does not
              make enforcement, benefit, emergency, or eligibility decisions. All
              data is sample data for demonstration purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
