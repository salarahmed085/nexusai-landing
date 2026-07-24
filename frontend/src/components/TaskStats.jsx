export default function TaskStats({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const highPriority = tasks.filter(t => t.priority === 'High').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total Tasks', value: total, color: 'from-brand-500 to-brand-400', bg: 'bg-brand-500/10', text: 'text-brand-400' },
    { label: 'Completed', value: completed, color: 'from-green-500 to-green-400', bg: 'bg-green-500/10', text: 'text-green-400' },
    { label: 'Pending', value: pending, color: 'from-yellow-500 to-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    { label: 'High Priority', value: highPriority, color: 'from-red-500 to-red-400', bg: 'bg-red-500/10', text: 'text-red-400' },
  ];

  return (
    <div className="mb-8 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className={`${stat.bg} rounded-xl p-4 sm:p-5 border border-dark-800/30 animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <p className={`text-2xl sm:text-3xl font-bold ${stat.text} mb-1`}>{stat.value}</p>
            <p className="text-xs sm:text-sm text-dark-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-dark-300">Completion Progress</span>
          <span className="text-sm font-bold text-white">{completionRate}%</span>
        </div>
        <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-green-400 transition-all duration-700 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-dark-500">
          <span>{completed} done</span>
          <span>{inProgress} in progress</span>
          <span>{pending + inProgress} remaining</span>
        </div>
      </div>
    </div>
  );
}
