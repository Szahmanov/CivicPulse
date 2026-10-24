'use client';

/**
 * FilterContext — provides FilterState and setter to the entire client tree.
 *
 * Usage:
 *   - Wrap the page (or subtree) with <FilterProvider>
 *   - Consume with useFilterContext() in any client component
 */

import React, {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { FilterState } from '@/types/index';
import { DEFAULT_FILTER_STATE } from '@/data/filters';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface FilterContextValue {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
}

const FilterContext = createContext<FilterContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (ctx === null) {
    throw new Error('useFilterContext must be used inside a <FilterProvider>');
  }
  return ctx;
}
