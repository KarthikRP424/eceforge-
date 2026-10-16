// ============================================================
// ECEForge — Firestore Data Access Layer
// ============================================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp,
  QueryConstraint,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Scheme, Subject, Resource, ResourceCategory, ResourceStatus } from '@/types';

// ---- Collection refs ----------------------------------------
const schemesRef   = () => collection(db, 'schemes');
const subjectsRef  = () => collection(db, 'subjects');
const resourcesRef = () => collection(db, 'resources');
const downloadsRef = () => collection(db, 'download_events');

// ============================================================
// SCHEMES
// ============================================================

export async function getActiveSchemes(): Promise<Scheme[]> {
  const q = query(schemesRef(), where('active', '==', true), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Scheme));
}

export async function getAllSchemes(): Promise<Scheme[]> {
  const q = query(schemesRef(), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Scheme));
}

export async function getSchemeBySlug(slug: string): Promise<Scheme | null> {
  const q = query(schemesRef(), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Scheme;
}

export async function getSchemeById(id: string): Promise<Scheme | null> {
  const snap = await getDoc(doc(db, 'schemes', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Scheme;
}

export async function createScheme(data: Omit<Scheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(schemesRef(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateScheme(id: string, data: Partial<Omit<Scheme, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, 'schemes', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteScheme(id: string): Promise<void> {
  await deleteDoc(doc(db, 'schemes', id));
}

// ============================================================
// SUBJECTS
// ============================================================

export async function getSubjectsBySchemeAndSemester(schemeId: string, semesterNumber: number): Promise<Subject[]> {
  const q = query(
    subjectsRef(),
    where('schemeId', '==', schemeId),
    where('active', '==', true),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Subject))
    .filter(s => s.semesterNumber === semesterNumber)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSubjectsByScheme(schemeId: string): Promise<Subject[]> {
  const q = query(
    subjectsRef(),
    where('schemeId', '==', schemeId),
    where('active', '==', true),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Subject))
    .sort((a, b) => {
      if (a.semesterNumber !== b.semesterNumber) return a.semesterNumber - b.semesterNumber;
      return a.name.localeCompare(b.name);
    });
}

export async function getAllSubjects(): Promise<Subject[]> {
  const q = query(subjectsRef());
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Subject))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSubjectBySlug(slug: string, schemeId?: string): Promise<Subject | null> {
  const constraints: QueryConstraint[] = [where('slug', '==', slug), limit(1)];
  if (schemeId) constraints.push(where('schemeId', '==', schemeId));
  const q = query(subjectsRef(), ...constraints);
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Subject;
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const snap = await getDoc(doc(db, 'subjects', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Subject;
}

export async function createSubject(data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(subjectsRef(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSubject(id: string, data: Partial<Omit<Subject, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, 'subjects', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteSubject(id: string): Promise<void> {
  await deleteDoc(doc(db, 'subjects', id));
}

// ============================================================
// RESOURCES
// ============================================================

export async function getPublishedResourcesBySubject(subjectId: string): Promise<Resource[]> {
  const q = query(
    resourcesRef(),
    where('subjectId', '==', subjectId),
    where('status', '==', 'published'),
  );
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource));
  return items.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if ((a.unitNumber ?? 0) !== (b.unitNumber ?? 0)) return (a.unitNumber ?? 0) - (b.unitNumber ?? 0);
    return a.title.localeCompare(b.title);
  });
}

export async function getRecentResources(count: number = 8): Promise<Resource[]> {
  const q = query(
    resourcesRef(),
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc'),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource));
}

export async function getPopularResources(count: number = 8): Promise<Resource[]> {
  const q = query(
    resourcesRef(),
    where('status', '==', 'published'),
    orderBy('downloadCount', 'desc'),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource));
}

export async function getAllResourcesAdmin(): Promise<Resource[]> {
  const q = query(resourcesRef(), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource));
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const snap = await getDoc(doc(db, 'resources', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Resource;
}

export async function createResource(
  data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount'>
): Promise<string> {
  const ref = await addDoc(resourcesRef(), {
    ...data,
    downloadCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateResource(id: string, data: Partial<Omit<Resource, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, 'resources', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteResource(id: string): Promise<void> {
  await deleteDoc(doc(db, 'resources', id));
}

export async function recordDownload(resourceId: string): Promise<void> {
  // Increment counter on resource doc
  await updateDoc(doc(db, 'resources', resourceId), {
    downloadCount: increment(1),
  });
  // Log download event
  await addDoc(downloadsRef(), {
    resourceId,
    timestamp: serverTimestamp(),
  });
}

// ============================================================
// SEARCH
// ============================================================

export async function searchResources(queryText: string): Promise<Resource[]> {
  // Client-side search across published resources
  // For production scale, replace with Algolia or Firebase full-text extension
  const q = query(resourcesRef(), where('status', '==', 'published'), orderBy('title'));
  const snap = await getDocs(q);
  const lower = queryText.trim().toLowerCase();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Resource))
    .filter(r =>
      r.title.toLowerCase().includes(lower) ||
      r.description?.toLowerCase().includes(lower) ||
      r.category.toLowerCase().includes(lower)
    );
}

export async function searchSubjects(queryText: string): Promise<Subject[]> {
  const q = query(subjectsRef(), where('active', '==', true), orderBy('name'));
  const snap = await getDocs(q);
  const lower = queryText.trim().toLowerCase();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Subject))
    .filter(s =>
      s.name.toLowerCase().includes(lower) ||
      s.subjectCode?.toLowerCase().includes(lower) ||
      s.description?.toLowerCase().includes(lower)
    );
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getDashboardStats() {
  const [schemesSnap, subjectsSnap, resourcesSnap] = await Promise.all([
    getDocs(query(schemesRef(), where('active', '==', true))),
    getDocs(query(subjectsRef(), where('active', '==', true))),
    getDocs(resourcesRef()),
  ]);

  const resources = resourcesSnap.docs.map(d => d.data() as Resource);
  const published = resources.filter(r => r.status === 'published').length;
  const drafts    = resources.filter(r => r.status === 'draft').length;
  const archived  = resources.filter(r => r.status === 'archived').length;
  const totalDownloads = resources.reduce((sum, r) => sum + (r.downloadCount ?? 0), 0);

  return {
    schemes:        schemesSnap.size,
    subjects:       subjectsSnap.size,
    published,
    drafts,
    archived,
    totalResources: resources.length,
    totalDownloads,
  };
}
