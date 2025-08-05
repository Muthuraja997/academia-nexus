import { useState, useEffect, useCallback } from 'react';
import { SERVER_CONFIG } from '../config';

export const useDashboardAnalytics = (userId) => {
  const [insights, setInsights] = useState(null);
  const [learningPatterns, setLearningPatterns] = useState(null);
  const [careerInsights, setCareerInsights] = useState(null);
  const [skillProgression, setSkillProgression] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (endpoint, setter) => {
    try {
      const response = await fetch(`${SERVER_CONFIG.ANALYTICS_API_BASE}${endpoint}`);
      const data = await response.json();
      
      if (data.success) {
        setter(data.data);
      } else {
        console.error(`Analytics API error for ${endpoint}:`, data.error);
        setError(data.error);
      }
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err);
      setError(err.message);
    }
  }, []);

  const loadDashboardInsights = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      await fetchAnalytics(`/insights/${userId}`, setInsights);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchAnalytics]);

  const loadLearningPatterns = useCallback(async (timeRange = 'month') => {
    if (!userId) return;
    
    try {
      await fetchAnalytics(`/learning-patterns/${userId}?timeRange=${timeRange}`, setLearningPatterns);
    } catch (err) {
      setError(err.message);
    }
  }, [userId, fetchAnalytics]);

  const loadCareerInsights = useCallback(async () => {
    if (!userId) return;
    
    try {
      await fetchAnalytics(`/career-insights/${userId}`, setCareerInsights);
    } catch (err) {
      setError(err.message);
    }
  }, [userId, fetchAnalytics]);

  const loadSkillProgression = useCallback(async () => {
    if (!userId) return;
    
    try {
      await fetchAnalytics(`/skill-progression/${userId}`, setSkillProgression);
    } catch (err) {
      setError(err.message);
    }
  }, [userId, fetchAnalytics]);

  const loadAchievements = useCallback(async () => {
    if (!userId) return;
    
    try {
      await fetchAnalytics(`/achievements/${userId}`, setAchievements);
    } catch (err) {
      setError(err.message);
    }
  }, [userId, fetchAnalytics]);

  const loadCompleteAnalysis = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${ANALYTICS_API_BASE}/complete-analysis/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        const analysis = data.data;
        setInsights(analysis.dashboardInsights);
        setLearningPatterns(analysis.learningPatterns);
        setCareerInsights(analysis.careerInsights);
        setSkillProgression(analysis.skillProgression);
        setAchievements(analysis.achievements);
        
        if (analysis.errors && analysis.errors.length > 0) {
          console.warn('Some analytics failed to load:', analysis.errors);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to load complete analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshAllData = useCallback(async () => {
    await loadCompleteAnalysis();
  }, [loadCompleteAnalysis]);

  // Auto-load insights when userId changes
  useEffect(() => {
    if (userId) {
      loadDashboardInsights();
    }
  }, [userId, loadDashboardInsights]);

  return {
    // Data
    insights,
    learningPatterns,
    careerInsights,
    skillProgression,
    achievements,
    
    // Status
    loading,
    error,
    
    // Actions
    loadDashboardInsights,
    loadLearningPatterns,
    loadCareerInsights,
    loadSkillProgression,
    loadAchievements,
    loadCompleteAnalysis,
    refreshAllData,
    
    // Computed properties
    hasData: !!(insights || learningPatterns || careerInsights || skillProgression || achievements),
    isAnalyticsAvailable: navigator.onLine && userId
  };
};

export const usePersonalizedGreeting = (insights) => {
  return insights?.personalizedGreeting || {
    greeting: 'Welcome back!',
    motivationalMessage: 'Ready to continue your learning journey?'
  };
};

export const useLearningMomentum = (insights) => {
  return insights?.learningMomentum || {
    level: 'stable',
    description: 'Getting started with your learning journey.',
    metrics: {
      totalActivities: 0,
      averageScore: 0,
      consistentDays: 0,
      weeklyGoal: 7
    }
  };
};

export const useWeeklyGoals = (insights) => {
  return insights?.weeklyGoals || [];
};

export const useStreakInfo = (insights) => {
  return insights?.streakInfo || {
    current: 0,
    longest: 0,
    encouragement: 'Start your learning streak today!'
  };
};

export const useFocusAreas = (insights) => {
  return insights?.focusAreas || [];
};

export const useSkillInsights = (skillProgression) => {
  if (!skillProgression) return null;
  
  const { skills = [], overallTrend = 'stable', recommendations = [] } = skillProgression;
  
  const topSkills = skills.slice(0, 5);
  const improvingSkills = skills.filter(skill => skill.trend === 'improving');
  const needsAttentionSkills = skills.filter(skill => skill.trend === 'declining');
  
  return {
    topSkills,
    improvingSkills,
    needsAttentionSkills,
    overallTrend,
    recommendations,
    totalSkills: skills.length
  };
};

export const useCareerRecommendations = (careerInsights) => {
  if (!careerInsights) return null;
  
  return {
    alignment: careerInsights.careerAlignment,
    skillGaps: careerInsights.skillGaps || [],
    industries: careerInsights.industryRecommendations || [],
    nextSteps: careerInsights.nextCareerSteps || [],
    marketTrends: careerInsights.marketTrends
  };
};

export const useAchievementStatus = (achievements) => {
  if (!achievements) return null;
  
  const { earned = [], available = [], totalPoints = 0 } = achievements;
  
  return {
    earned,
    available,
    totalPoints,
    recentAchievements: earned.slice(-3),
    nextAchievements: available.slice(0, 3),
    completionRate: earned.length / (earned.length + available.length) * 100 || 0
  };
};

export default useDashboardAnalytics;
