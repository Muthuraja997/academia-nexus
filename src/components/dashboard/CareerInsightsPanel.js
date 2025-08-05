import React, { useState } from 'react';
import { useCareerRecommendations } from '../../hooks/useDashboardAnalytics';

const CareerInsightsPanel = ({ careerInsights, className = '' }) => {
  const recommendations = useCareerRecommendations(careerInsights);
  const [activeTab, setActiveTab] = useState('alignment');

  if (!recommendations) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const { alignment, skillGaps, industries, nextSteps, marketTrends } = recommendations;

  const getAlignmentColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 55) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const tabs = [
    { id: 'alignment', label: 'Career Fit', icon: '🎯' },
    { id: 'gaps', label: 'Skill Gaps', icon: '📈' },
    { id: 'industries', label: 'Industries', icon: '🏢' },
    { id: 'steps', label: 'Next Steps', icon: '🚀' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Career Insights</h2>
        {marketTrends && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            marketTrends.outlook === 'positive' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
          }`}>
            Market: {marketTrends.outlook}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'alignment' && alignment && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${getAlignmentColor(alignment.score)}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Career Alignment Score</h3>
                <div className="text-2xl font-bold">{alignment.score}%</div>
              </div>
              <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                <div 
                  className="bg-current h-2 rounded-full transition-all duration-300"
                  style={{ width: `${alignment.score}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Alignment Factors</h4>
              {alignment.factors?.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">{factor.factor}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{factor.score}%</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Skill Development Opportunities</h3>
            {skillGaps.length > 0 ? (
              <div className="space-y-3">
                {skillGaps.map((gap, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{gap.skill}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          gap.importance === 'high' ? 'bg-red-100 text-red-800' :
                          gap.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {gap.importance} priority
                        </span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Current: {gap.currentLevel}</span>
                        <span>Target: {gap.requiredLevel}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${
                              gap.currentLevel === 'expert' ? 100 :
                              gap.currentLevel === 'advanced' ? 75 :
                              gap.currentLevel === 'intermediate' ? 50 :
                              gap.currentLevel === 'beginner' ? 25 : 0
                            }%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{gap.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">🎉</span>
                <p>Great job! No major skill gaps identified.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'industries' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Recommended Industries</h3>
            {industries.length > 0 ? (
              <div className="space-y-4">
                {industries.map((industry, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{industry.industry}</h4>
                      <div className="text-2xl font-bold text-green-600">{industry.match}%</div>
                    </div>
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {industry.roles?.map((role, roleIndex) => (
                          <span key={roleIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{industry.outlook}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">🔍</span>
                <p>Analyzing industry matches based on your profile...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Your Career Roadmap</h3>
            {nextSteps.length > 0 ? (
              <div className="space-y-4">
                {nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{step.action}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {step.timeframe}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">🗺️</span>
                <p>Building your personalized career roadmap...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Market Trends Footer */}
      {marketTrends && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Market Insights</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Demand:</span>
              <span className="ml-2 font-medium capitalize">{marketTrends.demandLevel}</span>
            </div>
            <div>
              <span className="text-gray-600">Salary Trend:</span>
              <span className="ml-2 font-medium capitalize">{marketTrends.salaryTrend}</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-gray-600">Outlook:</span>
              <span className="ml-2 font-medium capitalize">{marketTrends.outlook}</span>
            </div>
          </div>
          {marketTrends.keyTrends && (
            <div className="mt-3">
              <span className="text-gray-600 text-sm">Key Trends:</span>
              <ul className="mt-1 text-sm text-gray-700">
                {marketTrends.keyTrends.map((trend, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerInsightsPanel;
