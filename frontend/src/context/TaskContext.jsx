import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskApi } from '../services/api.js';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskApi.getAll();
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (task) => {
    const res = await taskApi.create(task);
    setTasks(prev => [res.data, ...prev]);
    return res;
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    const res = await taskApi.update(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    return res;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await taskApi.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const uploadAttachment = useCallback(async (id, file, onProgress) => {
    const res = await taskApi.uploadAttachment(id, file, onProgress);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...res.data } : t));
    return res;
  }, []);

  const removeAttachment = useCallback(async (id) => {
    await taskApi.deleteAttachment(id);
    setTasks(prev => prev.map(t => t.id === id
      ? { ...t, attachmentPath: null, attachmentName: null, attachmentType: null, attachmentSize: null }
      : t));
  }, []);

  const value = {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    uploadAttachment,
    removeAttachment,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used inside <TaskProvider>');
  return ctx;
}
