import React from 'react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumb items={[{ label: 'Privacy Policy' }]} />

        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-navy-100 shadow-sm space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-navy-500">Effective Date: October 2026</p>

          <div className="space-y-4 text-sm text-navy-700 leading-relaxed">
            <h2 className="text-base font-semibold text-navy-900 pt-2">1. Overview</h2>
            <p>
              ECEForge is committed to protecting student privacy. This Privacy Policy describes how we collect, use, and handle information when you access our web platform.
            </p>

            <h2 className="text-base font-semibold text-navy-900 pt-2">2. Information We Collect</h2>
            <p>
              Public visitors can search, browse, view, and download educational resources without registering an account. We do not track private identity or require personal email addresses for standard PDF access.
            </p>
            <p>
              For authorized administrators, we securely store authentication credentials via Firebase Authentication for dashboard access.
            </p>

            <h2 className="text-base font-semibold text-navy-900 pt-2">3. Download Analytics</h2>
            <p>
              We maintain anonymous aggregate download counts to help students identify popular and useful study materials. No personally identifiable tracking cookies or behavioral advertising trackers are utilized.
            </p>

            <h2 className="text-base font-semibold text-navy-900 pt-2">4. Contact</h2>
            <p>
              If you have any questions regarding privacy practices, please contact us at privacy@eceforge.edu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
