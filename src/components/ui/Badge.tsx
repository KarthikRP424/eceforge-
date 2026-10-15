import React from 'react';
import { cn } from '@/utils';
import type { ResourceCategory, ResourceStatus } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'violet';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-navy-100 text-navy-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger:  'bg-red-50 text-red-700',
    info:    'bg-cyan-50 text-cyan-700',
    violet:  'bg-violet-50 text-violet-700',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

const CATEGORY_BADGE_VARIANTS: Record<ResourceCategory, BadgeVariant> = {
  'notes':              'info',
  'unit-notes':         'violet',
  'previous-papers':    'warning',
  'lab-manual':         'success',
  'important-questions':'danger',
  'syllabus':           'default',
  'reference-material': 'default',
};

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  'notes':              'Notes',
  'unit-notes':         'Unit Notes',
  'previous-papers':    'Previous Papers',
  'lab-manual':         'Lab Manual',
  'important-questions':'Important Q',
  'syllabus':           'Syllabus',
  'reference-material': 'Reference',
};

export function CategoryBadge({ category }: { category: ResourceCategory }) {
  return (
    <Badge variant={CATEGORY_BADGE_VARIANTS[category]}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: ResourceStatus }) {
  const map: Record<ResourceStatus, { variant: BadgeVariant; label: string }> = {
    published: { variant: 'success', label: 'Published' },
    draft:     { variant: 'warning', label: 'Draft' },
    archived:  { variant: 'danger',  label: 'Archived' },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
