import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getSchemeBySlug,
  getSubjectBySlug,
  getPublishedResourcesBySubject,
} from '@/lib/firestore';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryBadge } from '@/components/ui/Badge';
import {
  BookOpen,
  FileText,
  Download,
  Eye,
  Calendar,
  Layers,
  HelpCircle,
  FlaskConical,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import type { Scheme, Subject, Resource, ResourceCategory } from '@/types';

const CATEGORY_TABS: { key: string; label: string; category?: ResourceCategory }[] = [
  { key: 'all', label: 'All Resources' },
  { key: 'unit-notes', label: 'Unit Notes', category: 'unit-notes' },
  { key: 'notes', label: 'Complete Notes', category: 'notes' },
  { key: 'previous-papers', label: 'Question Papers', category: 'previous-papers' },
  { key: 'lab-manual', label: 'Lab Manuals', category: 'lab-manual' },
  { key: 'important-questions', label: 'Important Questions', category: 'important-questions' },
];

export default function SubjectPage() {
  const { schemeSlug, semesterNumber, subjectSlug } = useParams<{
    schemeSlug: string;
    semesterNumber: string;
    subjectSlug: string;
  }>();
  const semNum = Number(semesterNumber);

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!schemeSlug || isNaN(semNum) || !subjectSlug) return;
      try {
        setLoading(true);
        const s = await getSchemeBySlug(schemeSlug);
        if (!s) {
          setError('Scheme not found.');
          setLoading(false);
          return;
        }
        setScheme(s);

        const sub = await getSubjectBySlug(subjectSlug, s.id);
        if (!sub || sub.semesterNumber !== semNum) {
          setError('Subject not found in this scheme & semester.');
          setLoading(false);
          return;
        }
        setSubject(sub);

        const resList = await getPublishedResourcesBySubject(sub.id);
        setResources(resList);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load subject materials.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [schemeSlug, semNum, subjectSlug]);

  const filteredResources = useMemo(() => {
    if (activeTab === 'all') return resources;
    return resources.filter(r => r.category === activeTab);
  }, [resources, activeTab]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !scheme || !subject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Subject Not Found"
          description={error ?? 'The requested subject does not exist or has been modified.'}
          action={
            <Link to="/schemes">
              <Button variant="primary">Browse Schemes</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Schemes', to: '/schemes' },
    { label: scheme.name, to: `/schemes/${scheme.slug}` },
    { label: `Semester ${semNum}`, to: `/schemes/${scheme.slug}/semester/${semNum}` },
    { label: subject.name },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumb items={breadcrumbs} />

        {/* Subject Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-navy-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {subject.subjectCode && (
              <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-navy-100 text-navy-800 tracking-wide">
                {subject.subjectCode}
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-cyan-50 text-cyan-800 border border-cyan-100">
              {scheme.name}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-navy-50 text-navy-700 border border-navy-100">
              Semester {semNum}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            {subject.name}
          </h1>

          {subject.description && (
            <p className="text-sm text-navy-600 leading-relaxed max-w-3xl">
              {subject.description}
            </p>
          )}

          <div className="pt-2 flex items-center gap-6 text-xs text-navy-500 border-t border-navy-50">
            <span>{resources.length} verified learning resources</span>
            <span>•</span>
            <span>Total downloads: {resources.reduce((sum, r) => sum + (r.downloadCount ?? 0), 0)}</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map(tab => {
            const count = tab.key === 'all'
              ? resources.length
              : resources.filter(r => r.category === tab.key).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-xs font-medium px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-navy-950 text-white shadow-sm font-semibold'
                    : 'bg-white text-navy-600 border border-navy-100 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-2xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-cyan-500 text-white' : 'bg-navy-100 text-navy-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <Card className="text-center py-16">
            <EmptyState
              title={activeTab === 'all' ? 'No Resources Uploaded Yet' : 'No Resources in this Category'}
              description={
                activeTab === 'all'
                  ? 'Study materials and PDFs for this subject are currently being reviewed and uploaded by authorized administrators.'
                  : 'Try selecting "All Resources" or another category tab above.'
              }
              action={
                activeTab !== 'all' ? (
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('all')}>
                    Show All Resources
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredResources.map(res => (
              <Card
                key={res.id}
                hover
                className="p-6 border border-navy-100 flex flex-col justify-between group hover:border-cyan-400"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CategoryBadge category={res.category} />
                    {res.unitNumber && (
                      <span className="font-mono text-2xs font-semibold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100">
                        Unit {res.unitNumber}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-navy-900 group-hover:text-cyan-600 transition-colors text-base leading-snug">
                      {res.title}
                    </h3>
                    {res.description && (
                      <p className="text-xs text-navy-500 mt-1 line-clamp-2 leading-relaxed">
                        {res.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-navy-50 flex items-center justify-between text-xs text-navy-400">
                  <div className="flex items-center gap-3">
                    {res.fileSize && <span>{formatFileSize(res.fileSize)}</span>}
                    <span className="flex items-center gap-1 text-cyan-700 font-medium">
                      <Download size={12} /> {res.downloadCount ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/resources/${res.id}`}>
                      <Button variant="primary" size="sm" leftIcon={<Eye size={13} />}>
                        View PDF
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
