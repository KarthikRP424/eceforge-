import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchemeBySlug, getSubjectsBySchemeAndSemester } from '@/lib/firestore';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { BookOpen, Search, ArrowRight, Layers, FileText } from 'lucide-react';
import type { Scheme, Subject } from '@/types';

export default function SemesterPage() {
  const { schemeSlug, semesterNumber } = useParams<{ schemeSlug: string; semesterNumber: string }>();
  const semNum = Number(semesterNumber);

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadSemesterData() {
      if (!schemeSlug || isNaN(semNum)) return;
      try {
        setLoading(true);
        const s = await getSchemeBySlug(schemeSlug);
        if (!s) {
          setError('Scheme not found.');
          setLoading(false);
          return;
        }
        setScheme(s);
        document.title = `${s.name} — Semester ${semNum} ECE Subjects | ECEForge`;
        const subs = await getSubjectsBySchemeAndSemester(s.id, semNum);
        setSubjects(subs);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load semester subjects.');
      } finally {
        setLoading(false);
      }
    }
    loadSemesterData();
  }, [schemeSlug, semNum]);

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const q = searchQuery.toLowerCase().trim();
    return subjects.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        (s.subjectCode && s.subjectCode.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [subjects, searchQuery]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Semester Information Unavailable"
          description={error ?? 'The requested semester could not be found.'}
          action={
            <Link to="/schemes">
              <Button variant="primary">Browse Schemes</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: 'Schemes', to: '/schemes' },
            { label: scheme.name, to: `/schemes/${scheme.slug}` },
            { label: `Semester ${semNum}` },
          ]}
        />

        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-navy-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xs font-semibold uppercase px-2.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-100">
                {scheme.name}
              </span>
              <span className="text-2xs font-semibold uppercase px-2.5 py-0.5 rounded bg-navy-50 text-navy-700 border border-navy-100">
                Semester {semNum}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
              Semester {semNum} Subjects & Notes
            </h1>
            <p className="text-sm text-navy-500 mt-1 max-w-xl">
              Select a subject below to access unit-wise notes, previous question papers, and laboratory manuals.
            </p>
          </div>

          <div className="w-full md:w-72">
            <Input
              placeholder="Search subjects or codes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftElement={<Search size={16} className="text-cyan-500" />}
            />
          </div>
        </div>

        {/* Subjects List */}
        {filteredSubjects.length === 0 ? (
          <Card className="text-center py-16">
            <EmptyState
              title={subjects.length === 0 ? 'No Subjects Uploaded Yet' : 'No Matching Subjects'}
              description={
                subjects.length === 0
                  ? 'Academic subjects for this semester have not been configured yet. Administrators can add subjects via the admin dashboard.'
                  : `No subjects found matching "${searchQuery}".`
              }
              action={
                searchQuery ? (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                ) : (
                  <Link to={`/schemes/${scheme.slug}`}>
                    <Button variant="primary" size="sm">
                      Back to {scheme.name}
                    </Button>
                  </Link>
                )
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSubjects.map(sub => (
              <Card
                key={sub.id}
                hover
                className="p-6 border border-navy-100 flex flex-col justify-between group hover:border-cyan-400"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {sub.subjectCode ? (
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-navy-100 text-navy-800">
                        {sub.subjectCode}
                      </span>
                    ) : (
                      <span className="text-xs text-navy-400">Core Subject</span>
                    )}
                    <span className="text-2xs font-medium text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                      ECE Curated
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-navy-900 group-hover:text-cyan-600 transition-colors">
                      {sub.name}
                    </h3>
                    {sub.description && (
                      <p className="text-xs text-navy-500 mt-1 line-clamp-2 leading-relaxed">
                        {sub.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-navy-50 flex items-center justify-between">
                  <span className="text-xs text-navy-400 flex items-center gap-1">
                    <FileText size={13} /> Notes & Papers Available
                  </span>
                  <Link
                    to={`/schemes/${scheme.slug}/semester/${semNum}/subjects/${sub.slug}`}
                  >
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight size={13} />}>
                      View Resources
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
