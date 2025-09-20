// src/components/shared/loaders/SkeletonLoader.tsx
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = "h-4 w-full" }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);