import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, FileText, FlaskConical, HelpCircle,
  ChevronRight, ArrowRight, Download, Clock,
} from 'lucide-react';
import { useActiveSchemes, useRecentResources, usePopularResources } from '@/hooks';
import { ResourceCardSkeleton } from '@/components/ui/Skeleton';
import { CategoryBadge } from '@/components/ui/Badge';
import { AVAILABLE_SEMESTERS, formatSemester, formatFileSize, CATEGORY_LABELS } from '@/types';
import { formatDate } from '@/utils';
import type { Resource } from '@/types';

// ── Resource Card ──────────────────────────────────────────────
function ResourceCard({ resource }: { resource: Resource }) {
  const navigate = useNavigate();
  return (
    <article
      className="card p-4 flex flex-col gap-3 cursor-pointer group"
      onClick={() => navigate(`/resources/${resource.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/resources/${resource.id}`)}
      aria-label={`View ${resource.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryBadge category={resource.category} />
        {resource.unitNumber && (
          <span className="text-2xs font-mono text-navy-400">Unit {resource.unitNumber}</span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-navy-900 group-hover:text-cyan-700 transition-colors line-clamp-2">
          {resource.title}
        </h3>
        {resource.description && (
          <p className="text-xs text-navy-500 mt-1 line-clamp-2">{resource.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2 text-2xs text-navy-400">
          <span>{resource.contentType === 'application/pdf' ? 'PDF' : resource.contentType}</span>
          <span>·</span>
          <span>{formatFileSize(resource.fileSize)}</span>
        </div>
        <span className="flex items-center gap-1 text-xs text-cyan-600 font-medium group-hover:gap-2 transition-all">
          Open <ChevronRight size={12} />
        </span>
      </div>
    </article>
  );
}

// ── Semester Button ────────────────────────────────────────────
function SemesterButton({ semester }: { semester: number }) {
  const colors = [
    'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
    'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  ];
  const color = colors[(semester - 3) % colors.length];
  return (
    <Link
      to={`/browse?semester=${semester}`}
      className={`flex flex-col items-center justify-center border rounded-xl p-4 transition-all ${color}`}
    >
      <span className="text-2xl font-bold">{semester}</span>
      <span className="text-xs mt-0.5">{formatSemester(semester)} Sem</span>
    </Link>
  );
}

// ── Hero Search ────────────────────────────────────────────────
function HeroSearch() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/browse?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="w-full max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search subjects, notes, schemes, or question papers…"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900
                       placeholder-navy-400 text-sm shadow-sm focus:outline-none focus:ring-2
                       focus:ring-cyan-500/30 focus:border-cyan-500 transition"
            aria-label="Search ECEForge resources"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl
                     text-sm transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-500
                     focus-visible:ring-offset-2"
        >
          Search
        </button>
      </div>
    </form>
  );
}

// ── Resource Categories Section ────────────────────────────────
const RESOURCE_CATEGORIES_INFO = [
  {
    icon: <BookOpen size={22} />,
    label: 'Notes & Unit Notes',
    description: 'Comprehensive subject notes organized by unit for easy exam preparation.',
    color: 'text-cyan-600 bg-cyan-50',
    query: 'notes',
  },
  {
    icon: <FileText size={22} />,
    label: 'Previous Question Papers',
    description: 'Past semester exam papers to help you understand patterns and prepare better.',
    color: 'text-violet-600 bg-violet-50',
    query: 'previous-papers',
  },
  {
    icon: <FlaskConical size={22} />,
    label: 'Lab Manuals',
    description: 'Practical experiment guides for all your ECE laboratory courses.',
    color: 'text-emerald-600 bg-emerald-50',
    query: 'lab-manual',
  },
  {
    icon: <HelpCircle size={22} />,
    label: 'Important Questions',
    description: 'Curated lists of important questions for internal and semester exams.',
    color: 'text-amber-600 bg-amber-50',
    query: 'important-questions',
  },
];

// ── Main Page ──────────────────────────────────────────────────
export default function HomePage() {
  const { data: schemes, loading: schemesLoading } = useActiveSchemes();
  const { data: recent, loading: recentLoading }   = useRecentResources(8);
  const { data: popular, loading: popularLoading } = usePopularResources(6);

  return (
    <div className="bg-white">
      {/* ─── Hero ─── */}
      <section className="relative bg-navy-950 overflow-hidden">
        {/* Circuit background pattern */}
        <div className="absolute inset-0 bg-circuit opacity-100 pointer-events-none" aria-hidden />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-950/95 to-navy-950" aria-hidden />

        <div className="section relative z-10 py-20 sm:py-28">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-slow" />
            <span className="text-cyan-400 text-sm font-medium tracking-wide">
              Exclusively for ECE Students
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl">
            Your ECE Knowledge.
            <br />
            <span className="text-cyan-400">One Powerful Hub.</span>
          </h1>

          <p className="mt-5 text-navy-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Find scheme-wise notes, subject PDFs, previous question papers, and laboratory
            resources — all organized for Electronics and Communication Engineering students.
          </p>

          {/* Search */}
          <div className="mt-8">
            <HeroSearch />
          </div>

          {/* Quick actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600
                         text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
            >
              Explore Resources <ArrowRight size={15} />
            </Link>
            <Link
              to="/browse?view=semesters"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20
                         text-navy-200 hover:text-white hover:border-white/40 font-medium
                         rounded-lg text-sm transition-colors"
            >
              Browse Semesters
            </Link>
          </div>

          {/* Scheme selector pills */}
          {!schemesLoading && schemes && schemes.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              <span className="text-xs text-navy-500 self-center mr-1">Available schemes:</span>
              {schemes.map(scheme => (
                <Link
                  key={scheme.id}
                  to={`/schemes/${scheme.slug}`}
                  className="px-3 py-1 border border-white/10 rounded-full text-xs text-navy-300
                             hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
                >
                  {scheme.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom waveform decoration */}
        <div className="h-12 bg-waveform opacity-30" aria-hidden />
      </section>

      {/* ─── Browse by Semester ─── */}
      <section className="section py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Browse by Semester</h2>
            <p className="text-sm text-navy-500 mt-0.5">Resources organized from 3rd to 7th semester</p>
          </div>
          <Link to="/browse" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-3 sm:gap-4">
          {AVAILABLE_SEMESTERS.map(sem => (
            <SemesterButton key={sem} semester={sem} />
          ))}
        </div>
      </section>

      {/* ─── Resource Categories ─── */}
      <section className="section py-10 border-t border-navy-50">
        <h2 className="text-xl font-bold text-navy-900 mb-2">What You'll Find Here</h2>
        <p className="text-sm text-navy-500 mb-6">
          All resource types are organized by scheme, semester, and subject.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCE_CATEGORIES_INFO.map(cat => (
            <Link
              key={cat.query}
              to={`/browse?category=${cat.query}`}
              className="card p-5 flex flex-col gap-3 group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                {cat.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy-900 group-hover:text-cyan-700 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-navy-500 mt-1 leading-relaxed">{cat.description}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-cyan-600 font-medium mt-auto">
                Browse <ChevronRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Recently Added ─── */}
      <section className="section py-10 border-t border-navy-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={15} className="text-cyan-500" />
              <h2 className="text-xl font-bold text-navy-900">Recently Added</h2>
            </div>
            <p className="text-sm text-navy-500">Freshly uploaded resources from your scheme</p>
          </div>
          <Link to="/browse?sort=recent" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
            See all <ChevronRight size={14} />
          </Link>
        </div>

        {recentLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)}
          </div>
        ) : recent && recent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recent.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        ) : (
          <div className="text-center py-10 text-navy-400">
            <p className="text-sm">No resources uploaded yet. Check back soon.</p>
          </div>
        )}
      </section>

      {/* ─── Popular Resources ─── */}
      {(popularLoading || (popular && popular.length > 0)) && (
        <section className="section py-10 border-t border-navy-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Download size={15} className="text-cyan-500" />
                <h2 className="text-xl font-bold text-navy-900">Most Downloaded</h2>
              </div>
              <p className="text-sm text-navy-500">Resources students access the most</p>
            </div>
            <Link to="/browse?sort=popular" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
              See all <ChevronRight size={14} />
            </Link>
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <ResourceCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popular!.map(r => <ResourceCard key={r.id} resource={r} />)}
            </div>
          )}
        </section>
      )}

      {/* ─── How it works ─── */}
      <section className="bg-navy-50 border-t border-navy-100">
        <div className="section py-14">
          <h2 className="text-xl font-bold text-navy-900 mb-2 text-center">How to Find Your Resources</h2>
          <p className="text-sm text-navy-500 text-center mb-10">Three quick steps to access your study materials</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Your Scheme',
                desc: 'Select the VTU scheme you're enrolled under. Each scheme has its own subject list.',
              },
              {
                step: '02',
                title: 'Pick Your Semester',
                desc: 'Navigate to your current semester (3rd through 7th) to see all subjects.',
              },
              {
                step: '03',
                title: 'Access Resources',
                desc: 'Browse notes, previous papers, lab manuals, and more. Preview or download instantly.',
              },
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 font-mono font-bold text-sm flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section py-14">
        <div className="bg-navy-950 rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit opacity-50 pointer-events-none" aria-hidden />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white">Start Exploring ECE Resources</h2>
            <p className="text-navy-300 text-sm mt-2 max-w-lg">
              Everything organized by scheme, semester, and subject — so you spend less time searching
              and more time learning.
            </p>
          </div>
          <div className="relative z-10 flex gap-3 flex-shrink-0">
            <Link
              to="/browse"
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg
                         text-sm transition-colors shadow-sm"
            >
              Browse All Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
