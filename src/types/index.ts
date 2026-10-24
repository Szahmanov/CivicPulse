// ---------------------------------------------------------------------------
// Core data-file shared shape
// ---------------------------------------------------------------------------

export interface DataFileMeta {
  snapshotDate: string; // ISO 8601 date
  source: string;
  officialUrl: string;
  limitations: string;
}

// ---------------------------------------------------------------------------
// Boston 311 requests
// ---------------------------------------------------------------------------

export interface Request311 {
  caseId: string;
  serviceTopic: string;
  neighborhood: string;
  department: string;
  status: 'open' | 'closed';
  submittedDate: string; // ISO 8601 date
  closedDate: string | null; // null if open
  onTimeResolution: boolean | null; // null if open
}

// ---------------------------------------------------------------------------
// Environmental-justice context
// ---------------------------------------------------------------------------

export interface EJCitywideContext {
  municipality: string;
  flaggedBlockGroupCount: number;
  note: string;
}

// ---------------------------------------------------------------------------
// FEMA disaster declarations
// ---------------------------------------------------------------------------

export interface FemaDeclaration {
  declarationNumber: string;
  title?: string;
  disasterType: string;
  declarationDate: string; // ISO 8601 date
  state: string;
  county: string | null;
  programsActivated: string[];
}

// ---------------------------------------------------------------------------
// Typed file shapes (meta + records)
// ---------------------------------------------------------------------------

export interface Requests311File {
  meta: DataFileMeta;
  records: Request311[];
}

export interface EJOutreachFile {
  meta: DataFileMeta;
  records: EJCitywideContext[];
}

export interface FemaDeclarationsFile {
  meta: DataFileMeta;
  records: FemaDeclaration[];
}

// ---------------------------------------------------------------------------
// Computed types used in scoring (Task 3)
// ---------------------------------------------------------------------------

export interface ScoreInputs {
  openCasePressure: number; // 0-1 normalised
  repeatedPressure: number; // 0-1 normalised
  overduePressure: number; // 0-1 normalised (overdue share of all requests)
}

export interface ScoreResult {
  score: number; // 0-100
  inputs: ScoreInputs;
  normalizedInputs: ScoreInputs;
}

export interface NeighborhoodAggregate {
  neighborhood: string;
  totalCount: number;
  openCount: number;
  topServiceTopic: string | null;
}

export interface FilterState {
  neighborhoods: string[]; // empty = all
  serviceTopics: string[]; // empty = all
  departments: string[]; // empty = all
  caseStatus: 'open' | 'closed' | 'all';
  startDate: string | null; // ISO 8601 date
  endDate: string | null; // ISO 8601 date
}

export interface PriorityCardData {
  neighborhood: string;
  serviceTopic: string;
  score: number; // 0-100
  openPressure: number; // 0-1 normalised
  repeatedPressure: number; // 0-1 normalised
  overduePressure: number; // 0-1 normalised
  plainExplanation: string;
  openCount: number; // raw count for display
  totalCount: number; // raw count for display
  overdueCount: number; // requests whose city on-time field is false
}
