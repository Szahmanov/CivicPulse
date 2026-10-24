/**
 * Forbidden-phrase validation for ActionBrief "why review" text.
 *
 * Throws if the text contains any phrase that directs enforcement,
 * benefit, emergency, or eligibility decisions.
 *
 * Call this when constructing ActionBrief data so violations surface
 * at build time.
 */

export const FORBIDDEN_PHRASES: string[] = [
  'enforce',
  'enforcement',
  'eligibility',
  'eligible',
  'benefit',
  'emergency response',
  'take action against',
  'must comply',
  'violation notice',
  'legal action',
  'must be fined',
  'issue a fine',
  'require compliance',
  'determine eligibility',
  'grant benefits',
  'deny benefits',
  'approve benefits',
];

export function validateWhyReviewWarranted(text: string): void {
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      throw new Error(
        `ActionBrief validation failed: "whyReviewWarranted" contains a forbidden phrase: "${phrase}". ` +
          `The Action Brief must not direct enforcement, benefit, emergency, or eligibility decisions.`
      );
    }
  }
}

export function containsForbiddenPhrase(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_PHRASES.some((phrase) => lower.includes(phrase.toLowerCase()));
}
