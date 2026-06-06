import { useCallback, useEffect, useState } from "react";
import {
  addSavingsEntry,
  createSavingsGoal,
  deleteSavingsEntry,
  deleteSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
} from "../api/savingsGoalsApi";

export function useSavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setGoals(await getSavingsGoals());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createGoal(payload) {
    const created = await createSavingsGoal(payload);
    setGoals((current) => [created, ...current]);
    return created;
  }

  async function updateGoal(id, payload) {
    const updated = await updateSavingsGoal(id, payload);
    setGoals((current) => current.map((goal) => (goal.id === id ? updated : goal)));
    return updated;
  }

  async function removeGoal(id) {
    await deleteSavingsGoal(id);
    setGoals((current) => current.filter((goal) => goal.id !== id));
  }

  async function addEntry(goalId, payload) {
    const updated = await addSavingsEntry(goalId, payload);
    setGoals((current) => current.map((goal) => (goal.id === goalId ? updated : goal)));
    return updated;
  }

  async function removeEntry(goalId, entryId) {
    const updated = await deleteSavingsEntry(goalId, entryId);
    setGoals((current) => current.map((goal) => (goal.id === goalId ? updated : goal)));
    return updated;
  }

  return {
    goals,
    loading,
    error,
    reload,
    createGoal,
    updateGoal,
    removeGoal,
    addEntry,
    removeEntry,
  };
}
