/**
 * LoadingSpinner — accessible loading indicator.
 *
 * Server-safe (no 'use client' needed).
 * Uses role="status" and aria-busy="true" for screen reader compatibility.
 */

export default function LoadingSpinner({
  label = 'Loading...',
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="flex items-center gap-2 text-sm text-gray-500 py-4"
    >
      <svg
        className="animate-spin h-4 w-4 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
