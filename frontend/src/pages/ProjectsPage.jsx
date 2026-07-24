import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProjectModal from '../components/ProjectModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import { Logo } from '../components/Icons.jsx';

function ProjectSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-36 rounded-2xl skeleton-shimmer" />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, loading, error, refetch, createProject, deleteProject } = useProjects();
  const { addToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);

  const handleCreate = async (form) => {
    try {
      await createProject(form);
      addToast('Project created successfully!', 'success');
      setIsCreateOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to create project', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    try {
      await deleteProject(deletingProject.id);
      addToast('Project deleted.', 'success');
      setDeletingProject(null);
    } catch (err) {
      addToast(err.message || 'Failed to delete project', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-dark-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-bold">NexusAI</span>
          </Link>
          <Link to="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-dark-300 hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Projects</h1>
            <p className="text-dark-500 text-sm">Create a project, then track its tickets on a board — just like Jira.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20 self-start"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </button>
        </div>

        {loading && <ProjectSkeleton />}

        {!loading && error && (
          <div className="bg-dark-900/20 border border-dark-850 rounded-2xl p-12 text-center">
            <p className="text-sm text-red-400 mb-3">Failed to load projects.</p>
            <button onClick={refetch} className="text-xs font-semibold text-brand-400 hover:text-brand-300">Try again</button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="bg-dark-900/20 border border-dark-850 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-400">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1">No projects yet</h3>
            <p className="text-xs text-dark-500 max-w-xs mx-auto mb-5">
              Create your first project to start tracking tickets on a board.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all"
            >
              Create First Project
            </button>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="glass-card rounded-2xl p-5 border border-dark-800/40 hover:border-dark-700/40 transition-all group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Link to={`/projects/${project.id}`} className="block">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.key.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate group-hover:text-brand-400 transition-colors">{project.name}</p>
                      <p className="text-xs text-dark-500 font-mono">{project.key}</p>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-dark-400 line-clamp-2 mb-2">{project.description}</p>
                  )}
                </Link>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-dark-800/50">
                  <Link to={`/projects/${project.id}`} className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                    Open board →
                  </Link>
                  <button
                    onClick={() => setDeletingProject(project)}
                    className="text-xs font-medium text-dark-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSubmit={handleCreate} />
      <DeleteConfirmModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        taskTitle={deletingProject?.name || ''}
        title="Delete Project?"
        warning="All of its tickets and attachments will be deleted too. This cannot be undone."
      />
    </div>
  );
}
