/**
 * Static data loaders with Zod runtime validation.
 *
 * All three JSON files are imported statically (no fetch()). If a file's
 * shape no longer matches its schema a ZodError is thrown at module-load
 * time and can be caught by the DataError boundary (Task 8).
 */

import { z } from 'zod';

import rawRequests from '../../data/311-requests.json';
import rawEJ from '../../data/ej-outreach-context.json';
import rawFema from '../../data/fema-declarations.json';

import type {
  Requests311File,
  EJOutreachFile,
  FemaDeclarationsFile,
  Request311,
  EJOutreachContext,
  FemaDeclaration,
} from '../types/index';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const DataFileMetaSchema = z.object({
  snapshotDate: z.string(),
  source: z.string(),
  officialUrl: z.string(),
  limitations: z.string(),
});

const Request311Schema = z.object({
  caseId: z.string(),
  serviceTopic: z.string(),
  neighborhood: z.string(),
  department: z.string(),
  status: z.enum(['open', 'closed']),
  submittedDate: z.string(),
  closedDate: z.string().nullable(),
  onTimeResolution: z.boolean().nullable(),
});

const EJOutreachContextSchema = z.object({
  neighborhood: z.string(),
  hasOutreachFlag: z.boolean(),
  note: z.string(),
});

const FemaDeclarationSchema = z.object({
  declarationNumber: z.string(),
  disasterType: z.string(),
  declarationDate: z.string(),
  state: z.string(),
  county: z.string().nullable(),
  programsActivated: z.array(z.string()),
});

const Requests311FileSchema = z.object({
  meta: DataFileMetaSchema,
  records: z.array(Request311Schema),
});

const EJOutreachFileSchema = z.object({
  meta: DataFileMetaSchema,
  records: z.array(EJOutreachContextSchema),
});

const FemaDeclarationsFileSchema = z.object({
  meta: DataFileMetaSchema,
  records: z.array(FemaDeclarationSchema),
});

// ---------------------------------------------------------------------------
// Validated data exports
// ---------------------------------------------------------------------------

export const requests311Data: Requests311File =
  Requests311FileSchema.parse(rawRequests);

export const ejOutreachData: EJOutreachFile =
  EJOutreachFileSchema.parse(rawEJ);

export const femaData: FemaDeclarationsFile =
  FemaDeclarationsFileSchema.parse(rawFema);

// ---------------------------------------------------------------------------
// Convenience accessors
// ---------------------------------------------------------------------------

export const ALL_311_RECORDS: Request311[] = requests311Data.records;
export const ALL_EJ_RECORDS: EJOutreachContext[] = ejOutreachData.records;
export const ALL_FEMA_RECORDS: FemaDeclaration[] = femaData.records;
export const DATA_SNAPSHOT_DATE: string = requests311Data.meta.snapshotDate;
export const ALL_NEIGHBORHOODS: string[] = [
  ...new Set(ALL_EJ_RECORDS.map((r) => r.neighborhood)),
].sort();
