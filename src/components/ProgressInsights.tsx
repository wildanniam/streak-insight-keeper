
import React from 'react';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Habit, HabitCompletion, HABIT_CATEGORIES } from '@/types/habit';

interface ProgressInsightsProps {
  habits: Habit[];
  completions: HabitCompletion[];
  getStreak: (habitId: string) => number;
}

const ProgressInsights: React.FC<ProgressInsightsProps> = ({
  habits,
  completions,
  getStreak,
}) => {
  const getWeeklyProgress = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day.toISOString().split('T')[0];
    });

    return weekDays.map(day => {
      const dayCompletions = completions.filter(c => c.date === day);
      return {
        date: day,
        completions: dayCompletions.length,
        rate: habits.length > 0 ? (dayCompletions.length / habits.length) * 100 : 0,
      };
    });
  };

  const getMonthlyProgress = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    let totalPossible = 0;
    let totalCompleted = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      if (date <= now) {
        const dateString = date.toISOString().split('T')[0];
        const dayCompletions = completions.filter(c => c.date === dateString);
        totalCompleted += dayCompletions.length;
        totalPossible += habits.length;
      }
    }

    return totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
  };

  const getCategoryStats = () => {
    const categoryMap = new Map();
    
    habits.forEach(habit => {
      const category = habit.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          total: 0,
          completed: 0,
          totalStreak: 0,
        });
      }
      
      const stats = categoryMap.get(category);
      stats.total += 1;
      stats.totalStreak += getStreak(habit.id);
      
      // Check if completed today
      const today = new Date().toISOString().split('T')[0];
      const todayCompletion = completions.find(c => c.habitId === habit.id && c.date === today);
      if (todayCompletion) {
        stats.completed += 1;
      }
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => {
      const categoryInfo = HABIT_CATEGORIES.find(c => c.value === category);
      return {
        category,
        categoryInfo,
        ...stats,
        avgStreak: stats.total > 0 ? stats.totalStreak / stats.total : 0,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      };
    });
  };

  const weeklyProgress = getWeeklyProgress();
  const monthlyProgress = getMonthlyProgress();
  const categoryStats = getCategoryStats();
  const totalStreaks = habits.reduce((sum, habit) => sum + getStreak(habit.id), 0);
  const avgStreak = habits.length > 0 ? totalStreaks / habits.length : 0;

  const bestHabit = habits.length > 0 
    ? habits.reduce((best, habit) => 
        getStreak(habit.id) > getStreak(best.id) ? habit : best
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Monthly Progress</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{Math.round(monthlyProgress)}%</div>
            <Progress value={monthlyProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Average Streak</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{avgStreak.toFixed(1)}</div>
            <p className="text-xs text-green-700 mt-1">days on average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Best Performer</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-900 truncate">
              {bestHabit ? bestHabit.name : 'N/A'}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              {bestHabit ? `${getStreak(bestHabit.id)} day streak` : 'No habits yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Completions</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{completions.length}</div>
            <p className="text-xs text-orange-700 mt-1">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyProgress.map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('default', { weekday: 'short' });
              const dateNum = date.getDate();
              
              return (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-gray-600">
                    {dayName} {dateNum}
                  </div>
                  <div className="flex-1">
                    <Progress value={day.rate} className="h-3" />
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-right">
                    {Math.round(day.rate)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map(stat => (
                <div key={stat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {stat.categoryInfo?.emoji} {stat.categoryInfo?.label}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {stat.completed}/{stat.total} today
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Avg streak: {stat.avgStreak.toFixed(1)}</span>
                      <span>{Math.round(stat.completionRate)}%</span>
                    </div>
                  </div>
                  <Progress value={stat.completionRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressInsights;
