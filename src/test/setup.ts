import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe';

// Register the axe-core matchers (incl. "toHaveNoViolations") globally so
// every test file can assert `expect(results).toHaveNoViolations()`.
// Imported as a namespace because vitest-axe re-exports the matcher through a
// shared type chunk, which TypeScript treats as type-only under a named import.
expect.extend(axeMatchers);

// Augment Vitest's Assertion types so the matcher is typed, not `any`.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

// jsdom does not implement the canvas 2D context. axe-core's color-contrast
// rule probes canvas while checking for icon ligatures, which floods stderr
// with "Not implemented: HTMLCanvasElement.prototype.getContext" warnings.
// Provide a minimal stub so axe can run quietly. This does not affect the
// contrast results we assert on (axe falls back gracefully).
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => null
  ) as unknown as HTMLCanvasElement['getContext'];
}
