export default function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-48 rounded-lg skeleton-shimmer" />
        <div className="h-4 w-32 rounded skeleton-shimmer" />
      </div>

      {/* Welcome card skeleton */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full skeleton-shimmer" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 rounded skeleton-shimmer" />
            <div className="h-3 w-28 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="h-3 w-full rounded skeleton-shimmer mt-4" />
        <div className="h-3 w-3/4 rounded skeleton-shimmer mt-2" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i} 
            className="glass-card rounded-xl p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="h-8 w-12 rounded skeleton-shimmer mb-2" />
            <div className="h-3 w-20 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Two column widget skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task summary skeleton */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="h-5 w-32 rounded skeleton-shimmer" />
            <div className="h-4 w-16 rounded skeleton-shimmer" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full skeleton-shimmer flex-shrink-0" />
                <div className="h-3 flex-1 rounded skeleton-shimmer" />
                <div className="h-3 w-8 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden">
              <div className="h-full w-1/3 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </div>

        {/* Market widget skeleton */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="h-5 w-36 rounded skeleton-shimmer" />
            <div className="h-4 w-20 rounded skeleton-shimmer" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-20 rounded skeleton-shimmer" />
                  <div className="h-3 w-12 rounded skeleton-shimmer" />
                </div>
                <div className="text-right space-y-1.5">
                  <div className="h-4 w-16 rounded skeleton-shimmer" />
                  <div className="h-3 w-12 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-xl p-4 animate-fade-in-up"
            style={{ animationDelay: `${0.4 + i * 0.05}s` }}
          >
            <div className="w-10 h-10 rounded-lg skeleton-shimmer mb-3" />
            <div className="h-3 w-20 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
