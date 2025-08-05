import React, { useState } from 'react';
import { useSkillInsights } from '../../hooks/useDashboardAnalytics';

const SkillProgressionPanel = ({ skillProgression, className = '' }) => {
  const skillInsights = useSkillInsights(skillProgression);
  const [selectedSkill, setSelectedSkill] = useState(null);

  if (!skillInsights) {
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

  const { topSkills, improvingSkills, needsAttentionSkills, overallTrend, recommendations } = skillInsights;

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Skill Progression</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(overallTrend)}`}>
          Overall: {overallTrend}
        </div>
      </div>

      {/* Top Skills */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Top Skills</h3>
        <div className="space-y-3">
          {topSkills.map((skill, index) => (
            <div 
              key={skill.skill}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedSkill(selectedSkill === skill.skill ? null : skill.skill)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTrendIcon(skill.trend)}</span>
                  <span className="font-medium">{skill.skill}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.currentLevel)}`}>
                  {skill.currentLevel}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{skill.totalPractice} sessions</div>
                <div className={`text-sm font-medium ${getTrendColor(skill.trend).split(' ')[0]}`}>
                  {skill.trend}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
          <h4 className="font-semibold text-blue-900 mb-2">{selectedSkill} Progression</h4>
          {topSkills.find(s => s.skill === selectedSkill)?.progression?.slice(-5).map((point, index) => (
            <div key={index} className="flex justify-between text-sm text-blue-800">
              <span>{point.month}</span>
              <span>{point.avgScore}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{improvingSkills.length}</div>
          <div className="text-sm text-green-700">Improving</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{topSkills.length}</div>
          <div className="text-sm text-blue-700">Active Skills</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{needsAttentionSkills.length}</div>
          <div className="text-sm text-orange-700">Need Focus</div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommendations</h3>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-yellow-800">{rec.title}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillProgressionPanel;
