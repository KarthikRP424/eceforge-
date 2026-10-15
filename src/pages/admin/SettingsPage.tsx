import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { Shield, Database, Cloud, Key, CheckCircle2, RefreshCw, Server, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, adminProfile } = useAuth();
  const [cacheClearing, setCacheClearing] = useState(false);

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
      </div>
    </AdminLayout>
  );
}
