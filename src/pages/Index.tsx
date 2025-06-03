
import React, { useState } from 'react';
import { Calendar, Plus, Target, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HabitCard from '@/components/HabitCard';
import AddHabitDialog from '@/components/AddHabitDialog';
import MonthlyView from '@/components/MonthlyView';
import ProgressInsights from '@/components/ProgressInsights';
import AchievementBadges from '@/components/AchievementBadges';
import UserMenu from '@/components/UserMenu';
import { useHabits } from '@/hooks/useHabits';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  const { habits, completions, addHabit, toggleHabitCompletion, getStreak } = useHabits();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getTodayCompletions = () => {
    const today = new Date().toISOString().split('T')[0];
    return completions.filter(c => c.date === today);
  };

  const todayCompletions = getTodayCompletions();
  const completionRate = habits.length > 0 ? (todayCompletions.length / habits.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Habit Tracker</h1>
            <p className="text-gray-600">Build better habits, one day at a time</p>
            {user && (
              <p className="text-sm text-gray-500 mt-1">Welcome back, {user.email}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
            <UserMenu />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Today's Progress</CardTitle>
              <Target className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{Math.round(completionRate)}%</div>
              <p className="text-xs text-green-700 mt-1">
                {todayCompletions.length} of {habits.length} habits completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Active Habits</CardTitle>
              <Calendar className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{habits.length}</div>
              <p className="text-xs text-orange-700 mt-1">Habits being tracked</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Best Streak</CardTitle>
              <Trophy className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.id)), 0) : 0}
              </div>
              <p className="text-xs text-purple-700 mt-1">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-lg">
            <TabsTrigger value="today" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Today
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Monthly View
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Insights
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <div className="grid gap-4">
              {habits.length === 0 ? (
                <Card className="p-12 text-center bg-white shadow-lg">
                  <div className="text-gray-400 mb-4">
                    <Target className="w-16 h-16 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No habits yet</h3>
                  <p className="text-gray-500 mb-6">Start building better habits today!</p>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Habit
                  </Button>
                </Card>
              ) : (
                habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={todayCompletions.some(c => c.habitId === habit.id)}
                    streak={getStreak(habit.id)}
                    onToggle={() => toggleHabitCompletion(habit.id, new Date())}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <MonthlyView 
              habits={habits}
              completions={completions}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onToggleCompletion={toggleHabitCompletion}
            />
          </TabsContent>

          <TabsContent value="insights">
            <ProgressInsights 
              habits={habits}
              completions={completions}
              getStreak={getStreak}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementBadges 
              habits={habits}
              completions={completions}
              getStreak={getStreak}
            />
          </TabsContent>
        </Tabs>

        <AddHabitDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={addHabit}
        />
      </div>
    </div>
  );
};

export default Index;
