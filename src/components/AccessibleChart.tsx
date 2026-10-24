'use client';

/**
 * AccessibleChart — reusable wrapper making a Recharts BarChart accessible.
 *
 * Accessibility features:
 *   - role="img" container with aria-label on the chart div
 *   - sr-only <table> with identical data for screen readers
 *   - <figcaption> with source, snapshot, and limitations text
 *   - Empty state with role="status" when data is empty
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface AccessibleChartProps {
  title: string;
  data: ChartDataPoint[];
  sourceLabel: string;
  snapshotDate: string;
  limitations: string;
  yAxisLabel?: string;
  colorScheme?: 'blue' | 'green' | 'amber';
}

const COLOR_MAP: Record<NonNullable<AccessibleChartProps['colorScheme']>, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  amber: '#f59e0b',
};

// Recharts uses { name, value } internally — we map our data shape
function toRechartsData(data: ChartDataPoint[]) {
  return data.map((d) => ({ name: d.label, value: d.value }));
}

export default function AccessibleChart({
  title,
  data,
  sourceLabel,
  snapshotDate,
  limitations,
  yAxisLabel,
  colorScheme = 'blue',
}: AccessibleChartProps) {
  const fill = COLOR_MAP[colorScheme];
  const chartData = toRechartsData(data);

  return (
    <figure aria-label={`${title} chart`} className="mb-8">
      {/* ------------------------------------------------------------------
          1. Recharts BarChart
      ------------------------------------------------------------------ */}
      {data.length > 0 && (
        <div
          role="img"
          aria-label={`Bar chart: ${title}`}
          aria-hidden="false"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-40}
                textAnchor="end"
                interval={0}
                label={undefined}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                label={
                  yAxisLabel
                    ? {
                        value: yAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 11, fill: '#6b7280' },
                      }
                    : undefined
                }
              />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(value) => [Number(value).toLocaleString(), 'Count']}
              />
              <Bar dataKey="value" fill={fill} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ------------------------------------------------------------------
          2. Screen-reader-only data table (same data as chart)
      ------------------------------------------------------------------ */}
      <table className="sr-only" aria-label={`${title} data table`}>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ------------------------------------------------------------------
          3. figcaption with source, snapshot, limitations
      ------------------------------------------------------------------ */}
      <figcaption className="text-xs text-gray-500 mt-2">
        {title} — Source: {sourceLabel} — Snapshot: {snapshotDate}.{' '}
        <span className="italic">{limitations}</span>
      </figcaption>

      {/* ------------------------------------------------------------------
          4. Empty state
      ------------------------------------------------------------------ */}
      {data.length === 0 && (
        <p className="text-sm text-gray-500 mt-2" role="status">
          No data available for this chart.
        </p>
      )}
    </figure>
  );
}
