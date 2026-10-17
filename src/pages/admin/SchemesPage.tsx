import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Plus, Edit2, Trash2, Power, Check, X } from 'lucide-react';
import type { Scheme } from '@/types';
import toast from 'react-hot-toast';

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for new scheme
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Inline edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'schemes'), orderBy('name', 'asc'));
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Scheme));
        setSchemes(data);
        setLoading(false);
      },
      err => {
        console.error(err);
        setError('Failed to load schemes.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleNameChange = (val: string) => {
    setNewName(val);
    if (!newSlug || newSlug === newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setNewSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) {
      toast.error('Scheme name and slug are required.');
      return;
    }
    setCreating(true);
    try {
      const ref = doc(collection(db, 'schemes'));
      await setDoc(ref, {
        name: newName.trim(),
        slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: newDesc.trim(),
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Scheme created successfully!');
      setNewName('');
      setNewSlug('');
      setNewDesc('');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create scheme.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (scheme: Scheme) => {
    setEditId(scheme.id);
    setEditName(scheme.name);
    setEditSlug(scheme.slug);
    setEditDesc(scheme.description ?? '');
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setUpdating(true);
    try {
      const ref = doc(db, 'schemes', editId);
      await updateDoc(ref, {
        name: editName.trim(),
        slug: editSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: editDesc.trim(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Scheme updated.');
      setEditId(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update scheme.');
    } finally {
      setUpdating(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'schemes', id), {
        active: !current,
        updatedAt: serverTimestamp(),
      });
      toast.success(current ? 'Scheme deactivated' : 'Scheme activated');
    } catch (err: any) {
      console.error(err);
      toast.error('Could not toggle status.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete scheme "${name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'schemes', id));
      toast.success('Scheme deleted.');
    } catch (err: any) {
      console.error(err);
      toast.error('Could not delete scheme.');
    }
  };

  return (
    <AdminLayout title="Academic Schemes" description="Manage VTU syllabus schemes and availability">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Create Scheme Form */}
        <Card className="border border-navy-200">
          <h2 className="text-base font-semibold text-navy-900 mb-1 flex items-center gap-2">
            <Plus size={18} className="text-cyan-500" /> Add Academic Scheme
          </h2>
          <p className="text-xs text-navy-500 mb-5">
            Configure VTU scheme versions (e.g., VTU 2022 Scheme, VTU 2025 Scheme). Semesters 3 through 7 are supported.
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Scheme Name"
                placeholder="e.g. VTU 2022 Scheme"
                value={newName}
                onChange={e => handleNameChange(e.target.value)}
                required
              />
              <Input
                label="URL Slug"
                placeholder="e.g. vtu-2022"
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
                required
              />
            </div>
            <Textarea
              label="Description / Syllabus Scope (optional)"
              placeholder="e.g. Choice Based Credit System (CBCS) syllabus applicable for ECE students admitted from 2022 onwards."
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" loading={creating}>
                Create Scheme
              </Button>
            </div>
          </form>
        </Card>

        {/* Existing Schemes */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-600 mb-3">
            Existing Schemes ({schemes.length})
          </h3>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          ) : schemes.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-navy-500 text-sm">No schemes configured yet. Create VTU 2022 or VTU 2025 above.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {schemes.map(scheme => (
                <Card key={scheme.id} className="p-5">
                  {editId === scheme.id ? (
                    <form onSubmit={handleUpdate} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="Scheme Name"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          required
                        />
                        <Input
                          label="URL Slug"
                          value={editSlug}
                          onChange={e => setEditSlug(e.target.value)}
                          required
                        />
                      </div>
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
                          <Check size={14} className="mr-1" /> Save Changes
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-semibold text-navy-900 text-base">{scheme.name}</h4>
                          <StatusBadge status={scheme.active ? 'published' : 'draft'} />
                        </div>
                        <p className="text-xs font-mono text-cyan-700">/schemes/{scheme.slug}</p>
                        {scheme.description && (
                          <p className="text-xs text-navy-600 mt-1 max-w-2xl">{scheme.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        <Button
                          variant={scheme.active ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => toggleActive(scheme.id, scheme.active)}
                          leftIcon={<Power size={13} />}
                        >
                          {scheme.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(scheme)}
                          leftIcon={<Edit2 size={13} />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(scheme.id, scheme.name)}
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
