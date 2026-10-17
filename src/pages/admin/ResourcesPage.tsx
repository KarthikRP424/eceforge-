import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  FileClock,
  Download,
  Filter,
  FileText,
  Eye,
  Check,
  X,
  Upload,
  Inbox,
} from 'lucide-react';
import type { Scheme, Subject, Resource, ResourceCategory, ResourceStatus, ResourceSubmission } from '@/types';
import toast from 'react-hot-toast';

const CATEGORIES: { value: ResourceCategory; label: string }[] = [
  { value: 'notes', label: 'Complete Notes' },
  { value: 'unit-notes', label: 'Unit Notes' },
  { value: 'previous-papers', label: 'Previous Question Papers' },
  { value: 'lab-manual', label: 'Lab Manual' },
  { value: 'important-questions', label: 'Important Questions' },
  { value: 'syllabus', label: 'Syllabus Copy' },
  { value: 'reference-material', label: 'Reference Material' },
];

export default function AdminResourcesPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'submissions'>('catalog');
  const [resources, setResources] = useState<Resource[]>([]);
  const [submissions, setSubmissions] = useState<ResourceSubmission[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [schemeFilter, setSchemeFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<ResourceCategory>('notes');
  const [editUnit, setEditUnit] = useState<string>('');
  const [editStatus, setEditStatus] = useState<ResourceStatus>('published');
  const [editCurrentStoragePath, setEditCurrentStoragePath] = useState('');
  const [editReplacementFile, setEditReplacementFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  // Listen to schemes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'schemes'), snap => {
      setSchemes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Scheme)));
    });
    return () => unsub();
  }, []);

  // Listen to subjects
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'subjects'), snap => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
    });
    return () => unsub();
  }, []);

  // Listen to resources
  useEffect(() => {
    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      snap => {
        setResources(snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource)));
        setLoading(false);
      },
      err => {
        console.error(err);
        toast.error('Failed to load resources.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Listen to student submissions
  useEffect(() => {
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      snap => {
        setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as ResourceSubmission)));
      },
      err => {
        console.warn('Could not load submissions queue:', err);
      }
    );
    return () => unsub();
  }, []);

  const schemeMap = useMemo(() => new Map(schemes.map(s => [s.id, s.name])), [schemes]);
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);

  const startEdit = (res: Resource) => {
    setEditId(res.id);
    setEditTitle(res.title);
    setEditDesc(res.description ?? '');
    setEditCategory(res.category);
    setEditUnit(res.unitNumber ? String(res.unitNumber) : '');
    setEditStatus(res.status);
    setEditCurrentStoragePath(res.storagePath);
    setEditReplacementFile(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditReplacementFile(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setUpdating(true);

    try {
      let nextStoragePath = editCurrentStoragePath;
      let nextFileSize: number | undefined = undefined;
      let nextContentType: string | undefined = undefined;
      let nextOriginalFileName: string | undefined = undefined;

      // Check if replacement PDF file was chosen
      if (editReplacementFile) {
        if (editReplacementFile.type !== 'application/pdf' && !editReplacementFile.name.toLowerCase().endsWith('.pdf')) {
          toast.error('Replacement file must be a valid PDF.');
          setUpdating(false);
          return;
        }

        if (editReplacementFile.size > 25 * 1024 * 1024) {
          toast.error('Replacement PDF must be under 25 MB.');
          setUpdating(false);
          return;
        }

        const currentRes = resources.find(r => r.id === editId);
        const schemeId = currentRes?.schemeId || 'general';
        const sem = currentRes?.semesterNumber || 3;
        const subId = currentRes?.subjectId || 'general';

        const newPath = `resources/${schemeId}/sem${sem}/${subId}/${Date.now()}_${editReplacementFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const newRef = ref(storage, newPath);
        await uploadBytes(newRef, editReplacementFile, { contentType: 'application/pdf' });

        // Safely remove obsolete previous PDF
        if (editCurrentStoragePath && editCurrentStoragePath !== newPath) {
          try {
            await deleteObject(ref(storage, editCurrentStoragePath));
          } catch (delErr) {
            console.warn('Could not delete old storage file:', delErr);
          }
        }

        nextStoragePath = newPath;
        nextFileSize = editReplacementFile.size;
        nextContentType = editReplacementFile.type || 'application/pdf';
        nextOriginalFileName = editReplacementFile.name;
      }

      const updatePayload: Record<string, any> = {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        category: editCategory,
        unitNumber: editUnit ? Number(editUnit) : undefined,
        status: editStatus,
        updatedAt: serverTimestamp(),
      };

      if (editReplacementFile) {
        updatePayload.storagePath = nextStoragePath;
        updatePayload.fileSize = nextFileSize;
        updatePayload.contentType = nextContentType;
        updatePayload.originalFileName = nextOriginalFileName;
      }

      await updateDoc(doc(db, 'resources', editId), updatePayload);
      toast.success(editReplacementFile ? 'Resource & PDF file replaced successfully!' : 'Resource updated.');
      setEditId(null);
      setEditReplacementFile(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Update failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ResourceStatus) => {
    try {
      await updateDoc(doc(db, 'resources', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Resource status changed to ${newStatus}`);
    } catch (err: any) {
      console.error(err);
      toast.error('Could not update status');
    }
  };

  const handleDelete = async (res: Resource) => {
    if (!window.confirm(`Delete "${res.title}"? This action cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'resources', res.id));
      if (res.storagePath) {
        try {
          await deleteObject(ref(storage, res.storagePath));
        } catch (stErr) {
          console.warn('Storage cleanup notice:', stErr);
        }
      }
      toast.success('Resource and associated file deleted.');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete resource');
    }
  };

  // Approve a student submission
  const handleApproveSubmission = async (sub: ResourceSubmission) => {
    try {
      // 1. Create document in public resources collection
      await addDoc(collection(db, 'resources'), {
        schemeId: sub.schemeId,
        semesterNumber: sub.semesterNumber,
        subjectId: sub.subjectId,
        title: sub.title,
        slug: sub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: sub.description || undefined,
        category: sub.category,
        unitNumber: sub.unitNumber || undefined,
        storagePath: sub.storagePath,
        originalFileName: sub.originalFileName,
        fileSize: sub.fileSize,
        contentType: sub.contentType || 'application/pdf',
        status: 'published',
        sourceReference: sub.sourceAttribution
          ? `${sub.sourceAttribution} (Submitted by ${sub.contributorName || 'Student'})`
          : `Contributed by ${sub.contributorName || 'Student'}`,
        uploadedBy: 'student_submission_verified',
        downloadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Remove from pending submissions
      await deleteDoc(doc(db, 'submissions', sub.id));
      toast.success('Submission approved and published to ECE catalog!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to approve submission: ' + err.message);
    }
  };

  // Reject a student submission
  const handleRejectSubmission = async (sub: ResourceSubmission) => {
    if (!window.confirm(`Reject and delete submission "${sub.title}"?`)) return;
    try {
      await deleteDoc(doc(db, 'submissions', sub.id));
      if (sub.storagePath) {
        try {
          await deleteObject(ref(storage, sub.storagePath));
        } catch (err) {
          console.warn('Could not delete submission storage file:', err);
        }
      }
      toast.success('Submission rejected and file removed.');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to reject submission');
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      if (schemeFilter !== 'all' && r.schemeId !== schemeFilter) return false;
      if (semesterFilter !== 'all' && r.semesterNumber !== Number(semesterFilter)) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q) ?? false;
        const subName = subjectMap.get(r.subjectId)?.name.toLowerCase() ?? '';
        const matchesSub = subName.includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSub) return false;
      }
      return true;
    });
  }, [resources, schemeFilter, semesterFilter, categoryFilter, statusFilter, searchQuery, subjectMap]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout
      title="Academic Resources"
      description="Manage uploaded PDFs, publish status, replace files, and review student submissions"
    >
      <div className="space-y-6">
        {/* Top actions & metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-navy-100 shadow-sm">
          <div>
            <h2 className="font-semibold text-navy-900 text-base">Resource Management</h2>
            <p className="text-xs text-navy-500">
              Total uploaded: {resources.length} | Published: {resources.filter(r => r.status === 'published').length} | Drafts: {resources.filter(r => r.status === 'draft').length} | Pending Submissions: {submissions.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/resources/upload">
              <Button variant="primary" leftIcon={<Plus size={16} />}>Upload New PDF</Button>
            </Link>
          </div>
        </div>

        {/* Tab Switcher: Catalog vs Submissions */}
        <div className="flex items-center gap-2 border-b border-navy-100 pb-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-navy-950 text-white'
                : 'text-navy-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            <FileText size={14} /> Official Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'submissions'
                ? 'bg-cyan-600 text-white'
                : 'text-navy-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            <Inbox size={14} /> Peer Submissions Queue
            {submissions.length > 0 && (
              <span className={`text-2xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'submissions' ? 'bg-white text-cyan-700' : 'bg-cyan-100 text-cyan-800'}`}>
                {submissions.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'submissions' ? (
          /* Submissions Queue View */
          <div className="space-y-4">
            <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100 text-xs text-cyan-900 flex items-start gap-2.5">
              <Inbox size={18} className="text-cyan-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Peer & Student Submissions:</span> These study materials were contributed by students via the public submission portal. Review each document before approving it into the verified academic catalog.
              </div>
            </div>

            {submissions.length === 0 ? (
              <Card className="text-center py-14">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                <h3 className="font-semibold text-navy-800">Queue Clean</h3>
                <p className="text-xs text-navy-400 mt-1">There are no pending student submissions awaiting review.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {submissions.map(sub => {
                  const subject = subjectMap.get(sub.subjectId);
                  const schemeName = schemeMap.get(sub.schemeId) ?? 'VTU Scheme';

                  return (
                    <Card key={sub.id} className="p-5 border border-cyan-100 bg-white">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-navy-900 text-sm">{sub.title}</h4>
                            <CategoryBadge category={sub.category} />
                            {sub.unitNumber && (
                              <span className="text-2xs font-mono font-medium px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100">
                                Unit {sub.unitNumber}
                              </span>
                            )}
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Review
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-navy-500">
                            <span className="font-medium text-navy-800">{subject?.name ?? 'Subject'}</span>
                            <span>•</span>
                            <span>{schemeName}</span>
                            <span>•</span>
                            <span>Sem {sub.semesterNumber}</span>
                            <span>•</span>
                            <span>Size: {formatFileSize(sub.fileSize)}</span>
                            {sub.contributorName && (
                              <>
                                <span>•</span>
                                <span className="text-navy-600 font-medium">Contributor: {sub.contributorName}</span>
                              </>
                            )}
                          </div>

                          {sub.description && (
                            <p className="text-xs text-navy-600 line-clamp-1">{sub.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end lg:self-center flex-shrink-0">
                          <button
                            onClick={async () => {
                              try {
                                const url = await getDownloadURL(ref(storage, sub.storagePath));
                                window.open(url, '_blank');
                              } catch (err) {
                                toast.error('Could not preview PDF.');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg border border-navy-200 text-navy-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1"
                          >
                            <Eye size={13} /> Preview PDF
                          </button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveSubmission(sub)}
                            leftIcon={<CheckCircle2 size={13} />}
                          >
                            Approve & Publish
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectSubmission(sub)}
                            leftIcon={<Trash2 size={13} />}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Catalog View */
          <>
            {/* Filter bar */}
            <div className="bg-white p-4 rounded-xl border border-navy-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-navy-600 flex items-center gap-1">
                  <Filter size={13} className="text-cyan-500" /> Filters:
                </span>

                {/* Scheme */}
                <select
                  className="text-xs border border-navy-200 rounded-lg px-2.5 py-1.5 bg-white text-navy-800 outline-none focus:border-cyan-500"
                  value={schemeFilter}
                  onChange={e => setSchemeFilter(e.target.value)}
                >
                  <option value="all">All Schemes</option>
                  {schemes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                {/* Semester */}
                <select
                  className="text-xs border border-navy-200 rounded-lg px-2.5 py-1.5 bg-white text-navy-800 outline-none focus:border-cyan-500"
                  value={semesterFilter}
                  onChange={e => setSemesterFilter(e.target.value)}
                >
                  <option value="all">All Semesters</option>
                  {[3, 4, 5, 6, 7].map(sem => (
                    <option key={sem} value={String(sem)}>Sem {sem}</option>
                  ))}
                </select>

                {/* Category */}
                <select
                  className="text-xs border border-navy-200 rounded-lg px-2.5 py-1.5 bg-white text-navy-800 outline-none focus:border-cyan-500"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>

                {/* Status */}
                <select
                  className="text-xs border border-navy-200 rounded-lg px-2.5 py-1.5 bg-white text-navy-800 outline-none focus:border-cyan-500"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Search resource title or subject..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs border border-navy-200 rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Resources Table / List */}
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : filteredResources.length === 0 ? (
              <Card className="text-center py-14">
                <FileText size={36} className="mx-auto text-navy-300 mb-2" />
                <p className="text-navy-700 font-medium">No resources found</p>
                <p className="text-xs text-navy-400 mt-1">Upload a PDF or adjust your filter criteria.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredResources.map(res => {
                  const sub = subjectMap.get(res.subjectId);
                  const schemeName = schemeMap.get(res.schemeId) ?? 'Scheme';

                  return (
                    <Card key={res.id} className="p-4">
                      {editId === res.id ? (
                        <form onSubmit={handleUpdate} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input
                              label="Title"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              required
                            />
                            <Select
                              label="Category"
                              value={editCategory}
                              onChange={e => setEditCategory(e.target.value as ResourceCategory)}
                              options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                              required
                            />
                            <Select
                              label="Status"
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value as ResourceStatus)}
                              options={[
                                { value: 'published', label: 'Published' },
                                { value: 'draft', label: 'Draft' },
                                { value: 'archived', label: 'Archived' },
                              ]}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              label="Unit Number (optional, 1-5)"
                              type="number"
                              min="1"
                              max="5"
                              value={editUnit}
                              onChange={e => setEditUnit(e.target.value)}
                            />
                            <Input
                              label="Description"
                              value={editDesc}
                              onChange={e => setEditDesc(e.target.value)}
                            />
                          </div>

                          {/* Replace PDF Section */}
                          <div className="p-3 bg-slate-50 border border-navy-200 rounded-lg space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-navy-800 flex items-center gap-1.5">
                                <Upload size={14} className="text-cyan-600" /> Replace PDF File (Optional)
                              </span>
                              <span className="text-2xs text-navy-400">Current size: {formatFileSize(res.fileSize)}</span>
                            </div>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={e => setEditReplacementFile(e.target.files?.[0] ?? null)}
                              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                            />
                            {editReplacementFile && (
                              <p className="text-2xs text-emerald-700 font-medium">
                                Selected replacement: {editReplacementFile.name} ({formatFileSize(editReplacementFile.size)})
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                              <X size={14} className="mr-1" /> Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="sm" loading={updating}>
                              <Check size={14} className="mr-1" /> Save Changes
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-navy-900 text-sm">{res.title}</h4>
                              <CategoryBadge category={res.category} />
                              {res.unitNumber && (
                                <span className="text-2xs font-mono font-medium px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100">
                                  Unit {res.unitNumber}
                                </span>
                              )}
                              <StatusBadge status={res.status} />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-navy-500">
                              <span className="font-medium text-navy-800">{sub?.name ?? 'Unknown Subject'}</span>
                              <span>•</span>
                              <span>{schemeName}</span>
                              <span>•</span>
                              <span>Sem {res.semesterNumber}</span>
                              <span>•</span>
                              <span>Size: {formatFileSize(res.fileSize)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-cyan-700 font-medium">
                                <Download size={12} /> {res.downloadCount ?? 0} downloads
                              </span>
                            </div>

                            {res.description && (
                              <p className="text-xs text-navy-600 line-clamp-1">{res.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end lg:self-center flex-shrink-0">
                            {/* Status switcher pills */}
                            {res.status !== 'published' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                onClick={() => handleStatusChange(res.id, 'published')}
                                leftIcon={<CheckCircle2 size={13} />}
                              >
                                Publish
                              </Button>
                            )}
                            {res.status !== 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-700 border-amber-300 hover:bg-amber-50"
                                onClick={() => handleStatusChange(res.id, 'draft')}
                                leftIcon={<FileClock size={13} />}
                              >
                                To Draft
                              </Button>
                            )}

                            <Link to={`/resources/${res.id}`} target="_blank">
                              <Button variant="ghost" size="sm" leftIcon={<Eye size={13} />}>
                                View
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(res)}
                              leftIcon={<Edit2 size={13} />}
                            >
                              Edit
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(res)}
                              leftIcon={<Trash2 size={13} />}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
