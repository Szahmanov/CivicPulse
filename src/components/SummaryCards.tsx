/**
 * SummaryCards — server-safe component rendering four metric cards.
 *
 * Displays totals derived from the filtered 311 records.
 * Layout: 2-column grid on mobile, 4-column on lg.
 */

export interface SummaryCardsProps {
  totalCount: number;
  openCount: number;
  neighborhoodCount: number;
  serviceTopicCount: number;
}

interface MetricCardProps {
  label: string;
  value: number;
  ariaLabel: string;
}

function MetricCard({ label, value, ariaLabel }: MetricCardProps) {
  return (
    <article
      aria-label={ariaLabel}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-1"
    >
      <span className="text-3xl font-bold text-gray-900" aria-hidden="true">
        {value.toLocaleString()}
      </span>
      <span className="text-sm text-gray-600">{label}</span>
    </article>
  );
}

export default function SummaryCards({
  totalCount,
  openCount,
  neighborhoodCount,
  serviceTopicCount,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        value={totalCount}
        label="Total requests"
        ariaLabel={`Total requests: ${totalCount.toLocaleString()}`}
      />
      <MetricCard
        value={openCount}
        label="Open cases"
        ariaLabel={`Open cases: ${openCount.toLocaleString()}`}
      />
      <MetricCard
        value={neighborhoodCount}
        label="Neighborhoods"
        ariaLabel={`Neighborhoods with data: ${neighborhoodCount.toLocaleString()}`}
      />
      <MetricCard
        value={serviceTopicCount}
        label="Service topics"
        ariaLabel={`Distinct service topics: ${serviceTopicCount.toLocaleString()}`}
      />
    </div>
  );
}
