// src/types.ts
// ============================================================
// ECEForge — Central Core Type Definitions
// ============================================================

import type { Timestamp } from 'firebase/firestore';

// ---- Scheme ------------------------------------------------
export interface Scheme {
  id: string;
  name: string; // e.g., "VTU 2022 Scheme"
  slug: string; // URL-friendly, e.g., "vtu-2022"
  description?: string;
  active: boolean;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

// ---- Subject -----------------------------------------------
export interface Subject {
  id: string;
  schemeId: string; // reference to Scheme.id
  semesterNumber: number; // 3‑7
  name: string; // full subject name
  slug: string; // URL-friendly
  subjectCode?: string; // e.g., "21EC51" or "BEC302"
  description?: string;
  active: boolean;
  provisional?: boolean; // true if code/curriculum is pending official university notification
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

// ---- Resource Category -------------------------------------
export type ResourceCategory =
  | 'notes'
  | 'unit-notes'
  | 'previous-papers'
  | 'lab-manual'
  | 'important-questions'
  | 'syllabus'
  | 'reference-material';

export const RESOURCE_CATEGORIES: { value: ResourceCategory; label: string }[] = [
  { value: 'notes', label: 'Complete Notes' },
  { value: 'unit-notes', label: 'Unit Notes' },
  { value: 'previous-papers', label: 'Previous Papers' },
  { value: 'lab-manual', label: 'Lab Manuals' },
  { value: 'important-questions', label: 'Important Questions' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'reference-material', label: 'Reference Material' },
];

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  'notes': 'Complete Notes',
  'unit-notes': 'Unit Notes',
  'previous-papers': 'Previous Papers',
  'lab-manual': 'Lab Manual',
  'important-questions': 'Important Questions',
  'syllabus': 'Syllabus',
  'reference-material': 'Reference',
};

// ---- Resource Status ---------------------------------------
export type ResourceStatus = 'published' | 'draft' | 'archived';

// ---- Resource ----------------------------------------------
export interface Resource {
  id: string;
  schemeId: string;
  semesterNumber: number;
  subjectId: string;
  title: string;
  slug: string;
  description?: string;
  category: ResourceCategory;
  unitNumber?: number;
  storagePath: string; // Firebase Storage path
  originalFileName: string;
  fileSize: number; // bytes
  contentType: string; // e.g., "application/pdf"
  status: ResourceStatus;
  sourceReference?: string; // optional citation / faculty attribution
  uploadedBy: string; // uid of admin or 'student_contributor'
  downloadCount: number;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

// ---- Student Resource Submission ---------------------------
export interface ResourceSubmission {
  id: string;
  schemeId: string;
  semesterNumber: number;
  subjectId: string;
  title: string;
  category: ResourceCategory;
  unitNumber?: number;
  description?: string;
  sourceAttribution?: string;
  storagePath: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  status: 'pending' | 'approved' | 'rejected';
  contributorName?: string;
  contributorEmail?: string;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

// ---- Resource Issue Report ---------------------------------
export interface ResourceReport {
  id: string;
  resourceId: string;
  resourceTitle?: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: Timestamp | any;
}

// ---- Admin User --------------------------------------------
export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'super-admin';
  createdAt?: Timestamp | any;
}

// ---- Semesters available -----------------------------------
export const AVAILABLE_SEMESTERS = [3, 4, 5, 6, 7] as const;
export type SemesterNumber = (typeof AVAILABLE_SEMESTERS)[number];

export function formatSemester(n: number): string {
  const suffixes: Record<number, string> = { 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th' };
  return suffixes[n] ?? `${n}th`;
}

// ---- File helpers ------------------------------------------
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export const ALLOWED_FILE_TYPES = ['application/pdf'];
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB max aligned with storage rules
