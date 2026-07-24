import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskApi, projectApi } from '../services/api.js';
import { useTasks } from '../context/TaskContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Logo } from '../components/Icons.jsx';
import TaskStats from '../components/TaskStats.jsx';
import TaskFilters from '../components/TaskFilters.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskSkeleton from '../components/TaskSkeleton.jsx';
import TaskModal from '../components/TaskModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ProjectBoardPage() {
  const { id: projectId } = useParams();
  const { addToast } = useToast();
  const { refetch: refetchGlobalTasks } = useTasks(); // keep Dashboard-wide stats in sync

  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const loadProject = useCallback(async () => {
    setProjectLoading(true);
    setProjectError(null);
    try {
      const res = await projectApi.getById(projectId);
      setProject(res.data);
    } catch (err) {
      setProjectError(err.message);
    } finally {
      setProjectLoading(false);
    }
  }, [projectId]);

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const res = await taskApi.getAll({ projectId });
      setTasks(res.data || []);
    } catch (err) {
      setTasksError(err.message);
    } finally {
      setTasksLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);
  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    if (statusFilter) result = result.filter(t => t.status === statusFilter);
    if (priorityFilter) result = result.filter(t => t.priority === priorityFilter);

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const handleCreate = async (formData) => {
    try {
      const res = await taskApi.create({ ...formData, projectId });
      setTasks(prev => [res.data, ...prev]);
      refetchGlobalTasks();
      addToast(`Ticket ${res.data.ticketKey} created!`, 'success');
      setIsCreateOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to create ticket', 'error');
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingTask) return;
    try {
      await taskApi.update(editingTask.id, formData);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
      refetchGlobalTasks();
      addToast('Ticket updated successfully!', 'success');
      setEditingTask(null);
    } catch (err) {
      addToast(err.message || 'Failed to update ticket', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    try {
      await taskApi.delete(deletingTask.id);
      setTasks(prev => prev.filter(t => t.id !== deletingTask.id));
      refetchGlobalTasks();
      addToast('Ticket deleted successfully!', 'success');
      setDeletingTask(null);
    } catch (err) {
      addToast(err.message || 'Failed to delete ticket', 'error');
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center px-4">
        <ErrorState message={projectError || 'Project not found.'} onRetry={loadProject} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-dark-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-bold">NexusAI</span>
          </Link>
          <Link to="/projects" className="px-4 py-2 rounded-lg text-sm font-medium text-dark-300 hover:text-white transition-colors">
            ← All Projects
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Project header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0"
              style={{ backgroundColor: project.color }}
            >
              {project.key.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <p className="text-sm text-dark-500 font-mono">{project.key}</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20 self-start"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Ticket
          </button>
        </div>

        {/* Stats */}
        {!tasksLoading && !tasksError && tasks.length > 0 && (
          <TaskStats tasks={tasks} />
        )}

        {/* Filters */}
        {!tasksLoading && !tasksError && (
          <TaskFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={filteredTasks.length}
          />
        )}

        {/* Content */}
        {tasksLoading && <TaskSkeleton />}

        {tasksError && !tasksLoading && (
          <ErrorState message={tasksError} onRetry={loadTasks} />
        )}

        {!tasksLoading && !tasksError && filteredTasks.length === 0 && (
          tasks.length === 0 ? (
            <EmptyState
              variant="tasks"
              actionLabel="Create First Ticket"
              onAction={() => setIsCreateOpen(true)}
            />
          ) : (
            <EmptyState variant="tasks-filtered" />
          )
        )}

        {!tasksLoading && !tasksError && filteredTasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={setEditingTask}
                onDelete={setDeletingTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSubmit={handleCreate} />
      <TaskModal isOpen={!!editingTask} onClose={() => setEditingTask(null)} onSubmit={handleUpdate} task={editingTask} />
      <DeleteConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        taskTitle={deletingTask?.title || ''}
      />
    </div>
  );
}
