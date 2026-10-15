import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { useAuth } from './context/AuthContext';

// ---- Lazy-loaded public pages ----
const HomePage        = lazy(() => import('./pages/HomePage'));
const BrowsePage      = lazy(() => import('./pages/BrowsePage'));
const SchemesPage     = lazy(() => import('./pages/SchemesPage'));
const SchemePage      = lazy(() => import('./pages/SchemePage'));
const SemesterPage    = lazy(() => import('./pages/SemesterPage'));
const SubjectPage     = lazy(() => import('./pages/SubjectPage'));
const ResourcePage    = lazy(() => import('./pages/ResourcePage'));
const AboutPage       = lazy(() => import('./pages/AboutPage'));
const ContactPage     = lazy(() => import('./pages/ContactPage'));
const PrivacyPage     = lazy(() => import('./pages/PrivacyPage'));
const TermsPage       = lazy(() => import('./pages/TermsPage'));
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'));

// ---- Lazy-loaded admin pages ----
const AdminLoginPage  = lazy(() => import('./pages/admin/LoginPage'));
const AdminDashboard  = lazy(() => import('./pages/admin/DashboardPage'));
const AdminSchemes    = lazy(() => import('./pages/admin/SchemesPage'));
const AdminSubjects   = lazy(() => import('./pages/admin/SubjectsPage'));
const AdminResources  = lazy(() => import('./pages/admin/ResourcesPage'));
const AdminUpload     = lazy(() => import('./pages/admin/UploadPage'));

// ---- Route guard ----
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// ---- Spinner ----
function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 text-navy-500">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}

// ---- Public layout ----
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* ---- Public Routes ---- */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/browse" element={<PublicLayout><BrowsePage /></PublicLayout>} />
        <Route path="/schemes" element={<PublicLayout><SchemesPage /></PublicLayout>} />
        <Route path="/schemes/:schemeSlug" element={<PublicLayout><SchemePage /></PublicLayout>} />
        <Route
          path="/schemes/:schemeSlug/semester/:semesterNumber"
          element={<PublicLayout><SemesterPage /></PublicLayout>}
        />
        <Route
          path="/schemes/:schemeSlug/semester/:semesterNumber/subjects/:subjectSlug"
          element={<PublicLayout><SubjectPage /></PublicLayout>}
        />
        <Route path="/resources/:resourceId" element={<PublicLayout><ResourcePage /></PublicLayout>} />
        <Route path="/about"    element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/contact"  element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/privacy"  element={<PublicLayout><PrivacyPage /></PublicLayout>} />
        <Route path="/terms"    element={<PublicLayout><TermsPage /></PublicLayout>} />

        {/* ---- Admin Routes ---- */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={<RequireAdmin><AdminDashboard /></RequireAdmin>}
        />
        <Route
          path="/admin/schemes"
          element={<RequireAdmin><AdminSchemes /></RequireAdmin>}
        />
        <Route
          path="/admin/subjects"
          element={<RequireAdmin><AdminSubjects /></RequireAdmin>}
        />
        <Route
          path="/admin/resources"
          element={<RequireAdmin><AdminResources /></RequireAdmin>}
        />
        <Route
          path="/admin/resources/upload"
          element={<RequireAdmin><AdminUpload /></RequireAdmin>}
        />

        {/* ---- 404 ---- */}
        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
    </Suspense>
  );
}
