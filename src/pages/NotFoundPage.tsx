import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Cpu, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto shadow-sm">
          <Cpu size={32} />
        </div>
        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-navy-900 tracking-tight">404</span>
          <h1 className="text-xl font-bold text-navy-900">Page Not Found</h1>
          <p className="text-xs text-navy-500 leading-relaxed">
            The resource, scheme, or page you were looking for doesn't exist or has moved. Check your URL or explore from the homepage.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" size="sm" leftIcon={<Home size={14} />}>
              Return Home
            </Button>
          </Link>
          <Link to="/schemes">
            <Button variant="outline" size="sm">
              Browse Schemes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
