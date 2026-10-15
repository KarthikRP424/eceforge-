import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { createResource } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/EmptyState';
import { Upload, FileText, CheckCircle2, Eye, X } from 'lucide-react';
import type { Scheme, Subject, ResourceCategory, ResourceStatus } from '@/types';
import toast from 'react-hot-toast';

const CATEGORIES: { value: ResourceCategory; label: string }[] = [
  { value: 'notes', label: 'Complete Notes' },
  { value: 'unit-notes', label: 'Unit Notes' },
  { value: 'previous-papers', label: 'Previous Question Paper' },
  { value: 'lab-manual', label: 'Lab Manual' },
  { value: 'important-questions', label: 'Important Questions' },
  { value: 'syllabus', label: 'Syllabus Copy' },
  { value: 'reference-material', label: 'Reference Material' },
];

export default function AdminUploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Selection states
  const [schemeId, setSchemeId] = useState('');
  const [semester, setSemester] = useState('3');
  const [subjectId, setSubjectId] = useState('');

  // Metadata states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('notes');
  const [unitNumber, setUnitNumber] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [status, setStatus] = useState<ResourceStatus>('published');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load schemes
  useEffect(() => {
    const q = query(collection(db, 'schemes'), where('active', '==', true), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Scheme));
      setSchemes(data);
      if (data.length > 0 && !schemeId) {
        setSchemeId(data[0].id);
      }
    });
    return () => unsub();
  }, [schemeId]);

  // Load subjects
  useEffect(() => {
    const q = query(collection(db, 'subjects'), where('active', '==', true), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
    });
    return () => unsub();
  }, []);

  // Filter subjects by chosen scheme and semester
  const availableSubjects = useMemo(() => {
    return subjects.filter(
      s => s.schemeId === schemeId && s.semesterNumber === Number(semester)
    );
  }, [subjects, schemeId, semester]);

  useEffect(() => {
    if (availableSubjects.length > 0) {
      setSubjectId(availableSubjects[0].id);
    } else {
      setSubjectId('');
    }
  }, [availableSubjects]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    if (f.size > 25 * 1024 * 1024) {
      setError('File size must not exceed 25 MB.');
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setFile(f);
    const objectUrl = URL.createObjectURL(f);
    setPreviewUrl(objectUrl);

    // Auto-populate title if empty
    if (!title.trim()) {
      const cleanName = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Authentication required.');
      return;
    }
    if (!schemeId || !subjectId || !title.trim() || !file) {
      toast.error('Please fill all required fields and select a PDF.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const storagePath = `resources/${schemeId}/sem${semester}/${subjectId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageReference = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageReference, file);

      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        err => {
          console.error(err);
          setError('File upload failed. Please verify storage permissions.');
          setUploading(false);
        },
        async () => {
          try {
            await createResource({
              schemeId,
              semesterNumber: Number(semester),
              subjectId,
              title: title.trim(),
              slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              description: description.trim() || undefined,
              category,
              unitNumber: unitNumber ? Number(unitNumber) : undefined,
              storagePath,
              originalFileName: file.name,
              fileSize: file.size,
              contentType: file.type || 'application/pdf',
              status,
              sourceReference: sourceReference.trim() || undefined,
              uploadedBy: user.uid,
            });

            toast.success('Resource uploaded successfully!');
            navigate('/admin/resources');
          } catch (err: any) {
            console.error(err);
            setError('Saved PDF file, but failed to save document to database.');
            setUploading(false);
          }
        }
      );
    } catch (err: any) {
      console.error(err);
      setError('Unexpected upload error occurred.');
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Upload Academic Resource" description="Add verified semester notes, question papers, or laboratory manuals">
      <div className="max-w-4xl mx-auto space-y-6">
        {error && <Alert title="Upload Error" description={error} />}

        <Card className="border border-navy-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Academic Scope */}
            <div>
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">
                1. Academic Structure
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Scheme *"
                  value={schemeId}
                  onChange={e => setSchemeId(e.target.value)}
                  options={schemes.map(s => ({ value: s.id, label: s.name }))}
                  required
                />
                <Select
                  label="Semester *"
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  options={[3, 4, 5, 6, 7].map(num => ({
                    value: String(num),
                    label: `Semester ${num}`,
                  }))}
                  required
                />
                <Select
                  label="Subject *"
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  options={availableSubjects.map(sub => ({
                    value: sub.id,
                    label: sub.subjectCode ? `${sub.name} (${sub.subjectCode})` : sub.name,
                  }))}
                  placeholder={availableSubjects.length === 0 ? 'No subjects in semester' : 'Select subject'}
                  required
                  disabled={availableSubjects.length === 0}
                />
              </div>
              {availableSubjects.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  No subjects configured for Semester {semester} under this scheme. Add subjects via the Subjects admin page first.
                </p>
              )}
            </div>

            {/* Section 2: Resource Classification & Metadata */}
            <div className="pt-2 border-t border-navy-100">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">
                2. Resource Details
              </h3>
              <div className="space-y-4">
                <Input
                  label="Resource Title *"
                  placeholder="e.g. Unit 3 - FIR Filter Design Complete Notes"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Resource Category *"
                    value={category}
                    onChange={e => setCategory(e.target.value as ResourceCategory)}
                    options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                    required
                  />

                  <Input
                    label="Unit Number (Optional, 1-5)"
                    type="number"
                    min="1"
                    max="5"
                    placeholder="e.g. 3"
                    value={unitNumber}
                    onChange={e => setUnitNumber(e.target.value)}
                  />

                  <Select
                    label="Publication Status *"
                    value={status}
                    onChange={e => setStatus(e.target.value as ResourceStatus)}
                    options={[
                      { value: 'published', label: 'Published (Immediate)' },
                      { value: 'draft', label: 'Save as Draft' },
                      { value: 'archived', label: 'Archived' },
                    ]}
                    required
                  />
                </div>

                <Textarea
                  label="Description / Table of Contents (optional)"
                  placeholder="e.g. Covers Hamming window, Hanning window, Kaiser window methods with solved VTU exam problems."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                />

                <Input
                  label="Source / Reference Attribution (optional)"
                  placeholder="e.g. Dept of ECE, Faculty Notes / Textbook reference"
                  value={sourceReference}
                  onChange={e => setSourceReference(e.target.value)}
                />
              </div>
            </div>

            {/* Section 3: PDF File Attachment & Preview */}
            <div className="pt-2 border-t border-navy-100">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">
                3. PDF Document
              </h3>

              <div className="border-2 border-dashed border-navy-200 rounded-xl p-6 text-center hover:border-cyan-400 transition bg-slate-50">
                <input
                  type="file"
                  accept="application/pdf"
                  id="pdf-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <span className="text-sm font-medium text-navy-800">
                    {file ? file.name : 'Click to select or drag PDF file'}
                  </span>
                  <span className="text-xs text-navy-400">PDF documents only, maximum 25 MB</span>
                </label>
              </div>

              {file && (
                <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-navy-50 border border-navy-100 text-xs">
                  <div className="flex items-center gap-2 text-navy-800 font-medium truncate">
                    <FileText size={16} className="text-cyan-600 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-navy-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:text-cyan-800 font-semibold flex items-center gap-1"
                    >
                      <Eye size={13} /> Preview
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-navy-600">
                  <span>Uploading to Firebase Storage...</span>
                  <span className="font-semibold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-navy-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-2 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/admin/resources')}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={uploading}
                disabled={!file || !subjectId || uploading}
              >
                {status === 'published' ? 'Upload and Publish' : 'Save Draft Resource'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
