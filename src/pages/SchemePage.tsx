import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchemeBySlug, getSubjectsByScheme } from '@/lib/firestore';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen, Layers, ArrowRight, GraduationCap } from 'lucide-react';
import type { Scheme, Subject } from '@/types';

const SEMESTERS = [3, 4, 5, 6, 7];

export default function SchemePage() {
  const { schemeSlug } = useParams<{ schemeSlug: string }>();

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchemeData() {
      if (!schemeSlug) return;
      try {
        setLoading(true);
        const s = await getSchemeBySlug(schemeSlug);
        if (!s) {
          setError('Scheme not found.');
          setLoading(false);
          return;
        }
        setScheme(s);
        document.title = `${s.name} Notes & Semesters | ECEForge`;
        const subs = await getSubjectsByScheme(s.id);
        setSubjects(subs);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load scheme details.');
      } finally {
        setLoading(false);
      }
    }
    loadSchemeData();
  }, [schemeSlug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Scheme Not Found"
          description="The requested VTU scheme does not exist or may have been deactivated."
          action={
            <Link to="/schemes">
              <Button variant="primary">View Available Schemes</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const subjectsBySemester = (sem: number) => {
    return subjects.filter(s => s.semesterNumber === sem);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumb items={[{ label: 'Schemes', to: '/schemes' }, { label: scheme.name }]} />

        {/* Hero Section */}
        <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-10 border border-cyan-500/20 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <span className="text-2xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Electronics & Communication Engineering
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {scheme.name}
            </h1>
            <p className="text-navy-300 text-sm leading-relaxed">
              {scheme.description || 'Access dedicated semester notes, question papers, and lab manuals organized specifically for this VTU academic curriculum.'}
            </p>
          </div>
        </div>

        {/* Semesters Selection Grid */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-navy-900 tracking-tight">Select Semester</h2>
            <p className="text-xs text-navy-500">Choose your current semester to browse branch subjects and study materials.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SEMESTERS.map(sem => {
              const semSubjects = subjectsBySemester(sem);
              return (
                <Card
                  key={sem}
                  hover
                  className="p-6 border border-navy-100 flex flex-col justify-between group hover:border-cyan-400"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                        <GraduationCap size={22} />
                      </div>
                      <span className="text-xs font-semibold text-navy-400 font-mono">
                        SEM 0{sem}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-navy-900 group-hover:text-cyan-600 transition-colors">
                        Semester {sem}
                      </h3>
                      <p className="text-xs text-navy-500 mt-1">
                        {semSubjects.length > 0
                          ? `${semSubjects.length} subject${semSubjects.length === 1 ? '' : 's'} cataloged`
                          : 'Syllabus being uploaded'}
                      </p>
                    </div>

                    {semSubjects.length > 0 && (
                      <div className="pt-2 border-t border-navy-50">
                        <ul className="space-y-1">
                          {semSubjects.slice(0, 3).map(sub => (
                            <li key={sub.id} className="text-xs text-navy-700 truncate flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                              <span className="truncate">{sub.name}</span>
                            </li>
                          ))}
                          {semSubjects.length > 3 && (
                            <li className="text-2xs text-navy-400 italic">
                              + {semSubjects.length - 3} more subjects
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-navy-50">
                    <Link to={`/schemes/${scheme.slug}/semester/${sem}`}>
                      <Button variant="primary" size="sm" fullWidth rightIcon={<ArrowRight size={14} />}>
                        Enter Semester {sem}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
