import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookOpen, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Scheme } from '@/types';

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'VTU ECE Academic Schemes | ECEForge';
    const q = query(collection(db, 'schemes'), where('active', '==', true), orderBy('name', 'asc'));
    const unsub = onSnapshot(
      q,
      async snap => {
        const schemeList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Scheme));
        setSchemes(schemeList);

        // Fetch subject counts per scheme
        try {
          const subSnap = await getDocs(query(collection(db, 'subjects'), where('active', '==', true)));
          const counts: Record<string, number> = {};
          subSnap.docs.forEach(doc => {
            const data = doc.data();
            const sid = data.schemeId;
            counts[sid] = (counts[sid] ?? 0) + 1;
          });
          setSubjectCounts(counts);
        } catch (err) {
          console.error('Failed to get subject counts:', err);
        }

        setLoading(false);
      },
      err => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumb items={[{ label: 'Schemes' }]} />

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            VTU Academic Schemes
          </h1>
          <p className="text-sm text-navy-600 mt-1 max-w-2xl">
            Select your syllabus scheme to access semester-wise notes, previous papers, and laboratory manuals strictly tailored to your curriculum.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : schemes.length === 0 ? (
          <Card className="text-center py-16">
            <BookOpen size={36} className="mx-auto text-navy-300 mb-2" />
            <p className="text-navy-700 font-medium">No active schemes configured</p>
            <p className="text-xs text-navy-400 mt-1">Check back soon or configure schemes in the admin dashboard.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schemes.map(scheme => {
              const count = subjectCounts[scheme.id] ?? 0;
              return (
                <Card
                  key={scheme.id}
                  hover
                  className="flex flex-col justify-between p-6 sm:p-8 border border-navy-100 hover:border-cyan-400 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                        <BookOpen size={24} />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Active Scheme
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-navy-900 group-hover:text-cyan-600 transition-colors">
                        {scheme.name}
                      </h2>
                      <p className="text-xs font-mono text-cyan-700 mt-0.5">/schemes/{scheme.slug}</p>
                    </div>

                    <p className="text-sm text-navy-600 leading-relaxed">
                      {scheme.description || 'Comprehensive scheme-specific ECE syllabus, lecture notes, question banks, and practical laboratory assignments.'}
                    </p>

                    {/* Semester badges */}
                    <div>
                      <div className="text-xs font-semibold text-navy-700 mb-2">Available Semesters:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {[3, 4, 5, 6, 7].map(sem => (
                          <Link
                            key={sem}
                            to={`/schemes/${scheme.slug}/semester/${sem}`}
                            className="text-xs px-2.5 py-1 rounded-md bg-navy-50 text-navy-700 hover:bg-cyan-500 hover:text-white transition font-medium"
                          >
                            Sem {sem}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-navy-50 flex items-center justify-between">
                    <span className="text-xs text-navy-500 font-medium">
                      {count > 0 ? `${count} configured subjects` : 'Subjects being cataloged'}
                    </span>
                    <Link to={`/schemes/${scheme.slug}`}>
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                        Explore Scheme
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
