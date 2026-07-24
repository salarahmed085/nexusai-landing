export default function TaskFilters({ 
  searchQuery, 
  onSearchChange, 
  statusFilter, 
  onStatusChange, 
  priorityFilter, 
  onPriorityChange, 
  sortBy, 
  onSortChange,
  resultCount 
}) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-10 py-2.5 bg-dark-800/80 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={e => onStatusChange(e.target.value)}
          className="px-3 py-2.5 bg-dark-800/80 border border-dark-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => onPriorityChange(e.target.value)}
          className="px-3 py-2.5 bg-dark-800/80 border border-dark-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all cursor-pointer"
        >
          <option value="">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
          className="px-3 py-2.5 bg-dark-800/80 border border-dark-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alphabetical">A-Z</option>
        </select>
      </div>

      {/* Result count */}
      {resultCount !== undefined && (
        <div className="text-sm text-dark-500 flex-shrink-0">
          <span className="text-brand-400 font-semibold">{resultCount}</span> tasks
        </div>
      )}
    </div>
  );
}
