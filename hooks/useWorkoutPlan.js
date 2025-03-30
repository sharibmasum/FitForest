import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export function useWorkoutPlan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState([]);

  // Fetch workout plan for the current user
  const fetchWorkoutPlan = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('profile_id', user.id)
        .order('day');

      if (error) throw error;

      setWorkoutPlan(data || []);
    } catch (err) {
      console.error('Error fetching workout plan:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add a workout day
  const addWorkoutDay = useCallback(async ({ day, startTime, endTime }) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('workout_plans')
        .insert([
          {
            profile_id: user.id,
            day,
            start_time: startTime,
            end_time: endTime
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setWorkoutPlan(current => [...current, data]);
      return data;
    } catch (err) {
      console.error('Error adding workout day:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update a workout day
  const updateWorkoutDay = useCallback(async (id, { startTime, endTime }) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('workout_plans')
        .update({
          start_time: startTime,
          end_time: endTime
        })
        .eq('id', id)
        .eq('profile_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setWorkoutPlan(current =>
        current.map(plan => (plan.id === id ? data : plan))
      );
      return data;
    } catch (err) {
      console.error('Error updating workout day:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete a workout day
  const deleteWorkoutDay = useCallback(async (id) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      setWorkoutPlan(current => current.filter(plan => plan.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting workout day:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    workoutPlan,
    loading,
    error,
    fetchWorkoutPlan,
    addWorkoutDay,
    updateWorkoutDay,
    deleteWorkoutDay,
    clearError,
  };
} 