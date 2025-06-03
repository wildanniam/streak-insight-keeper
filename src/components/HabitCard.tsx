
import React from 'react';
import { Check, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Habit, HABIT_CATEGORIES } from '@/types/habit';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  streak: number;
  onToggle: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompleted, streak, onToggle }) => {
  const category = HABIT_CATEGORIES.find(c => c.value === habit.category);

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${isCompleted ? 'ring-2 ring-green-500 bg-green-50' : 'bg-white hover:shadow-xl'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: habit.color }}
              />
              <h3 className={`text-lg font-semibold ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                {habit.name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {category?.emoji} {category?.label}
              </Badge>
            </div>
            
            {habit.description && (
              <p className={`text-sm mb-3 ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                {habit.description}
              </p>
            )}
            
            {streak > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">{streak} day streak</span>
              </div>
            )}
          </div>
          
          <Button
            onClick={onToggle}
            variant={isCompleted ? "default" : "outline"}
            size="lg"
            className={`ml-4 transition-all duration-200 ${
              isCompleted 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                : 'hover:bg-gray-50 border-2 hover:border-gray-300'
            }`}
          >
            <Check className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;
