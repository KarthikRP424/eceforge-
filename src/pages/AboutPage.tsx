import React from 'react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Cpu, BookOpen, Layers, ShieldCheck, Target, Sparkles } from 'lucide-react';

export default function AboutPage() {
  React.useEffect(() => {
    document.title = 'About ECEForge | Academic Knowledge Platform';
  }, []);
  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumb items={[{ label: 'About ECEForge' }]} />

        {/* Hero Section */}
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 border border-cyan-500/20 shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold uppercase tracking-wider">
            <Cpu size={14} /> Exclusively for Electronics & Communication
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Engineers. <br />
            <span className="text-cyan-400">Curated for ECE.</span>
          </h1>
          <p className="text-navy-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            ECEForge is a focused academic knowledge platform created to solve a persistent frustration in engineering education: finding the exact, scheme-accurate lecture notes, question banks, and lab manuals without wading through unorganized groups or generic portals.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-navy-900 text-base">Scheme Isolation</h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              We strictly segregate resources between academic schemes (VTU 2022 and VTU 2025). No mixed syllabus versions or misleading content.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-navy-900 text-base">Unit-Wise Precision</h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Find complete module notes, unit-wise reference PDFs, model question papers, and lab manuals organized semester by semester (Semesters 3–7).
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-navy-900 text-base">Verified & Student-First</h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Fast, direct downloads and embedded previews. No paywalls, no clickbait ads, and no invented statistics or fake reviews.
            </p>
          </Card>
        </div>

        {/* Academic Integrity & Disclaimer */}
        <Card className="p-6 sm:p-8 bg-white border border-navy-100 space-y-4">
          <h2 className="text-lg font-bold text-navy-900">Academic Disclaimer & Attribution</h2>
          <p className="text-xs text-navy-600 leading-relaxed">
            ECEForge is an independent academic resource repository created by and for Electronics and Communication Engineering students. ECEForge is not officially associated with, endorsed by, or affiliated with Visvesvaraya Technological University (VTU) or any constituent institution.
          </p>
          <p className="text-xs text-navy-600 leading-relaxed">
            All course syllabi, subject codes, and academic frameworks correspond to public university guidelines. Study materials are shared under educational fair-use principles to support exam preparation and peer learning.
          </p>
        </Card>
      </div>
    </div>
  );
}
