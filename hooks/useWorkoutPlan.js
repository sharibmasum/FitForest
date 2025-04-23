import { useState, useCallback, useEffect } from 'react';
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
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWorkoutPlan = useCallback(async (force = false) => {
    if (!user) return;
    
    try {
      if (force) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const { data, error: fetchError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('profile_id', user.id)
        .order('day', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        setWorkoutPlan(data);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchWorkoutPlan();
  }, [fetchWorkoutPlan]);

  const addWorkoutDay = async (dayData) => {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert([{ 
          profile_id: user.id,
          day: dayData.day,
          start_time: dayData.start_time,
          end_time: dayData.end_time
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchWorkoutPlan(true);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateWorkoutDay = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .update({
          start_time: updates.start_time,
          end_time: updates.end_time
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchWorkoutPlan(true);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteWorkoutDay = async (id) => {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchWorkoutPlan(true);
    } catch (err) {
      throw err;
    }
  };

  return {
    workoutPlan,
    loading,
    error,
    isRefreshing,
    fetchWorkoutPlan,
    addWorkoutDay,
    updateWorkoutDay,
    deleteWorkoutDay
  };
} 