/**
 * DataError — server-safe error display component.
 *
 * Used when Zod validation or data loading fails.
 * Renders a red alert box with a title, message, and recovery hint.
 */

export interface DataErrorProps {
  title?: string;
  message: string;
}

export default function DataError({
  title = 'Data could not be loaded',
  message,
}: DataErrorProps) {
  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800"
    >
      <strong className="font-semibold">{title}</strong>
      {message && <p className="mt-1 text-sm">{message}</p>}
      <p className="mt-2 text-sm text-red-600">
        CivicPulse uses local sample data only. If this error persists, please
        refresh the page.
      </p>
    </div>
  );
}
