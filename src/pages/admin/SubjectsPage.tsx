import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Plus, Edit2, Trash2, Power, Check, X, Filter, BookOpen } from 'lucide-react';
import type { Scheme, Subject } from '@/types';
import toast from 'react-hot-toast';

const SEMESTERS = [3, 4, 5, 6, 7];

export default function SubjectsPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Filter state
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState<string>('all');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for creating subject
  const [newSchemeId, setNewSchemeId] = useState('');
  const [newSemester, setNewSemester] = useState('3');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editSchemeId, setEditSchemeId] = useState('');
  const [editSemester, setEditSemester] = useState('3');
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [updating, setUpdating] = useState(false);

  // Listen to schemes
  useEffect(() => {
    const q = query(collection(db, 'schemes'), orderBy('name', 'asc'));
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Scheme));
        setSchemes(data);
        if (data.length > 0 && !newSchemeId) {
          setNewSchemeId(data[0].id);
        }
        setLoadingSchemes(false);
      },
      err => {
        console.error(err);
        setLoadingSchemes(false);
      }
    );
    return () => unsub();
  }, [newSchemeId]);

  // Listen to subjects
  useEffect(() => {
    const q = query(collection(db, 'subjects'), orderBy('name', 'asc'));
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
        setSubjects(data);
        setLoadingSubjects(false);
      },
      err => {
        console.error(err);
        setLoadingSubjects(false);
      }
    );
    return () => unsub();
  }, []);

  const handleNameChange = (val: string) => {
    setNewName(val);
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!newSlug || newSlug === newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setNewSlug(generatedSlug);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeId || !newName.trim() || !newSlug.trim()) {
      toast.error('Scheme, Subject Name, and Slug are required.');
      return;
    }

    const semNum = Number(newSemester);
    // Check duplication in same scheme & semester
    const duplicate = subjects.some(
      s => s.schemeId === newSchemeId && s.semesterNumber === semNum && (s.slug === newSlug.trim() || (s.subjectCode && s.subjectCode.toUpperCase() === newCode.trim().toUpperCase()))
    );

    if (duplicate) {
      toast.error('A subject with this slug or subject code already exists in this scheme & semester.');
      return;
    }

    setCreating(true);
    try {
      const ref = doc(collection(db, 'subjects'));
      await setDoc(ref, {
        schemeId: newSchemeId,
        semesterNumber: semNum,
        name: newName.trim(),
        subjectCode: newCode.trim().toUpperCase() || undefined,
        slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: newDesc.trim() || undefined,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Subject added successfully!');
      setNewName('');
      setNewCode('');
      setNewSlug('');
      setNewDesc('');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to add subject.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (subject: Subject) => {
    setEditId(subject.id);
    setEditSchemeId(subject.schemeId);
    setEditSemester(String(subject.semesterNumber));
    setEditName(subject.name);
    setEditCode(subject.subjectCode ?? '');
    setEditSlug(subject.slug);
    setEditDesc(subject.description ?? '');
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setUpdating(true);
    try {
      const ref = doc(db, 'subjects', editId);
      await updateDoc(ref, {
        schemeId: editSchemeId,
        semesterNumber: Number(editSemester),
        name: editName.trim(),
        subjectCode: editCode.trim().toUpperCase() || undefined,
        slug: editSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: editDesc.trim() || undefined,
        updatedAt: serverTimestamp(),
      });
      toast.success('Subject updated.');
      setEditId(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update subject.');
    } finally {
      setUpdating(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'subjects', id), {
        active: !current,
        updatedAt: serverTimestamp(),
      });
      toast.success(current ? 'Subject deactivated' : 'Subject activated');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to toggle status.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete subject "${name}"? This will unlink or remove attached resources.`)) return;
    try {
      await deleteDoc(doc(db, 'subjects', id));
      toast.success('Subject deleted.');
    } catch (err: any) {
      console.error(err);
      toast.error('Could not delete subject.');
    }
  };

  // Filtered list
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      if (selectedSchemeFilter !== 'all' && s.schemeId !== selectedSchemeFilter) return false;
      if (selectedSemesterFilter !== 'all' && s.semesterNumber !== Number(selectedSemesterFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesCode = s.subjectCode?.toLowerCase().includes(q) ?? false;
        const matchesDesc = s.description?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }
      return true;
    });
  }, [subjects, selectedSchemeFilter, selectedSemesterFilter, searchQuery]);

  const schemeMap = useMemo(() => {
    return new Map(schemes.map(s => [s.id, s.name]));
  }, [schemes]);

  return (
    <AdminLayout title="Academic Subjects" description="Configure subjects mapped strictly by Scheme and Semester (Semesters 3–7)">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Create Subject Card */}
        <Card className="border border-navy-200">
          <h2 className="text-base font-semibold text-navy-900 mb-1 flex items-center gap-2">
            <Plus size={18} className="text-cyan-500" /> Add Subject to Academic Scheme
          </h2>
          <p className="text-xs text-navy-500 mb-5">
            Every subject must be assigned to its correct scheme (VTU 2022 / VTU 2025) and semester. Never mix subjects across schemes.
          </p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                label="Scheme *"
                value={newSchemeId}
                onChange={e => setNewSchemeId(e.target.value)}
                options={schemes.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Select Scheme"
                required
              />
              <Select
                label="Semester *"
                value={newSemester}
                onChange={e => setNewSemester(e.target.value)}
                options={SEMESTERS.map(sem => ({
                  value: String(sem),
                  label: `${sem}th Semester`,
                }))}
                required
              />
              <Input
                label="Subject Code"
                placeholder="e.g. 21EC51 or BEC501"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
              />
              <Input
                label="URL Slug *"
                placeholder="e.g. digital-signal-processing"
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
                required
              />
            </div>

            <Input
              label="Subject Name *"
              placeholder="e.g. Digital Signal Processing"
              value={newName}
              onChange={e => handleNameChange(e.target.value)}
              required
            />

            <Textarea
              label="Subject Description / Syllabus Outline (optional)"
              placeholder="e.g. Covers Discrete Fourier Transform (DFT), Fast Fourier Transform (FFT) algorithms, and IIR/FIR filter designs."
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={2}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" loading={creating}>
                Add Subject
              </Button>
            </div>
          </form>
        </Card>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-navy-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-navy-700">
              <Filter size={14} className="text-cyan-500" /> Filters:
            </div>
            <select
              className="text-xs border border-navy-200 rounded-lg px-2.5 py-1.5 bg-white text-navy-800 outline-none focus:border-cyan-500"
              value={selectedSchemeFilter}
              onChange={e => setSelectedSchemeFilter(e.target.value)}
            >
              <option value="all">All Schemes</option>
              {schemes.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              className="text-xs border border-navy-200 rounded-lg px-2.5 py-1.5 bg-white text-navy-800 outline-none focus:border-cyan-500"
              value={selectedSemesterFilter}
              onChange={e => setSelectedSemesterFilter(e.target.value)}
            >
              <option value="all">All Semesters</option>
              {SEMESTERS.map(sem => (
                <option key={sem} value={String(sem)}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search subjects or codes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-navy-200 rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Subjects List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-600">
              Configured Subjects ({filteredSubjects.length})
            </h3>
          </div>

          {loadingSubjects || loadingSchemes ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : filteredSubjects.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen size={32} className="mx-auto text-navy-300 mb-2" />
              <p className="text-navy-600 font-medium">No subjects found</p>
              <p className="text-xs text-navy-400 mt-1">Try adjusting the filter or add a new subject above.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSubjects.map(sub => (
                <Card key={sub.id} className="p-4">
                  {editId === sub.id ? (
                    <form onSubmit={handleUpdate} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <Select
                          label="Scheme"
                          value={editSchemeId}
                          onChange={e => setEditSchemeId(e.target.value)}
                          options={schemes.map(s => ({ value: s.id, label: s.name }))}
                          required
                        />
                        <Select
                          label="Semester"
                          value={editSemester}
                          onChange={e => setEditSemester(e.target.value)}
                          options={SEMESTERS.map(sem => ({
                            value: String(sem),
                            label: `${sem}th Semester`,
                          }))}
                          required
                        />
                        <Input
                          label="Subject Code"
                          value={editCode}
                          onChange={e => setEditCode(e.target.value)}
                        />
                        <Input
                          label="URL Slug"
                          value={editSlug}
                          onChange={e => setEditSlug(e.target.value)}
                          required
                        />
                      </div>
                      <Input
                        label="Subject Name"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        required
                      />
                      <Textarea
                        label="Description"
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        rows={2}
                      />
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-navy-900 text-sm">{sub.name}</h4>
                          {sub.subjectCode && (
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-navy-100 text-navy-800 font-medium">
                              {sub.subjectCode}
                            </span>
                          )}
                          <span className="text-2xs font-medium px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-100">
                            Sem {sub.semesterNumber}
                          </span>
                          <span className="text-2xs font-medium px-2 py-0.5 rounded bg-violet-50 text-violet-800 border border-violet-100">
                            {schemeMap.get(sub.schemeId) ?? 'Unknown Scheme'}
                          </span>
                          <StatusBadge status={sub.active ? 'published' : 'draft'} />
                        </div>
                        <p className="text-xs font-mono text-navy-400">slug: {sub.slug}</p>
                        {sub.description && (
                          <p className="text-xs text-navy-600 line-clamp-1">{sub.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <Button
                          variant={sub.active ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => toggleActive(sub.id, sub.active)}
                          leftIcon={<Power size={13} />}
                        >
                          {sub.active ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(sub)}
                          leftIcon={<Edit2 size={13} />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(sub.id, sub.name)}
                          leftIcon={<Trash2 size={13} />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
