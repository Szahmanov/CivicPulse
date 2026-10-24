/**
 * FemaDeclarationList — Server Component.
 *
 * Renders a sortable accessible table of FEMA Major Disaster Declarations.
 * Records are sorted by declarationDate descending (most recent first).
 * null county → displayed as "Statewide".
 * programsActivated → joined with ", ".
 */

import type { FemaDeclaration } from '@/types/index';

export interface FemaDeclarationListProps {
  records: FemaDeclaration[];
  snapshotDate: string;
}

export default function FemaDeclarationList({
  records,
  snapshotDate,
}: FemaDeclarationListProps) {
  const sorted = [...records].sort(
    (a, b) =>
      new Date(b.declarationDate).getTime() -
      new Date(a.declarationDate).getTime(),
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm text-gray-800 border-collapse">
        <caption className="sr-only">
          Historical FEMA Major Disaster Declarations — Massachusetts — Source:
          FEMA OpenFEMA — Snapshot: {snapshotDate}
        </caption>
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
          <tr>
            <th scope="col" className="px-4 py-3 text-left whitespace-nowrap">
              Declaration #
            </th>
            <th scope="col" className="px-4 py-3 text-left whitespace-nowrap">
              Disaster Type
            </th>
            <th scope="col" className="px-4 py-3 text-left whitespace-nowrap">
              Declaration Date
            </th>
            <th scope="col" className="px-4 py-3 text-left whitespace-nowrap">
              County / Area
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              Programs Activated
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((record) => (
            <tr
              key={`${record.declarationNumber}-${record.declarationDate}`}
              className="even:bg-gray-50 border-t border-gray-100 hover:bg-blue-50 transition-colors"
            >
              <td className="px-4 py-2 font-mono whitespace-nowrap">
                {record.declarationNumber}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {record.disasterType}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {record.declarationDate}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {record.county ?? 'Statewide'}
              </td>
              <td className="px-4 py-2">
                {record.programsActivated.join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
