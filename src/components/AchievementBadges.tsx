
import React from 'react';
import { Trophy, Star, Flame, Target, Calendar, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Habit, HabitCompletion } from '@/types/habit';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: (habits: Habit[], completions: HabitCompletion[], getStreak: (id: string) => number) => boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface AchievementBadgesProps {
  habits: Habit[];
  completions: HabitCompletion[];
  getStreak: (habitId: string) => number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-habit',
    title: 'Getting Started',
    description: 'Create your first habit',
    icon: <Target className="w-6 h-6" />,
    requirement: (habits) => habits.length >= 1,
    tier: 'bronze',
  },
  {
    id: 'habit-collector',
    title: 'Habit Collector',
    description: 'Create 5 different habits',
    icon: <Star className="w-6 h-6" />,
    requirement: (habits) => habits.length >= 5,
    tier: 'silver',
  },
  {
    id: 'first-streak',
    title: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: <Flame className="w-6 h-6" />,
    requirement: (habits, _, getStreak) => habits.some(h => getStreak(h.id) >= 3),
    tier: 'bronze',
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: <Calendar className="w-6 h-6" />,
    requirement: (habits, _, getStreak) => habits.some(h => getStreak(h.id) >= 7),
    tier: 'silver',
  },
  {
    id: 'month-master',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: <Trophy className="w-6 h-6" />,
    requirement: (habits, _, getStreak) => habits.some(h => getStreak(h.id) >= 30),
    tier: 'gold',
  },
  {
    id: 'perfect-day',
    title: 'Perfect Day',
    description: 'Complete all habits in a single day',
    icon: <Star className="w-6 h-6" />,
    requirement: (habits, completions) => {
      if (habits.length === 0) return false;
      
      // Group completions by date
      const completionsByDate = completions.reduce((acc, completion) => {
        if (!acc[completion.date]) acc[completion.date] = [];
        acc[completion.date].push(completion);
        return acc;
      }, {} as Record<string, HabitCompletion[]>);
      
      // Check if any day has all habits completed
      return Object.values(completionsByDate).some(
        dayCompletions => dayCompletions.length >= habits.length
      );
    },
    tier: 'silver',
  },
  {
    id: 'perfect-week',
    title: 'Perfect Week',
    description: 'Complete all habits for 7 consecutive days',
    icon: <Zap className="w-6 h-6" />,
    requirement: (habits, completions) => {
      if (habits.length === 0) return false;
      
      // Check last 7 days
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];
        
        const dayCompletions = completions.filter(c => c.date === dateString);
        if (dayCompletions.length < habits.length) {
          return false;
        }
      }
      return true;
    },
    tier: 'gold',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Complete 100 total habits',
    icon: <Trophy className="w-6 h-6" />,
    requirement: (_, completions) => completions.length >= 100,
    tier: 'platinum',
  },
];

const TIER_COLORS = {
  bronze: 'from-amber-100 to-yellow-100 border-amber-300 text-amber-800',
  silver: 'from-gray-100 to-slate-100 border-gray-300 text-gray-800',
  gold: 'from-yellow-100 to-amber-100 border-yellow-300 text-yellow-800',
  platinum: 'from-purple-100 to-indigo-100 border-purple-300 text-purple-800',
};

const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  habits,
  completions,
  getStreak,
}) => {
  const unlockedAchievements = ACHIEVEMENTS.filter(achievement =>
    achievement.requirement(habits, completions, getStreak)
  );

  const lockedAchievements = ACHIEVEMENTS.filter(achievement =>
    !achievement.requirement(habits, completions, getStreak)
  );

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Trophy className="w-6 h-6" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-purple-900">
            <span className="text-3xl font-bold">{unlockedAchievements.length}</span>
            <span className="text-lg">of {ACHIEVEMENTS.length} unlocked</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {['bronze', 'silver', 'gold', 'platinum'].map(tier => {
              const tierCount = unlockedAchievements.filter(a => a.tier === tier).length;
              const tierTotal = ACHIEVEMENTS.filter(a => a.tier === tier).length;
              
              return (
                <div key={tier} className="text-center">
                  <div className="text-sm font-medium capitalize text-purple-700">{tier}</div>
                  <div className="text-lg font-bold text-purple-900">{tierCount}/{tierTotal}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Unlocked Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map(achievement => (
              <Card
                key={achievement.id}
                className={`bg-gradient-to-br ${TIER_COLORS[achievement.tier]} shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white bg-opacity-50">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{achievement.title}</h4>
                      <p className="text-sm opacity-80">{achievement.description}</p>
                      <Badge 
                        variant="secondary" 
                        className="mt-2 capitalize bg-white bg-opacity-20"
                      >
                        {achievement.tier}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-500" />
            Available Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map(achievement => (
              <Card
                key={achievement.id}
                className="bg-gray-50 border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 opacity-75"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-200">
                      <div className="opacity-50">
                        {achievement.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1 text-gray-700">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <Badge 
                        variant="outline" 
                        className="mt-2 capitalize border-gray-300 text-gray-500"
                      >
                        {achievement.tier}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {unlockedAchievements.length === 0 && (
        <Card className="p-12 text-center bg-white shadow-lg">
          <div className="text-gray-400 mb-4">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No achievements yet</h3>
          <p className="text-gray-500 mb-6">Start completing habits to unlock your first achievement!</p>
        </Card>
      )}
    </div>
  );
};

export default AchievementBadges;
