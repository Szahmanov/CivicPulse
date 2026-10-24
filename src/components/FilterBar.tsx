'use client';

/**
 * FilterBar — presents all filter controls and writes changes back via FilterContext.
 *
 * Accessibility:
 *   - Every input has an explicit <label> or <legend>/<fieldset>
 *   - All controls are keyboard-reachable
 *   - <select multiple> supports Ctrl/Shift-click for multi-select
 */

import React from 'react';
import { useFilterContext } from './FilterContext';
import { DEFAULT_FILTER_STATE } from '@/data/filters';

export interface FilterBarProps {
  neighborhoods: string[];
  serviceTopics: string[];
  departments: string[];
}

export default function FilterBar({
  neighborhoods,
  serviceTopics,
  departments,
}: FilterBarProps) {
  const { filters, setFilters } = useFilterContext();

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function handleMultiSelect(
    e: React.ChangeEvent<HTMLSelectElement>,
    field: 'neighborhoods' | 'serviceTopics' | 'departments'
  ) {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFilters((prev) => ({ ...prev, [field]: selected }));
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters((prev) => ({
      ...prev,
      caseStatus: e.target.value as FilterBarProps['neighborhoods'] extends never
        ? never
        : 'open' | 'closed' | 'all',
    }));
  }

  function handleDateChange(field: 'startDate' | 'endDate', value: string) {
    setFilters((prev) => ({ ...prev, [field]: value === '' ? null : value }));
  }

  function handleClear() {
    setFilters(DEFAULT_FILTER_STATE);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section
      aria-label="Filter controls"
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6"
    >
      <h2 className="text-base font-semibold text-gray-800 mb-4">Filters</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Neighborhood */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-neighborhoods"
            className="text-sm font-medium text-gray-700"
          >
            Neighborhood
            <span className="ml-1 text-xs text-gray-500 font-normal">(hold Ctrl/⌘ for multiple)</span>
          </label>
          <select
            id="filter-neighborhoods"
            multiple
            value={filters.neighborhoods}
            onChange={(e) => handleMultiSelect(e, 'neighborhoods')}
            className="border border-gray-300 rounded-md text-sm p-1.5 min-h-[6rem] focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Service Topic */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-service-topics"
            className="text-sm font-medium text-gray-700"
          >
            Service Topic
            <span className="ml-1 text-xs text-gray-500 font-normal">(hold Ctrl/⌘ for multiple)</span>
          </label>
          <select
            id="filter-service-topics"
            multiple
            value={filters.serviceTopics}
            onChange={(e) => handleMultiSelect(e, 'serviceTopics')}
            className="border border-gray-300 rounded-md text-sm p-1.5 min-h-[6rem] focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {serviceTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-departments"
            className="text-sm font-medium text-gray-700"
          >
            Department
            <span className="ml-1 text-xs text-gray-500 font-normal">(hold Ctrl/⌘ for multiple)</span>
          </label>
          <select
            id="filter-departments"
            multiple
            value={filters.departments}
            onChange={(e) => handleMultiSelect(e, 'departments')}
            className="border border-gray-300 rounded-md text-sm p-1.5 min-h-[6rem] focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Case Status */}
        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-medium text-gray-700 mb-1">Case Status</legend>
          <div className="flex flex-col gap-1">
            {(['all', 'open', 'closed'] as const).map((status) => (
              <label key={status} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="case-status"
                  value={status}
                  checked={filters.caseStatus === status}
                  onChange={handleStatusChange}
                  className="accent-blue-600"
                />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Date range */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="filter-start-date"
              className="text-sm font-medium text-gray-700"
            >
              Start date
            </label>
            <input
              id="filter-start-date"
              type="date"
              value={filters.startDate ?? ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="filter-end-date"
              className="text-sm font-medium text-gray-700"
            >
              End date
            </label>
            <input
              id="filter-end-date"
              type="date"
              value={filters.endDate ?? ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Clear button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
          >
            Clear filters
          </button>
        </div>
      </div>
    </section>
  );
}
