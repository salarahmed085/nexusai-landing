export default function TaskSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i}
          className="glass-card rounded-2xl p-5 animate-fade-in-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-5 w-3/4 rounded skeleton-shimmer" />
            <div className="flex gap-1.5">
              <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
              <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 w-full rounded skeleton-shimmer" />
            <div className="h-3 w-2/3 rounded skeleton-shimmer" />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-20 rounded-lg skeleton-shimmer" />
            <div className="h-6 w-24 rounded-lg skeleton-shimmer" />
          </div>
          <div className="h-3 w-24 rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
