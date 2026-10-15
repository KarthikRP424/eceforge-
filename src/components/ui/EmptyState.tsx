import React from 'react';
import { FolderOpen, Search, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center mb-4 text-navy-400">
        {icon ?? <FolderOpen size={28} />}
      </div>
      <h3 className="text-lg font-semibold text-navy-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-navy-500 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search size={28} />}
      title={`No results for "${query}"`}
      description="Try different keywords, or browse by semester and scheme."
    />
  );
}

export function Alert({ title, description, variant = 'error' }: { title: string; description?: string; variant?: 'error' | 'warning' | 'info' }) {
  const bg = variant === 'error' ? 'bg-red-50 border-red-200 text-red-800' : variant === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-cyan-50 border-cyan-200 text-cyan-800';
  const iconColor = variant === 'error' ? 'text-red-500' : variant === 'warning' ? 'text-amber-500' : 'text-cyan-500';
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${bg} text-sm`}>
      <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <div>
        <div className="font-semibold">{title}</div>
        {description && <div className="mt-1 opacity-90">{description}</div>}
      </div>
    </div>
  );
}

