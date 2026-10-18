import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from 'react';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/EmptyState';
import { Upload, FileText, CheckCircle2, Send, Cpu } from 'lucide-react';
import type { Scheme, Subject, ResourceCategory } from '@/types';
import toast from 'react-hot-toast';

const CATEGORIES: { value: ResourceCategory; label: string }[] = [
  { value: 'notes', label: 'Complete Notes' },
  { value: 'unit-notes', label: 'Unit-Wise Notes' },
  { value: 'previous-papers', label: 'Previous Question Paper' },
  { value: 'lab-manual', label: 'Lab Manual' },
  { value: 'important-questions', label: 'Important Questions Bank' },
  { value: 'syllabus', label: 'Syllabus Copy' },
  { value: 'reference-material', label: 'Reference Material' },
];

const SEMESTERS = [3, 4, 5, 6, 7];

export default function SubmitResourcePage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Form states
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [semester, setSemester] = useState('3');
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('notes');
  const [unitNumber, setUnitNumber] = useState('');
  const [description, setDescription] = useState('');
  const [sourceAttribution, setSourceAttribution] = useState('');

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Submit Resource | ECEForge';
  }, []);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF documents are supported for study materials.');
      setFile(null);
      return;
    }

    if (f.size > 25 * 1024 * 1024) {
      setError('File size must not exceed 25 MB.');
      setFile(null);
      return;
    }

    setError(null);
    setFile(f);
    if (!title.trim()) {
      const cleanName = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!schemeId || !subjectId || !title.trim() || !file) {
      toast.error('Please fill all required fields and choose a PDF file.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const storagePath = `submissions/${schemeId}/sem${semester}/${subjectId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
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
          setError('Failed to upload PDF file. Please check connection and try again.');
          setSubmitting(false);
        },
        async () => {
          try {
            await addDoc(collection(db, 'submissions'), {
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
              status: 'pending', // Securely segregated in submissions queue
              sourceAttribution: sourceAttribution.trim() || undefined,
              contributorName: contributorName.trim() || 'Student Contributor',
              contributorEmail: contributorEmail.trim() || undefined,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            setSubmitted(true);
            toast.success('Resource submitted for administrator verification!');
          } catch (docErr: any) {
            console.error(docErr);
            setError('File uploaded, but could not record submission details.');
          } finally {
            setSubmitting(false);
          }
        }
      );
    } catch (err: any) {
      console.error(err);
      setError('An unexpected error occurred while preparing upload.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumb items={[{ label: 'Submit a Resource' }]} />

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100 text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu size={14} /> Peer Knowledge Contribution
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            Submit an Academic Resource
          </h1>
          <p className="text-sm text-navy-600 mt-1 max-w-2xl leading-relaxed">
            Have high-quality lecture notes, verified model question papers, or complete lab manuals? Contribute them to the ECEForge catalog. All submissions are reviewed by student administrators prior to public publishing.
          </p>
        </div>

        {error && <Alert title="Submission Error" description={error} />}

        {submitted ? (
          <Card className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-bold text-navy-900">Thank You for Contributing!</h2>
            <p className="text-sm text-navy-600 max-w-md mx-auto leading-relaxed">
              Your resource <span className="font-semibold text-navy-900">"{title}"</span> has been received and queued for review. Once verified against the syllabus, it will be published for all ECE students.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setTitle('');
                  setDescription('');
                  setFile(null);
                  setUploadProgress(null);
                }}
              >
                Submit Another Resource
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 border border-navy-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Contributor Info */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-3">
                  1. Your Details (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contributor Name"
                    placeholder="e.g. S. Ananya (Batch of 2026)"
                    value={contributorName}
                    onChange={e => setContributorName(e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. ananya@college.edu (private, for questions)"
                    value={contributorEmail}
                    onChange={e => setContributorEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 2: Academic Classification */}
              <div className="pt-2 border-t border-navy-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-3">
                  2. Academic Placement
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
                    options={SEMESTERS.map(sem => ({
                      value: String(sem),
                      label: `${sem}th Semester`,
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
                    placeholder={availableSubjects.length === 0 ? 'No subjects found' : 'Select Subject'}
                    required
                    disabled={availableSubjects.length === 0}
                  />
                </div>
              </div>

              {/* Section 3: Resource Information */}
              <div className="pt-2 border-t border-navy-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-3">
                  3. Resource Information
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Resource Title *"
                    placeholder="e.g. Complete Handwritten Notes on Fourier Transforms"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Category *"
                      value={category}
                      onChange={e => setCategory(e.target.value as ResourceCategory)}
                      options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                      required
                    />
                    <Input
                      label="Unit Number (Optional, 1–5)"
                      type="number"
                      min="1"
                      max="5"
                      placeholder="e.g. 2"
                      value={unitNumber}
                      onChange={e => setUnitNumber(e.target.value)}
                    />
                  </div>

                  <Textarea
                    label="Description / Topic Summary (Optional)"
                    placeholder="e.g. Covers Properties of CTFT, Duality, Parseval relation, and previous VTU numericals."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                  />

                  <Input
                    label="Source / Faculty Attribution (Optional)"
                    placeholder="e.g. Dr. K. Rao / Department Study Material"
                    value={sourceAttribution}
                    onChange={e => setSourceAttribution(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 4: PDF Document */}
              <div className="pt-2 border-t border-navy-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-3">
                  4. PDF Document Upload
                </h3>
                <div className="border-2 border-dashed border-navy-200 rounded-xl p-6 text-center hover:border-cyan-400 transition bg-slate-50">
                  <input
                    type="file"
                    accept="application/pdf"
                    id="resource-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="resource-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <Upload size={22} />
                    </div>
                    <span className="text-sm font-medium text-navy-800">
                      {file ? file.name : 'Click to select or drag PDF file'}
                    </span>
                    <span className="text-xs text-navy-400">PDF files only, maximum 25 MB</span>
                  </label>
                </div>

                {file && (
                  <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-navy-50 text-xs text-navy-800 font-medium">
                    <FileText size={16} className="text-cyan-600 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-navy-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                )}

                {uploadProgress !== null && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-navy-600">
                      <span>Uploading document...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-navy-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-2 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-navy-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  disabled={!file || !subjectId || submitting}
                  leftIcon={<Send size={15} />}
                >
                  Submit for Verification
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
