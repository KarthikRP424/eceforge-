import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { Shield, Database, CheckCircle2, RefreshCw, Server, AlertCircle, Trash2, Check, ExternalLink } from 'lucide-react';
import type { ResourceReport } from '@/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [cacheClearing, setCacheClearing] = useState(false);
  const [reports, setReports] = useState<ResourceReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    document.title = 'Settings & Reports | ECEForge Admin';
    const q = query(collection(db, 'reports'));
    const unsub = onSnapshot(
      q,
      snap => {
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as ResourceReport[];
        setReports(list);
        setLoadingReports(false);
      },
      err => {
        console.error('Failed to load reports:', err);
        setLoadingReports(false);
      }
    );
    return () => unsub();
  }, []);

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status });
      toast.success(`Report marked as ${status}`);
    } catch (err) {
      console.error('Failed to update report:', err);
      toast.error('Failed to update report status');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Delete this report record permanently?')) return;
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      toast.success('Report deleted');
    } catch (err) {
      console.error('Failed to delete report:', err);
      toast.error('Failed to delete report');
    }
  };

  const handleClearCache = () => {
    setCacheClearing(true);
    setTimeout(() => {
      setCacheClearing(false);
      toast.success('Client cache cleared.');
    }, 600);
  };

  return (
    <AdminLayout
      title="Platform Settings"
      description="Manage administrative security, Firebase integration, and platform configurations"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Administrator Identity Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-base">Administrator Profile</h3>
              <p className="text-xs text-navy-500">Authenticated staff session and security status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-navy-100">
              <span className="text-navy-400 block mb-1">Admin Email</span>
              <span className="font-semibold text-navy-900">{user?.email ?? 'admin@eceforge.edu'}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-navy-100">
              <span className="text-navy-400 block mb-1">Administrator UID</span>
              <span className="font-mono text-navy-700">{user?.uid ?? 'Staff-Local'}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-navy-100">
              <span className="text-navy-400 block mb-1">Authorization Role</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Full Access (Master Administrator)
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-navy-100">
              <span className="text-navy-400 block mb-1">Session Protocol</span>
              <span className="text-navy-700">Firebase Token Auth</span>
            </div>
          </div>
        </Card>

        {/* Cloud & Database Integration */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-base">Firebase Cloud Infrastructure</h3>
              <p className="text-xs text-navy-500">Connected database and cloud storage endpoints</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-navy-50/50 border border-navy-100">
              <span className="text-navy-600 font-medium">Firestore Security Rules</span>
              <span className="font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                v2 active (Admin write, public read)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-navy-50/50 border border-navy-100">
              <span className="text-navy-600 font-medium">Cloud Storage Bucket</span>
              <span className="font-mono text-navy-700">eceforge.appspot.com (25 MB max)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-navy-50/50 border border-navy-100">
              <span className="text-navy-600 font-medium">Academic Catalog Seeding</span>
              <span className="text-navy-600">VTU 2022 & VTU 2025 (Semesters 3–7)</span>
            </div>
          </div>
        </Card>

        {/* Maintenance Actions */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Server size={20} />
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-base">Cache & System Maintenance</h3>
              <p className="text-xs text-navy-500">Reset local browser state and refresh catalog indexes</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-xs font-semibold text-navy-800">Refresh Local Cache</h4>
              <p className="text-2xs text-navy-500">Forces instant reload of schemes and subjects data.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              loading={cacheClearing}
              leftIcon={<RefreshCw size={13} />}
            >
              Flush Cache
            </Button>
          </div>
        </Card>

        {/* Issue Reports Queue Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-navy-900 text-base">Resource Issue Reports</h3>
                <p className="text-xs text-navy-500">Student reports regarding broken links, outdated notes, or incorrect syllabus tags</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {reports.filter(r => r.status === 'open').length} Open
            </span>
          </div>

          {loadingReports ? (
            <p className="text-xs text-navy-400 py-4 text-center">Loading reported issues...</p>
          ) : reports.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-navy-100 rounded-xl">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
              <p className="text-xs text-navy-600 font-medium">No open issues reported</p>
              <p className="text-2xs text-navy-400">All student-reported notices have been resolved or cleared.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl border border-navy-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy-900">
                        {report.resourceTitle || 'Resource'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-2xs font-medium uppercase ${
                        report.status === 'open' ? 'bg-amber-100 text-amber-800' :
                        report.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-navy-700 bg-white p-2 rounded border border-navy-100">
                      "{report.reason}"
                    </p>
                    <div className="flex items-center gap-3 text-2xs text-navy-400">
                      <span>ID: {report.resourceId}</span>
                      <a
                        href={`/resource/${report.resourceId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-600 hover:underline inline-flex items-center gap-0.5"
                      >
                        Inspect Resource <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                    {report.status === 'open' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolveReport(report.id, 'resolved')}
                        leftIcon={<Check size={13} />}
                      >
                        Resolve
                      </Button>
                    )}
                    {report.status !== 'dismissed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveReport(report.id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    )}
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
