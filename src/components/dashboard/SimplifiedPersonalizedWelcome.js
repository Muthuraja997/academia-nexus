import React from 'react';

const SimplifiedPersonalizedWelcome = ({ insights, className = '' }) => {
  if (!insights) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const { personalizedGreeting, learningMomentum, streakInfo } = insights;

  const getMomentumColor = (level) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {personalizedGreeting?.greeting || 'Welcome back!'}
        </h1>
        <p className="text-gray-600 text-lg">
          {personalizedGreeting?.motivationalMessage || 'Ready to continue your learning journey?'}
        </p>
      </div>

      {/* Learning Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Learning Momentum */}
        {learningMomentum && (
          <div className={`p-4 rounded-lg border ${getMomentumColor(learningMomentum.level)}`}>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">{getMomentumIcon(learningMomentum.level)}</span>
              <h3 className="font-semibold capitalize">
                {learningMomentum.level} Momentum
              </h3>
            </div>
            <p className="text-sm mb-3">{learningMomentum.description}</p>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium">Activities</div>
                <div className="text-lg font-bold">{learningMomentum.metrics?.totalActivities || 0}</div>
              </div>
              <div>
                <div className="font-medium">Avg Score</div>
                <div className="text-lg font-bold">{learningMomentum.metrics?.averageScore || 0}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Study Streak */}
        {streakInfo && (
          <div className="p-4 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">🔥</span>
              <h3 className="font-semibold">Study Streak</h3>
            </div>
            <p className="text-sm mb-3">{streakInfo.encouragement}</p>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium">Current</div>
                <div className="text-lg font-bold">{streakInfo.current} days</div>
              </div>
              <div>
                <div className="font-medium">Best</div>
                <div className="text-lg font-bold">{streakInfo.longest} days</div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Progress */}
        {learningMomentum?.metrics && (
          <div className="p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">📊</span>
              <h3 className="font-semibold">Weekly Progress</h3>
            </div>
            <p className="text-sm mb-3">
              {learningMomentum.metrics.consistentDays}/{learningMomentum.metrics.weeklyGoal} days this week
            </p>
            
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (learningMomentum.metrics.consistentDays / learningMomentum.metrics.weeklyGoal) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Highlights */}
      {insights.performanceHighlights?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Highlights</h3>
          <div className="space-y-2">
            {insights.performanceHighlights.map((highlight, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-2xl">{highlight.icon}</span>
                <div>
                  <div className="font-medium text-yellow-800">{highlight.title}</div>
                  <div className="text-sm text-yellow-700">{highlight.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Goals */}
      {insights.weeklyGoals?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">This Week's Goals</h3>
          <div className="space-y-3">
            {insights.weeklyGoals.map((goal, index) => (
              <div key={index} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-indigo-800">{goal.title}</div>
                  <div className="text-sm text-indigo-600">
                    {goal.progress}/{goal.target}
                  </div>
                </div>
                <div className="text-sm text-indigo-700 mb-2">{goal.description}</div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Insight */}
      {insights.motivationalInsight && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Daily Inspiration</h4>
              <p className="text-sm text-gray-700 italic">"{insights.motivationalInsight}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplifiedPersonalizedWelcome;
