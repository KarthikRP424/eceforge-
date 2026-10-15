import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  FileClock,
  Archive,
  Download,
  Filter,
  FileText,
  ExternalLink,
  Eye,
  Check,
  X,
} from 'lucide-react';
import type { Scheme, Subject, Resource, ResourceCategory, ResourceStatus } from '@/types';
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
  const [resources, setResources] = useState<Resource[]>([]);
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

  const schemeMap = useMemo(() => new Map(schemes.map(s => [s.id, s.name])), [schemes]);
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);

  const startEdit = (res: Resource) => {
    setEditId(res.id);
    setEditTitle(res.title);
    setEditDesc(res.description ?? '');
    setEditCategory(res.category);
    setEditUnit(res.unitNumber ? String(res.unitNumber) : '');
    setEditStatus(res.status);
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setUpdating(true);
    try {
      const ref = doc(db, 'resources', editId);
      await updateDoc(ref, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        category: editCategory,
        unitNumber: editUnit ? Number(editUnit) : undefined,
        status: editStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success('Resource updated.');
      setEditId(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Update failed.');
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

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'resources', id));
      toast.success('Resource deleted');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete resource');
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
      description="Manage uploaded PDFs, publish status, categories, and student access"
    >
      <div className="space-y-6">
        {/* Top actions & metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-navy-100 shadow-sm">
          <div>
            <h2 className="font-semibold text-navy-900 text-base">Resource Catalog</h2>
            <p className="text-xs text-navy-500">
              Total uploaded: {resources.length} | Published: {resources.filter(r => r.status === 'published').length} | Drafts: {resources.filter(r => r.status === 'draft').length}
            </p>
          </div>
          <Link to="/admin/resources/upload">
            <Button variant="primary" leftIcon={<Plus size={16} />}>Upload New PDF</Button>
          </Link>
        </div>

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
                    <form onSubmit={handleUpdate} className="space-y-3">
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
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                          <X size={14} className="mr-1" /> Cancel
                        </Button>
                        <Button type="submit" variant="primary" size="sm" loading={updating}>
                          <Check size={14} className="mr-1" /> Save
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
                          onClick={() => handleDelete(res.id, res.title)}
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
      </div>
    </AdminLayout>
  );
}
