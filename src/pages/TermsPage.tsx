import { useEffect } from 'react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Use | ECEForge';
  }, []);
  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumb items={[{ label: 'Terms of Use' }]} />

        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-navy-100 shadow-sm space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            Terms of Use
          </h1>
          <p className="text-xs text-navy-500">Effective Date: October 2026</p>

          <div className="space-y-4 text-sm text-navy-700 leading-relaxed">
            <h2 className="text-base font-semibold text-navy-900 pt-2">1. Educational Use Only</h2>
            <p>
              ECEForge is an academic knowledge-sharing platform intended solely for educational, non-commercial use by engineering students and educators.
            </p>

            <h2 className="text-base font-semibold text-navy-900 pt-2">2. Accuracy of Syllabus Information</h2>
            <p>
              While student administrators make every effort to curate accurate syllabus details, subject codes, and notes aligned with VTU 2022 and 2025 schemes, students are always advised to consult the official VTU website and their academic departments for binding circulars and exam schedules.
            </p>

            <h2 className="text-base font-semibold text-navy-900 pt-2">3. Content Removal & Takedown</h2>
            <p>
              If you represent an academic institution, author, or copyright holder and believe that any uploaded material infringes upon your copyright, please use the "Report Issue" button on the respective resource page or reach out directly to contact@eceforge.edu for swift removal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
