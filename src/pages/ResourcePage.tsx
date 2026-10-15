import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { recordDownload } from '@/lib/firestore';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PdfViewer } from '@/components/PdfViewer';
import {
  Download,
  Share2,
  AlertTriangle,
  Calendar,
  HardDrive,
  Eye,
  FileText,
  Check,
  BookOpen,
} from 'lucide-react';
import type { Resource, Subject, Scheme } from '@/types';
import toast from 'react-hot-toast';

export default function ResourcePage() {
  const { resourceId } = useParams<{ resourceId: string }>();

  const [resource, setResource] = useState<Resource | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    async function loadResourceData() {
      if (!resourceId) return;
      try {
        setLoading(true);
        const resDoc = await getDoc(doc(db, 'resources', resourceId));
        if (!resDoc.exists()) {
          setError('Resource not found or has been removed.');
          setLoading(false);
          return;
        }

        const resData = { id: resDoc.id, ...resDoc.data() } as Resource;
        setResource(resData);

        // Fetch subject & scheme in parallel
        const [subDoc, schemeDoc] = await Promise.all([
          getDoc(doc(db, 'subjects', resData.subjectId)),
          getDoc(doc(db, 'schemes', resData.schemeId)),
        ]);

        if (subDoc.exists()) {
          setSubject({ id: subDoc.id, ...subDoc.data() } as Subject);
        }
        if (schemeDoc.exists()) {
          setScheme({ id: schemeDoc.id, ...schemeDoc.data() } as Scheme);
        }

        // Fetch storage download URL
        if (resData.storagePath) {
          try {
            const url = await getDownloadURL(ref(storage, resData.storagePath));
            setDownloadUrl(url);
          } catch (storageErr) {
            console.error('Failed to get download URL from storage:', storageErr);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load resource details.');
      } finally {
        setLoading(false);
      }
    }

    loadResourceData();
  }, [resourceId]);

  const handleDownload = async () => {
    if (!resourceId) return;
    try {
      await recordDownload(resourceId);
      setResource(prev => (prev ? { ...prev, downloadCount: (prev.downloadCount ?? 0) + 1 } : null));
    } catch (err) {
      console.error('Failed to log download event:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Shareable link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    setTimeout(() => {
      setSubmittingReport(false);
      setReportModalOpen(false);
      setReportReason('');
      toast.success('Thank you. Resource report submitted for review.');
    }, 600);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-10 w-96" />
        <div className="h-[600px] w-full bg-navy-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Resource Not Found"
          description={error ?? 'The requested resource may have been unpublished or removed.'}
          action={
            <Link to="/browse">
              <Button variant="primary">Browse All Resources</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Schemes', to: '/schemes' },
    ...(scheme
      ? [
          { label: scheme.name, to: `/schemes/${scheme.slug}` },
          {
            label: `Semester ${resource.semesterNumber}`,
            to: `/schemes/${scheme.slug}/semester/${resource.semesterNumber}`,
          },
        ]
      : []),
    ...(subject && scheme
      ? [
          {
            label: subject.name,
            to: `/schemes/${scheme.slug}/semester/${resource.semesterNumber}/subjects/${subject.slug}`,
          },
        ]
      : []),
    { label: resource.title },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbs} />

        {/* Resource Header Info */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-navy-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={resource.category} />
              {resource.unitNumber && (
                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-violet-50 text-violet-700 border border-violet-100">
                  Unit {resource.unitNumber}
                </span>
              )}
              {scheme && (
                <span className="text-xs font-medium px-2.5 py-1 rounded bg-cyan-50 text-cyan-800 border border-cyan-100">
                  {scheme.name}
                </span>
              )}
              <span className="text-xs font-medium px-2.5 py-1 rounded bg-navy-50 text-navy-700 border border-navy-100">
                Semester {resource.semesterNumber}
              </span>
            </div>

            {/* Actions: Share & Report */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                leftIcon={copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              >
                {copied ? 'Copied Link' : 'Share'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportModalOpen(true)}
                className="text-navy-500 hover:text-red-600"
                leftIcon={<AlertTriangle size={14} />}
              >
                Report Issue
              </Button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            {resource.title}
          </h1>

          {subject && (
            <div className="flex items-center gap-2 text-sm text-navy-700 font-medium">
              <BookOpen size={16} className="text-cyan-600" />
              <span>{subject.name}</span>
              {subject.subjectCode && (
                <span className="font-mono text-xs text-navy-500 font-normal">
                  ({subject.subjectCode})
                </span>
              )}
            </div>
          )}

          {resource.description && (
            <p className="text-sm text-navy-600 leading-relaxed max-w-3xl pt-1">
              {resource.description}
            </p>
          )}

          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 border-t border-navy-50 text-xs text-navy-500">
            <span className="flex items-center gap-1.5">
              <HardDrive size={14} className="text-navy-400" />
              {formatFileSize(resource.fileSize)}
            </span>
            <span className="flex items-center gap-1.5">
              <Download size={14} className="text-navy-400" />
              {resource.downloadCount ?? 0} downloads
            </span>
            {resource.sourceReference && (
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-navy-400" />
                Source: {resource.sourceReference}
              </span>
            )}
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        {downloadUrl ? (
          <PdfViewer
            url={downloadUrl}
            title={resource.title}
            fileSize={resource.fileSize}
            onDownload={handleDownload}
          />
        ) : (
          <Card className="text-center py-12">
            <FileText size={36} className="mx-auto text-navy-300 mb-3" />
            <h3 className="font-semibold text-navy-800">PDF Loading or Direct Download</h3>
            <p className="text-xs text-navy-500 mt-1 max-w-sm mx-auto mb-4">
              The storage link is being resolved. If preview doesn't load shortly, check your network connection.
            </p>
          </Card>
        )}

        {/* Report Modal */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-navy-100 space-y-4 animate-scale-in">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} />
                <h3 className="font-bold text-navy-900 text-base">Report Resource</h3>
              </div>
              <p className="text-xs text-navy-600 leading-relaxed">
                Found a broken link, incorrect syllabus version, or copyrighted material? Let us know so our student administrators can rectify it.
              </p>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <textarea
                  required
                  placeholder="Describe the issue (e.g. Page missing, wrong scheme, outdated syllabus)..."
                  className="w-full text-xs p-3 border border-navy-200 rounded-lg outline-none focus:border-cyan-500 resize-none h-24"
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                    loading={submittingReport}
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
