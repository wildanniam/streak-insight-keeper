
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Habit, HabitCompletion } from '@/types/habit';

export const useHabits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load habits from Supabase
  const loadHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedHabits: Habit[] = data.map(habit => ({
        id: habit.id,
        name: habit.name,
        description: habit.description || '',
        category: habit.category as any,
        color: habit.color,
        createdAt: habit.created_at
      }));

      setHabits(formattedHabits);
    } catch (error: any) {
      toast({
        title: "Error loading habits",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Load completions from Supabase
  const loadCompletions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedCompletions: HabitCompletion[] = data.map(completion => ({
        habitId: completion.habit_id,
        date: completion.date,
        completedAt: completion.completed_at
      }));

      setCompletions(formattedCompletions);
    } catch (error: any) {
      toast({
        title: "Error loading completions",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Add new habit
  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: habitData.name,
          description: habitData.description,
          category: habitData.category,
          color: habitData.color
        })
        .select()
        .single();

      if (error) throw error;

      const newHabit: Habit = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        category: data.category,
        color: data.color,
        createdAt: data.created_at
      };

      setHabits(prev => [newHabit, ...prev]);
      
      toast({
        title: "Habit created!",
        description: `"${habitData.name}" has been added to your habits.`
      });
    } catch (error: any) {
      toast({
        title: "Error creating habit",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Toggle habit completion
  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    if (!user) return;

    const dateString = date.toISOString().split('T')[0];
    const existingCompletion = completions.find(
      c => c.habitId === habitId && c.date === dateString
    );

    try {
      if (existingCompletion) {
        // Remove completion
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('date', dateString)
          .eq('user_id', user.id);

        if (error) throw error;

        setCompletions(prev => prev.filter(c => 
          !(c.habitId === habitId && c.date === dateString)
        ));
      } else {
        // Add completion
        const { data, error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            date: dateString
          })
          .select()
          .single();

        if (error) throw error;

        const newCompletion: HabitCompletion = {
          habitId: data.habit_id,
          date: data.date,
          completedAt: data.completed_at
        };

        setCompletions(prev => [...prev, newCompletion]);
      }
    } catch (error: any) {
      toast({
        title: "Error updating completion",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Calculate streak
  const getStreak = (habitId: string): number => {
    const habitCompletions = completions
      .filter(c => c.habitId === habitId)
      .map(c => new Date(c.date))
      .sort((a, b) => b.getTime() - a.getTime());

    if (habitCompletions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestCompletion = habitCompletions[0];
    latestCompletion.setHours(0, 0, 0, 0);
    
    const daysDiff = (today.getTime() - latestCompletion.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 1) return 0;

    let currentDate = new Date(latestCompletion);
    
    for (const completion of habitCompletions) {
      completion.setHours(0, 0, 0, 0);
      if (completion.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadHabits();
      loadCompletions();
    } else {
      setHabits([]);
      setCompletions([]);
    }
    setLoading(false);
  }, [user]);

  return {
    habits,
    completions,
    loading,
    addHabit,
    toggleHabitCompletion,
    getStreak
  };
};
