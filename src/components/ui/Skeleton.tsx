import { cn } from '@/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-gradient-to-r from-navy-100 via-navy-50 to-navy-100 bg-[length:200%_100%] animate-shimmer',
        className,
      )}
    />
  );
}

export function ResourceCardSkeleton() {
  return (
    <div className="bg-white border border-navy-100 rounded-xl p-4 space-y-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SubjectCardSkeleton() {
  return (
    <div className="bg-white border border-navy-100 rounded-xl p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-5 w-5 text-cyan-500', className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

