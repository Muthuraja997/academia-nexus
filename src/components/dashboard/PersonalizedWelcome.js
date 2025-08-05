import React from 'react';
import { usePersonalizedGreeting, useLearningMomentum, useStreakInfo } from '../../hooks/useDashboardAnalytics';

const PersonalizedWelcome = ({ insights, className = '' }) => {
  const greeting = usePersonalizedGreeting(insights);
  const momentum = useLearningMomentum(insights);
  const streak = useStreakInfo(insights);

  const getMomentumColor = (level) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMomentumIcon = (level) => {
    switch (level) {
      case 'high': return '🚀';
      case 'moderate': return '📈';
      case 'low': return '🌱';
      default: return '📚';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Personalized Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {greeting.greeting}
        </h1>
        <p className="text-gray-600 text-lg">
          {greeting.motivationalMessage}
        </p>
      </div>

      {/* Learning Momentum */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${getMomentumColor(momentum.level)}`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getMomentumIcon(momentum.level)}</span>
              <h3 className="font-semibold capitalize">
                {momentum.level} Momentum
              </h3>
            </div>
            <p className="text-sm mb-3">{momentum.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Activities</div>
                <div className="text-lg font-bold">{momentum.metrics.totalActivities}</div>
              </div>
              <div>
                <div className="font-medium">Avg Score</div>
                <div className="text-lg font-bold">{momentum.metrics.averageScore}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-purple-50 text-purple-800">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🔥</span>
              <h3 className="font-semibold">Study Streak</h3>
            </div>
            <p className="text-sm mb-3">{streak.encouragement}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Current</div>
                <div className="text-lg font-bold">{streak.current} days</div>
              </div>
              <div>
                <div className="font-medium">Best</div>
                <div className="text-lg font-bold">{streak.longest} days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Weekly Goal Progress</span>
          <span className="text-sm text-gray-500">
            {momentum.metrics.consistentDays}/{momentum.metrics.weeklyGoal} days
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (momentum.metrics.consistentDays / momentum.metrics.weeklyGoal) * 100)}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedWelcome;
