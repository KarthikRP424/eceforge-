import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LogOut, Settings, BookOpen, Home, Users, Folder, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils';

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: <Home size={16} /> },
  { to: '/admin/schemes', label: 'Schemes', icon: <Folder size={16} /> },
  { to: '/admin/subjects', label: 'Subjects', icon: <BookOpen size={16} /> },
  { to: '/admin/resources', label: 'Resources', icon: <Upload size={16} /> },
];
interface AdminLayoutProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({ title, description, children }: AdminLayoutProps) {
  const { adminProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-100">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 bg-navy-950 text-navy-200 border-r border-navy-800">
        <div className="p-6 flex flex-col h-full">
          <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold mb-8">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h6M12 6v12M22 12h-6" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span>ECEForge Admin</span>
          </Link>

          <nav className="flex-1 space-y-1">
            {ADMIN_NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-md text-sm transition-colors',
                    isActive ? 'bg-cyan-600 text-white' : 'hover:bg-navy-800 hover:text-cyan-300',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom user block */}
          <div className="mt-6 pt-4 border-t border-navy-800">
            <div className="flex items-center gap-2 text-sm mb-2">
              <Settings size={16} className="text-cyan-400" />
              <span>{adminProfile?.displayName ?? adminProfile?.email ?? 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300"
            >
              <LogOut size={14} />
              Sign Out
            </button>
            <Link
              to="/"
              target="_blank"
              rel="noopener"
              className="mt-3 block text-xs text-cyan-400 hover:underline"
            >
              View site ↗
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile drawer – hidden for now, could be added later */}

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-navy-200 shadow-sm p-4 flex items-center justify-between">
          <div>
            {title && <h1 className="text-lg font-semibold text-navy-900">{title}</h1>}
            {description && <p className="text-sm text-navy-500">{description}</p>}
          </div>
          <Link
            to="/"
            target="_blank"
            rel="noopener"
            className="text-sm text-cyan-600 hover:underline"
          >
            View Site ↗
          </Link>
        </header>
        <section className="flex-1 overflow-auto p-6 bg-white">
          {children ?? <Outlet />}
        </section>
      </main>
    </div>
  );
}
