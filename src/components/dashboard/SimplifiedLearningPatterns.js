import React from 'react';

const SimplifiedLearningPatterns = ({ learningPatterns, className = '' }) => {
  if (!learningPatterns) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Learning Patterns</h3>
        <div className="animate-pulse">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'decreasing': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'stable': return '➡️';
      case 'decreasing': return '📉';
      default: return '📊';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Learning Patterns</h3>
      
      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{learningPatterns.totalSessions || 0}</div>
          <div className="text-sm text-blue-700">Total Sessions</div>
          <div className="text-xs text-blue-600 mt-1">{learningPatterns.timeframe}</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-2xl font-bold text-green-600">
              {learningPatterns.learningVelocity?.rate || 0}
            </span>
            <span className={`text-lg ${getTrendColor(learningPatterns.learningVelocity?.trend)}`}>
              {getTrendIcon(learningPatterns.learningVelocity?.trend)}
            </span>
          </div>
          <div className="text-sm text-green-700">Sessions/Week</div>
          <div className="text-xs text-green-600 mt-1 capitalize">
            {learningPatterns.learningVelocity?.trend || 'stable'}
          </div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {learningPatterns.communicationGrowth?.totalSessions || 0}
          </div>
          <div className="text-sm text-purple-700">Communication Practice</div>
          <div className="text-xs text-purple-600 mt-1">
            Avg Score: {Math.round((learningPatterns.communicationGrowth?.averageScore || 0) * 100) / 100}
          </div>
        </div>
      </div>

      {/* Learning Growth Indicator */}
      {learningPatterns.communicationGrowth && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Communication Growth</h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Growth Progress</span>
                <span className="capitalize font-medium">
                  {learningPatterns.communicationGrowth.growth}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    learningPatterns.communicationGrowth.growth === 'excellent' ? 'bg-green-500' :
                    learningPatterns.communicationGrowth.growth === 'good' ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}
                  style={{ 
                    width: `${
                      learningPatterns.communicationGrowth.growth === 'excellent' ? 100 :
                      learningPatterns.communicationGrowth.growth === 'good' ? 75 :
                      50
                    }%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-lg font-bold text-gray-800">
                {Math.round((learningPatterns.communicationGrowth.averageScore || 0) * 100) / 100}/5
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {learningPatterns.recommendations?.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Personalized Recommendations</h4>
          <div className="space-y-3">
            {learningPatterns.recommendations.map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                rec.priority === 'high' ? 'bg-red-50 border-red-400' :
                rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-medium ${
                        rec.priority === 'high' ? 'text-red-800' :
                        rec.priority === 'medium' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {rec.title}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      rec.priority === 'high' ? 'text-red-700' :
                      rec.priority === 'medium' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {rec.description}
                    </p>
                  </div>
                  <div className="text-2xl ml-3">
                    {rec.type === 'engagement' ? '🎯' :
                     rec.type === 'improvement' ? '📈' :
                     rec.type === 'communication' ? '🗣️' : '💡'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!learningPatterns.recommendations || learningPatterns.recommendations.length === 0) && 
       learningPatterns.totalSessions === 0 && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-3 block">📚</span>
          <h4 className="font-medium text-gray-700 mb-2">Start Your Learning Journey</h4>
          <p className="text-sm">
            Complete a few learning activities to see personalized insights and recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

export default SimplifiedLearningPatterns;
