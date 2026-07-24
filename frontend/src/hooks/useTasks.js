import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../services/api.js';

export function useTasks() {
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

  const createTask = async (task) => {
    const res = await taskApi.create(task);
    setTasks(prev => [res.data, ...prev]);
    return res;
  };

  const updateTask = async (id, updates) => {
    const res = await taskApi.update(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    return res;
  };

  const deleteTask = async (id) => {
    await taskApi.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };
}
