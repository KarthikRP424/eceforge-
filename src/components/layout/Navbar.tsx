import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Laptop, BookOpen, Home, Info } from 'lucide-react';
import { cn } from '@/utils';

export function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={16} /> },
    { to: '/browse', label: 'Browse Resources', icon: <BookOpen size={16} /> },
    { to: '/schemes', label: 'Schemes', icon: <Laptop size={16} /> },
    { to: '/about', label: 'About', icon: <Info size={16} /> },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-30 bg-navy-950 border-b border-navy-800 shadow-navbar backdrop-blur-sm">
      <div className="section h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
          {/* Simple circuit logo - SVG inline */}
          <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h6M12 6v12M22 12h-6" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span>ECEForge</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => cn(
                'flex items-center gap-1 hover:text-cyan-400 transition-colors',
                isActive ? 'text-cyan-300' : 'text-navy-300',
              )}
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/admin/login"
            className="ml-4 px-4 py-1.5 border border-cyan-500 text-cyan-500 rounded-md hover:bg-cyan-500/10 transition"
          >
            Admin Login
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 text-navy-300 hover:text-cyan-400 focus-visible:outline-none"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'lg:hidden absolute inset-x-0 top-16 bg-navy-950 border-b border-navy-800 overflow-hidden transition-max-height duration-300',
          open ? 'max-h-96' : 'max-h-0',
        )}
      >
        <nav className="flex flex-col p-4 gap-4 text-sm">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-2 hover:text-cyan-400 transition-colors',
                isActive ? 'text-cyan-300' : 'text-navy-300',
              )}
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/admin/login"
            className="mt-2 px-4 py-2 border border-cyan-500 text-cyan-500 rounded-md hover:bg-cyan-500/10 transition"
          >
            Admin Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
