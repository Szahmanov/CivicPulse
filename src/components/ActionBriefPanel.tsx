/**
 * ActionBriefPanel — server-safe component rendered inside PriorityCard's expand/collapse area.
 *
 * Renders structured context about a priority card including explanation, review rationale,
 * data source, snapshot date, and limitations notice.
 */

import type { PriorityCardData } from '@/types/index';
import { validateWhyReviewWarranted } from '@/utils/validateActionBrief';

export interface ActionBriefPanelProps {
  card: PriorityCardData;
  snapshotDate: string;
}

export default function ActionBriefPanel({ card, snapshotDate }: ActionBriefPanelProps) {
  const reviewRationale = `This combination of ${card.neighborhood} + ${card.serviceTopic} has a score of ${card.score}/100. Human review can help verify whether the pattern is ongoing and whether resources are being directed appropriately.`;

  // Runtime guard: required fields must not be empty
  if (!card.plainExplanation || !reviewRationale || !snapshotDate) {
    throw new Error('ActionBriefPanel: required fields must not be empty');
  }

  // Validate the review rationale does not contain forbidden phrases
  validateWhyReviewWarranted(reviewRationale);

  return (
    <div className="mt-3 bg-gray-50 border border-gray-200 border-l-4 border-l-blue-400 rounded-r-lg rounded-bl-lg p-4 text-sm text-gray-700">
      <h4 className="font-bold text-gray-900 mb-3">Action Brief</h4>
      <dl className="space-y-4">
        <div>
          <dt className="font-semibold text-gray-800 mb-0.5">What the data shows</dt>
          <dd>{card.plainExplanation}</dd>
        </div>

        <div>
          <dt className="font-semibold text-gray-800 mb-0.5">Why review this</dt>
          <dd>{reviewRationale}</dd>
        </div>

        <div>
          <dt className="font-semibold text-gray-800 mb-0.5">Data source</dt>
          <dd>Boston 311 starter-kit extract (de-identified)</dd>
        </div>

        <div>
          <dt className="font-semibold text-gray-800 mb-0.5">Snapshot date</dt>
          <dd>{snapshotDate}</dd>
        </div>

        <div>
          <dt className="font-semibold text-gray-800 mb-0.5">Limitations</dt>
          <dd className="text-gray-600">
            This score is not an official city decision. This is a saved 2026-10-18 extract, not a live feed. CivicPulse is not an official
            City of Boston service and does not make enforcement, benefit, emergency, or eligibility
            decisions. Scores use raw counts and are for review prioritization only.
          </dd>
        </div>
      </dl>
    </div>
  );
}
