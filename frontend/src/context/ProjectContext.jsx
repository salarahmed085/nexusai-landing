import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectApi } from '../services/api.js';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectApi.getAll();
      setProjects(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (project) => {
    const res = await projectApi.create(project);
    setProjects(prev => [res.data, ...prev]);
    return res;
  }, []);

  const deleteProject = useCallback(async (id) => {
    await projectApi.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const value = {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    deleteProject,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used inside <ProjectProvider>');
  return ctx;
}
