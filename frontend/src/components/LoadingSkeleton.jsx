export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={i}
          className="glass-card rounded-2xl p-5 animate-fade-in-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full skeleton-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded skeleton-shimmer" />
              <div className="h-3 w-12 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 rounded skeleton-shimmer" />
              <div className="h-4 w-20 rounded skeleton-shimmer" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 rounded skeleton-shimmer" />
              <div className="h-4 w-24 rounded skeleton-shimmer" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 rounded skeleton-shimmer" />
              <div className="h-4 w-16 rounded skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
