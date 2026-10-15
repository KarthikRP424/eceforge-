// ============================================================
// ECEForge — Core Type Definitions
// ============================================================

import { Timestamp } from 'firebase/firestore';

// ---- Scheme ------------------------------------------------
export interface Scheme {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ---- Subject -----------------------------------------------
export interface Subject {
  id: string;
  schemeId: string;
  semesterNumber: number;
  name: string;
  slug: string;
  subjectCode: string;
  description: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  { value: 'unit-notes', label: 'Unit-wise Notes' },
  { value: 'previous-papers', label: 'Previous Question Papers' },
  { value: 'lab-manual', label: 'Lab Manual' },
  { value: 'important-questions', label: 'Important Questions' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'reference-material', label: 'Reference Material' },
];

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  'notes': 'Complete Notes',
  'unit-notes': 'Unit-wise Notes',
  'previous-papers': 'Previous Question Papers',
  'lab-manual': 'Lab Manual',
  'important-questions': 'Important Questions',
  'syllabus': 'Syllabus',
  'reference-material': 'Reference Material',
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
  description: string;
  category: ResourceCategory;
  unitNumber?: number;
  storagePath: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  status: ResourceStatus;
  sourceReference?: string;
  uploadedBy: string;
  downloadCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ---- Download Event ----------------------------------------
export interface DownloadEvent {
  id: string;
  resourceId: string;
  timestamp: Timestamp;
}

// ---- Admin User --------------------------------------------
export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super-admin';
  createdAt: Timestamp;
}

// ---- Search / Filter State --------------------------------
export interface SearchFilters {
  query: string;
  schemeId?: string;
  semesterNumber?: number;
  category?: ResourceCategory;
}

// ---- Semester numbers available ----------------------------
export const AVAILABLE_SEMESTERS = [3, 4, 5, 6, 7] as const;
export type SemesterNumber = (typeof AVAILABLE_SEMESTERS)[number];

export function formatSemester(n: number): string {
  const suffixes: Record<number, string> = { 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th' };
  return suffixes[n] ?? `${n}th`;
}

// ---- File helpers ------------------------------------------
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const ALLOWED_FILE_TYPES = ['application/pdf'];
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
