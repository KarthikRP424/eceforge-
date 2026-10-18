import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  to?: string; // optional for last item (no link)
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const defaultItems: BreadcrumbItem[] = [
    { label: 'Home', to: '/' },
  ];
  const allItems = [...defaultItems, ...items];
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm text-navy-500">
      {allItems.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.to ? (
            <Link to={item.to} className="hover:text-navy-800 transition-colors flex items-center gap-0.5">
              {idx === 0 && <Home size={14} aria-hidden />}
              {item.label}
            </Link>
          ) : (
            <span className="flex items-center gap-0.5" aria-current="page">
              {idx === 0 && <Home size={14} aria-hidden />}
              {item.label}
            </span>
          )}
          {idx < allItems.length - 1 && (
            <ChevronRight size={12} className="text-navy-300 mx-0.5" aria-hidden />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Helper to generate breadcrumb items based on URL pattern
export function useAutoBreadcrumb(): BreadcrumbItem[] {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let accumulated = '';
  for (let i = 0; i < parts.length; i++) {
    accumulated += `/${parts[i]}`;
    // infer a readable label
    let label = parts[i]
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/^\d+/, match => `${match}${match === '1' ? 'st' : match === '2' ? 'nd' : match === '3' ? 'rd' : 'th'} `)
      .replace(/\b\w/g, c => c.toUpperCase());
    // special cases for known routes
    if (parts[i] === 'schemes') label = 'Schemes';
    if (parts[i] === 'admin') label = 'Admin';
    if (i === parts.length - 1) {
      items.push({ label }); // last item no link
    } else {
      items.push({ label, to: accumulated });
    }
  }
  return items;
}
