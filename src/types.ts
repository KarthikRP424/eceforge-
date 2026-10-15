// src/types.ts
// Central TypeScript type definitions for ECEForge

export type Scheme = {
  id: string;
  name: string; // e.g., "VTU 2022 Scheme"
  slug: string; // URL-friendly, e.g., "vtu-2022"
  description?: string;
  active: boolean;
  createdAt: any; // firebase Timestamp
  updatedAt: any;
};

export type Subject = {
  id: string;
  schemeId: string; // reference to Scheme.id
  semesterNumber: number; // 3‑7
  name: string; // full subject name
  slug: string; // URL-friendly
  subjectCode?: string; // e.g., "EC101"
  description?: string;
  active: boolean;
  createdAt: any;
  updatedAt: any;
};

export type ResourceCategory =
  | 'notes'
  | 'unit-notes'
  | 'previous-papers'
  | 'lab-manual'
  | 'important-questions'
  | 'syllabus'
  | 'reference-material';

export type ResourceStatus = 'published' | 'draft' | 'archived';

export type Resource = {
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
  sourceReference?: string; // optional citation
  uploadedBy: string; // uid of admin
  downloadCount?: number;
  createdAt: any;
  updatedAt: any;
};

export const AVAILABLE_SEMESTERS = [3, 4, 5, 6, 7] as const;
export const formatSemester = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  'notes': 'Notes',
  'unit-notes': 'Unit Notes',
  'previous-papers': 'Previous Papers',
  'lab-manual': 'Lab Manual',
  'important-questions': 'Important Questions',
  'syllabus': 'Syllabus',
  'reference-material': 'Reference',
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};
