import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-navy-950 text-navy-300 border-t border-navy-800">
      <div className="section py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand & tagline */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white text-xl font-bold">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h6M12 6v12M22 12h-6" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span>ECEForge</span>
          </div>
          <p className="text-sm max-w-xs">Learn. Build. Engineer.</p>
        </div>
        {/* Navigation links */}
        <div>
          <h3 className="text-sm font-semibold text-navy-200 mb-3">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
            <li><Link to="/browse" className="hover:text-cyan-400 transition-colors">Browse Resources</Link></li>
            <li><Link to="/schemes" className="hover:text-cyan-400 transition-colors">Schemes</Link></li>
            <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About</Link></li>
          </ul>
        </div>
        {/* Legal & help */}
        <div>
          <h3 className="text-sm font-semibold text-navy-200 mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
            <li><Link to="/submission" className="hover:text-cyan-400 transition-colors">Resource Submission</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-800">
        <div className="section py-4 text-center text-xs text-navy-400">
          © {currentYear} ECEForge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
