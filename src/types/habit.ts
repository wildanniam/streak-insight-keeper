
export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  color: string;
  createdAt: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completedAt: string;
}

export type HabitCategory = 
  | 'health'
  | 'productivity' 
  | 'learning'
  | 'social'
  | 'creative'
  | 'mindfulness'
  | 'other';

export const HABIT_CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: 'health', label: 'Health & Fitness', emoji: '💪' },
  { value: 'productivity', label: 'Productivity', emoji: '⚡' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { value: 'other', label: 'Other', emoji: '📋' },
];

export const HABIT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];
