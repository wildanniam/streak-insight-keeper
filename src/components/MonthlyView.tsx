
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Habit, HabitCompletion, HABIT_CATEGORIES } from '@/types/habit';

interface MonthlyViewProps {
  habits: Habit[];
  completions: HabitCompletion[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onToggleCompletion: (habitId: string, date: Date) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({
  habits,
  completions,
  selectedDate,
  onDateSelect,
  onToggleCompletion,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getCompletionsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return completions.filter(c => c.date === dateString);
  };

  const getCompletionRate = (date: Date) => {
    const dayCompletions = getCompletionsForDate(date);
    return habits.length > 0 ? (dayCompletions.length / habits.length) * 100 : 0;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  const selectedDateCompletions = getCompletionsForDate(selectedDate);
  const selectedDateHabits = habits.filter(h => 
    selectedDateCompletions.some(c => c.habitId === h.id)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {monthName}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="aspect-square" />;
                }
                
                const completionRate = getCompletionRate(day);
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onDateSelect(day)}
                    className={`aspect-square p-1 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg'
                        : isToday
                        ? 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="relative z-10">{day.getDate()}</span>
                    
                    {/* Completion indicator */}
                    {completionRate > 0 && !isSelected && (
                      <div 
                        className="absolute inset-0 rounded-lg opacity-30"
                        style={{
                          backgroundColor: completionRate === 100 ? '#10B981' : '#F59E0B',
                        }}
                      />
                    )}
                    
                    {/* Perfect day indicator */}
                    {completionRate === 100 && habits.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Details */}
      <div className="space-y-4">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate.toLocaleDateString('default', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No habits to track</p>
            ) : (
              <div className="space-y-3">
                {habits.map(habit => {
                  const isCompleted = selectedDateCompletions.some(c => c.habitId === habit.id);
                  const category = HABIT_CATEGORIES.find(c => c.value === habit.category);
                  
                  return (
                    <div
                      key={habit.id}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: habit.color }}
                            />
                            <span className={`font-medium text-sm ${
                              isCompleted ? 'text-green-800' : 'text-gray-900'
                            }`}>
                              {habit.name}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {category?.emoji} {category?.label}
                          </Badge>
                        </div>
                        
                        <Button
                          size="sm"
                          variant={isCompleted ? "default" : "outline"}
                          onClick={() => onToggleCompletion(habit.id, selectedDate)}
                          className={isCompleted 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'hover:bg-gray-50'
                          }
                        >
                          {isCompleted ? '✓' : '○'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                <div className="pt-3 border-t">
                  <div className="text-sm text-gray-600">
                    Completion Rate: <span className="font-semibold">
                      {Math.round(getCompletionRate(selectedDate))}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyView;
