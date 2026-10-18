import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '@/lib/firestore';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookOpen, Layers, FileText, Download, CheckCircle, FileClock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Stats {
  schemes: number;
  subjects: number;
  published: number;
  drafts: number;
  archived: number;
  totalResources: number;
  totalDownloads: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <AdminLayout title="Admin Overview" description="Real-time academic resources and catalog statistics">
      <div className="space-y-8">
        {/* Quick action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-950 p-6 rounded-2xl text-white shadow-sm border border-cyan-500/20">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Resource Management Hub</h2>
            <p className="text-sm text-navy-300 mt-1">Upload verified PDFs, manage VTU schemes, and curate semester subjects.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/resources/upload">
              <Button variant="primary" leftIcon={<Plus size={16} />}>Upload Resource</Button>
            </Link>
            <Link to="/admin/schemes">
              <Button variant="outline" className="border-navy-600 text-white hover:bg-white/10 bg-transparent">Manage Schemes</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-navy-100 shadow-sm space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-navy-500">Active Schemes</div>
                  <div className="text-2xl font-bold text-navy-900 mt-0.5">{stats.schemes}</div>
                  <div className="text-2xs text-navy-400 mt-0.5">Configured schemes</div>
                </div>
              </Card>

              <Card hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                  <Layers size={24} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-navy-500">Active Subjects</div>
                  <div className="text-2xl font-bold text-navy-900 mt-0.5">{stats.subjects}</div>
                  <div className="text-2xs text-navy-400 mt-0.5">Across semesters 3–7</div>
                </div>
              </Card>

              <Card hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-navy-500">Published PDFs</div>
                  <div className="text-2xl font-bold text-navy-900 mt-0.5">{stats.published}</div>
                  <div className="text-2xs text-navy-400 mt-0.5">Publicly accessible</div>
                </div>
              </Card>

              <Card hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Download size={24} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-navy-500">Total Downloads</div>
                  <div className="text-2xl font-bold text-navy-900 mt-0.5">{stats.totalDownloads}</div>
                  <div className="text-2xs text-navy-400 mt-0.5">Logged student downloads</div>
                </div>
              </Card>
            </div>

            {/* Secondary Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100/50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-800">Published</h4>
                    <p className="text-xs text-navy-500">Visible to all students</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-navy-900">{stats.published}</span>
              </Card>

              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100/50 text-amber-700 flex items-center justify-center">
                    <FileClock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-800">Drafts</h4>
                    <p className="text-xs text-navy-500">Pending review / publishing</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-navy-900">{stats.drafts}</span>
              </Card>

              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-100/50 text-navy-700 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-800">Archived</h4>
                    <p className="text-xs text-navy-500">Hidden from public catalog</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-navy-900">{stats.archived}</span>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
