'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { LineChart, BarChart, PieChart, ProgressRing } from '@/components/common/Charts';
import Link from 'next/link';
import PersonalizedWelcome from '@/components/dashboard/SimplifiedPersonalizedWelcome';
import SimplifiedLearningPatterns from '@/components/dashboard/SimplifiedLearningPatterns';

const ANALYTICS_API_BASE = 'http://localhost:8082/api/dashboard';

export const useSimplifiedDashboardAnalytics = (userId) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${ANALYTICS_API_BASE}/insights/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error('Error fetching dashboard insights:', err);
      setError(err.message);
      // Provide fallback data
      setInsights({
        personalizedGreeting: `Welcome back! Ready to continue your learning journey?`,
        learningMomentum: {
          currentStreak: 0,
          weeklyProgress: 0,
          recommendedNextAction: "Start your first study session to build momentum!"
        },
        smartRecommendations: [
          "Complete your profile to get personalized recommendations",
          "Try the communication practice module",
          "Explore available scholarships"
        ],
        learningPatterns: {
          preferredStudyTime: "Not enough data",
          strongestSubject: "To be determined",
          improvementAreas: ["Complete assessments to identify areas"]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { insights, loading, error, refetch: fetchInsights };
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { updateData } = useData();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use the analytics hook
  const { insights, loading: insightsLoading, error: insightsError } = useSimplifiedDashboardAnalytics(user?.id);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/dashboard?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
        updateData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        // Provide fallback data
        setDashboardData({
          recentActivities: [],
          communicationSessions: [],
          careerAssessments: [],
          scholarshipApplications: [],
          studySessions: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user, updateData]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <Link href="/auth/login">
            <Button variant="primary">Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (loading || insightsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-gray-600">Here's your personalized learning dashboard</p>
        </div>

        {/* Error Display */}
        {(error || insightsError) && (
          <Card className="mb-6 p-4 border-l-4 border-orange-500 bg-orange-50">
            <h3 className="text-orange-800 font-semibold mb-2">Notice</h3>
            <p className="text-orange-700">
              Some features may not be fully available. We're showing you available data with fallback information.
            </p>
          </Card>
        )}

        {/* Personalized Welcome Section */}
        <div className="mb-8">
          <PersonalizedWelcome insights={insights} user={user} />
        </div>

        {/* Learning Patterns Section */}
        <div className="mb-8">
          <SimplifiedLearningPatterns insights={insights} dashboardData={dashboardData} />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/study">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Study Session</h3>
                  <p className="text-gray-600 text-sm">Continue learning</p>
                </div>
                <div className="text-blue-500 text-2xl">📚</div>
              </div>
            </Card>
          </Link>

          <Link href="/interview-prep">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Interview Prep</h3>
                  <p className="text-gray-600 text-sm">Practice interviews</p>
                </div>
                <div className="text-green-500 text-2xl">🎯</div>
              </div>
            </Card>
          </Link>

          <Link href="/communication-practice">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Communication</h3>
                  <p className="text-gray-600 text-sm">Improve skills</p>
                </div>
                <div className="text-purple-500 text-2xl">💬</div>
              </div>
            </Card>
          </Link>

          <Link href="/scholarships">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Scholarships</h3>
                  <p className="text-gray-600 text-sm">Find opportunities</p>
                </div>
                <div className="text-orange-500 text-2xl">🎓</div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {dashboardData?.recentActivities?.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.activity_type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs text-blue-500">
                    {activity.duration_minutes || 0}min
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No recent activities</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Study Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Weekly Goal</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="text-yellow-500 text-xl">🏆</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">First Study Session</p>
                  <p className="text-xs text-gray-500">Completed your first session</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-blue-500 text-xl">📈</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Progress Tracker</p>
                  <p className="text-xs text-gray-500">Keep up the good work!</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">
              {dashboardData?.studySessions?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Study Sessions</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {dashboardData?.communicationSessions?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Practice Sessions</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500 mb-1">
              {dashboardData?.careerAssessments?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Assessments</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500 mb-1">
              {dashboardData?.scholarshipApplications?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Applications</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
