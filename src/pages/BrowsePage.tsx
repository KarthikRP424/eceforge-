import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CategoryBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { SearchEmptyState } from '@/components/ui/EmptyState';
import {
  Search,
  Filter,
  X,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import type { Resource, Subject, Scheme, ResourceCategory } from '@/types';

const CATEGORIES: { value: ResourceCategory; label: string }[] = [
  { value: 'notes', label: 'Complete Notes' },
  { value: 'unit-notes', label: 'Unit Notes' },
  { value: 'previous-papers', label: 'Previous Papers' },
  { value: 'lab-manual', label: 'Lab Manuals' },
  { value: 'important-questions', label: 'Important Questions' },
  { value: 'syllabus', label: 'Syllabus Copy' },
  { value: 'reference-material', label: 'Reference Material' },
];

const SEMESTERS = [3, 4, 5, 6, 7];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter parameters from URL query
  const queryParam = searchParams.get('q') ?? '';
  const schemeParam = searchParams.get('scheme') ?? 'all';
  const semParam = searchParams.get('sem') ?? searchParams.get('semester') ?? 'all';
  const categoryParam = searchParams.get('category') ?? 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync debounced search to URL params
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (debouncedQuery.trim()) {
      nextParams.set('q', debouncedQuery.trim());
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: true });

    if (debouncedQuery.trim()) {
      document.title = `Search: "${debouncedQuery.trim()}" | ECEForge`;
    } else if (semParam !== 'all') {
      document.title = `Semester ${semParam} Notes & Resources | ECEForge`;
    } else {
      document.title = 'Browse ECE Notes & Resources | ECEForge';
    }
  }, [debouncedQuery, semParam]);

  // Load active schemes
  useEffect(() => {
    const q = query(collection(db, 'schemes'), where('active', '==', true), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setSchemes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Scheme)));
    });
    return () => unsub();
  }, []);

  // Load active subjects
  useEffect(() => {
    const q = query(collection(db, 'subjects'), where('active', '==', true));
    const unsub = onSnapshot(q, snap => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
    });
    return () => unsub();
  }, []);

  // Load published resources
  useEffect(() => {
    const q = query(
      collection(db, 'resources'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      snap => {
        setResources(snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource)));
        setLoading(false);
      },
      err => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const schemeMap = useMemo(() => new Map(schemes.map(s => [s.id, s.name])), [schemes]);
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);

  // Update query params helper
  const updateFilter = (key: string, val: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val === 'all' || !val) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, val);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchParams(new URLSearchParams());
  };

  // Filter logic
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const sub = subjectMap.get(res.subjectId);
      const schemeName = schemeMap.get(res.schemeId) ?? '';

      // Scheme filter
      if (schemeParam !== 'all' && res.schemeId !== schemeParam) {
        return false;
      }

      // Semester filter
      if (semParam !== 'all' && res.semesterNumber !== Number(semParam)) {
        return false;
      }

      // Category filter
      if (categoryParam !== 'all' && res.category !== categoryParam) {
        return false;
      }

      // Text Search across title, description, category, unit, subject name, subject code, scheme name
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.trim().toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description?.toLowerCase().includes(q) ?? false;
        const matchesCategory = res.category.toLowerCase().includes(q);
        const matchesSubName = sub?.name.toLowerCase().includes(q) ?? false;
        const matchesSubCode = sub?.subjectCode?.toLowerCase().includes(q) ?? false;
        const matchesScheme = schemeName.toLowerCase().includes(q);
        const matchesUnit = res.unitNumber ? `unit ${res.unitNumber}`.includes(q) : false;

        if (
          !matchesTitle &&
          !matchesDesc &&
          !matchesCategory &&
          !matchesSubName &&
          !matchesSubCode &&
          !matchesScheme &&
          !matchesUnit
        ) {
          return false;
        }
      }

      return true;
    });
  }, [resources, schemeParam, semParam, categoryParam, debouncedQuery, subjectMap, schemeMap]);

  const hasActiveFilters =
    debouncedQuery.trim() !== '' ||
    schemeParam !== 'all' ||
    semParam !== 'all' ||
    categoryParam !== 'all';

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumb items={[{ label: 'Browse Resources' }]} />

        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            Browse Academic Resources
          </h1>
          <p className="text-sm text-navy-600 mt-1">
            Search verified VTU 2022 & 2025 scheme notes, unit PDFs, previous exam question papers, and lab manuals.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="bg-white p-3 rounded-2xl border border-navy-100 shadow-sm">
          <Input
            placeholder="Search subjects, codes (e.g. 21EC51), unit topics, or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftElement={<Search size={18} className="text-cyan-500" />}
            rightElement={
              searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-navy-400 hover:text-navy-700"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              ) : undefined
            }
          />
        </div>

        {/* Filter Controls Row */}
        <div className="bg-white p-4 rounded-xl border border-navy-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-700">
              <Filter size={14} className="text-cyan-500" /> Filter by:
            </div>

            {/* Scheme Select */}
            <select
              className="text-xs border border-navy-200 rounded-lg px-3 py-2 bg-white text-navy-800 font-medium outline-none focus:border-cyan-500"
              value={schemeParam}
              onChange={e => updateFilter('scheme', e.target.value)}
            >
              <option value="all">All Schemes</option>
              {schemes.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Semester Select */}
            <select
              className="text-xs border border-navy-200 rounded-lg px-3 py-2 bg-white text-navy-800 font-medium outline-none focus:border-cyan-500"
              value={semParam}
              onChange={e => updateFilter('sem', e.target.value)}
            >
              <option value="all">All Semesters (3–7)</option>
              {SEMESTERS.map(sem => (
                <option key={sem} value={String(sem)}>Semester {sem}</option>
              ))}
            </select>

            {/* Category Select */}
            <select
              className="text-xs border border-navy-200 rounded-lg px-3 py-2 bg-white text-navy-800 font-medium outline-none focus:border-cyan-500"
              value={categoryParam}
              onChange={e => updateFilter('category', e.target.value)}
            >
              <option value="all">All Resource Types</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Active Filter Clear & Count */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-navy-500 font-medium">
              Showing <span className="text-navy-900 font-bold">{filteredResources.length}</span> resources
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:bg-red-50"
                leftIcon={<X size={13} />}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-navy-100 rounded-xl p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="pt-2 flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <Card className="text-center py-16">
            <SearchEmptyState query={debouncedQuery || 'selected filters'} />
            {hasActiveFilters && (
              <div className="mt-4">
                <Button variant="primary" size="sm" onClick={clearAllFilters}>
                  Reset All Filters
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map(res => {
              const sub = subjectMap.get(res.subjectId);
              const schemeName = schemeMap.get(res.schemeId) ?? 'VTU Scheme';

              return (
                <Card
                  key={res.id}
                  hover
                  className="flex flex-col justify-between p-5 border border-navy-100/90 hover:border-cyan-300 group"
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
                      <h3 className="font-semibold text-navy-900 group-hover:text-cyan-600 transition-colors line-clamp-2 text-base leading-snug">
                        {res.title}
                      </h3>
                      {sub && (
                        <p className="text-xs font-medium text-navy-700 mt-1 flex items-center gap-1.5">
                          <BookOpen size={13} className="text-cyan-600 flex-shrink-0" />
                          <span className="truncate">{sub.name}</span>
                          {sub.subjectCode && (
                            <span className="font-mono text-2xs text-navy-400">({sub.subjectCode})</span>
                          )}
                        </p>
                      )}
                    </div>

                    {res.description && (
                      <p className="text-xs text-navy-500 line-clamp-2 leading-relaxed">
                        {res.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-4 border-t border-navy-50 flex items-center justify-between text-xs text-navy-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-navy-600">Sem {res.semesterNumber}</span>
                      <span>•</span>
                      <span className="truncate max-w-[110px]">{schemeName}</span>
                    </div>

                    <Link to={`/resources/${res.id}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ArrowRight size={13} />}
                        className="py-1 px-3 text-xs"
                      >
                        Access PDF
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
