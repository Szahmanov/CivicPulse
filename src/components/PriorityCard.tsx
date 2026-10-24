'use client';

/**
 * PriorityCard — renders one priority review card with:
 *   - Header row: neighborhood, service topic, score badge
 *   - Score component bars (3 normalized pressure bars)
 *   - Plain-language explanation (always visible)
 *   - Action Brief toggle (expand/collapse via useState)
 */

import { useState } from 'react';
import type { PriorityCardData } from '@/types/index';
import { toWholePercent } from '@/data/scoring';
import ActionBriefPanel from './ActionBriefPanel';

export interface PriorityCardProps {
  card: PriorityCardData;
  snapshotDate?: string;
}

// ---------------------------------------------------------------------------
// Score badge helpers
// ---------------------------------------------------------------------------

function getScoreBadgeClasses(score: number): string {
  if (score <= 39) return 'bg-green-100 text-green-800';
  if (score <= 69) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function getScoreLabel(score: number): string {
  if (score <= 39) return 'Lower attention needed';
  if (score <= 69) return 'Review recommended';
  return 'High attention';
}

// ---------------------------------------------------------------------------
// Progress bar component
// ---------------------------------------------------------------------------

interface PressureBarProps {
  label: string;
  value: number; // 0–1 normalized
  rawAnnotation: string;
  ariaLabel: string;
  percentageLabel?: string;
}

function PressureBar({ label, value, rawAnnotation, ariaLabel, percentageLabel = 'of max' }: PressureBarProps) {
  const pct = toWholePercent(value);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium">{label}</span>
        <span className="text-gray-500">{rawAnnotation}</span>
      </div>
      <div
        role="img"
        aria-label={ariaLabel}
        className="h-2 w-full bg-gray-200 rounded-full overflow-hidden"
      >
        <div
          className="h-2 bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 text-right">{pct}% {percentageLabel}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PriorityCard
// ---------------------------------------------------------------------------

export default function PriorityCard({
  card,
  snapshotDate = '2026-10-18',
}: PriorityCardProps) {
  const [briefOpen, setBriefOpen] = useState(false);

  const badgeClasses = getScoreBadgeClasses(card.score);
  const scoreLabel = getScoreLabel(card.score);

  return (
    <article
      aria-label={`Priority card: ${card.neighborhood} — ${card.serviceTopic}`}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col gap-4"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header row                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {card.neighborhood}
          </h3>
          <p className="text-sm text-gray-500">{card.serviceTopic}</p>
        </div>

        <div className={`flex-shrink-0 flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-full text-sm font-semibold ${badgeClasses}`}>
          <span>Score: {card.score}/100</span>
          <span className="text-xs font-normal">{scoreLabel}</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Score component bars                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-3">
        <PressureBar
          label="Open case pressure"
          value={card.openPressure}
          rawAnnotation={`${card.openCount} open cases`}
          ariaLabel={`Open case pressure: ${toWholePercent(card.openPressure)}% of max. ${card.openCount} open cases.`}
        />
        <PressureBar
          label="Repeat requests"
          value={card.repeatedPressure}
          rawAnnotation={`${card.totalCount} total requests`}
          ariaLabel={`Repeat request pressure: ${toWholePercent(card.repeatedPressure)}% of max. ${card.totalCount} total requests.`}
        />
        <PressureBar
          label="Overdue (city on-time field)"
          value={card.overduePressure}
          rawAnnotation={`${card.overdueCount} of ${card.totalCount} marked overdue`}
          ariaLabel={`Overdue (city on-time field): ${toWholePercent(card.overduePressure)}% marked overdue. ${card.overdueCount} of ${card.totalCount} marked overdue.`}
          percentageLabel="marked overdue"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Plain-language explanation (always visible)                          */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          What the data shows:
        </p>
        <p className="text-sm text-gray-700">{card.plainExplanation}</p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Action Brief toggle                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <button
          type="button"
          aria-expanded={briefOpen}
          onClick={() => setBriefOpen((prev) => !prev)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
        >
          {briefOpen ? 'Hide Action Brief' : 'Show Action Brief'}
        </button>

        {briefOpen && (
          <ActionBriefPanel card={card} snapshotDate={snapshotDate} />
        )}
      </div>
    </article>
  );
}
