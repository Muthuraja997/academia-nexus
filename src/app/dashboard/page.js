'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { LineChart, BarChart, PieChart, ProgressRing } from '@/components/common/Charts';
import Link from 'next/link';

const DashboardPage = () => {
    const { user } = useAuth();
    const {
        activities,
        testResults,
        communicationSessions,
        achievements,
        userStats,
        careerInsights,
        loading,
        trackPageVisit,
        fetchLatestData
    } = useData();

    const [pageStartTime] = useState(Date.now());

    useEffect(() => {
        if (user) {
            // Track page visit
            trackPageVisit('dashboard', 0);
            
            // Track page duration on unmount
            return () => {
                const duration = Math.round((Date.now() - pageStartTime) / 1000);
                trackPageVisit('dashboard', duration);
            };
        }
    }, [user, pageStartTime]); // Removed trackPageVisit from dependencies

    const generateChartData = () => {
        // Activity trend over last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        const activityTrend = last7Days.map(date => {
            const dayActivities = activities.filter(a => 
                a.created_at && a.created_at.startsWith(date)
            );
            return {
                label: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
                value: dayActivities.length
            };
        });

        // Activity type distribution
        const activityTypes = {};
        activities.forEach(activity => {
            const type = activity.activity_type || 'Unknown';
            activityTypes[type] = (activityTypes[type] || 0) + 1;
        });

        const activityDistribution = Object.entries(activityTypes).map(([type, count]) => ({
            label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: count
        }));

        // Performance over time
        const performanceData = testResults.slice(0, 10).reverse().map((test, index) => ({
            label: `Test ${index + 1}`,
            value: test.score_percentage || 0
        }));

        // Skills practice frequency
        const skillsData = [
            { label: 'Communication', value: communicationSessions.length },
            { label: 'Technical', value: testResults.filter(t => t.test_title?.toLowerCase().includes('technical')).length },
            { label: 'Interview', value: testResults.filter(t => t.test_title?.toLowerCase().includes('interview')).length },
            { label: 'General', value: activities.filter(a => a.activity_type === 'page_visit').length }
        ].filter(item => item.value > 0);

        return {
            activityTrend,
            activityDistribution,
            performanceData,
            skillsData
        };
    };

    const getEngagementColor = (level) => {
        switch (level) {
            case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'improving': return '📈';
            case 'declining': return '📉';
            default: return '➡️';
        }
    };

    const calculateOverallProgress = () => {
        const totalActivities = activities.length;
        const testScore = testResults.length > 0 ? 
            testResults.reduce((sum, test) => sum + (test.score_percentage || 0), 0) / testResults.length : 0;
        const achievementScore = achievements.length * 5; // 5 points per achievement
        
        return Math.min(100, (totalActivities * 2) + (testScore * 0.3) + achievementScore);
    };

    if (loading && !activities.length) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const chartData = generateChartData();
    const overallProgress = calculateOverallProgress();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        Welcome Back, {user?.full_name || user?.username}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Here's your learning journey overview
                    </p>
                </div>
                <Button onClick={fetchLatestData} variant="outline" size="sm">
                    🔄 Refresh Data
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        {activities.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Activities</div>
                    <div className="text-xs text-green-600 mt-1">
                        +{activities.filter(a => {
                            const today = new Date().toISOString().split('T')[0];
                            return a.created_at?.startsWith(today);
                        }).length} today
                    </div>
                </Card>

                <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                        {testResults.length > 0 ? 
                            Math.round(testResults.reduce((sum, test) => sum + (test.score_percentage || 0), 0) / testResults.length) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Test Score</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {testResults.length} tests completed
                    </div>
                </Card>

                <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                        {userStats.learningStreak?.current || 0}
                    </div>
                    <div className="text-sm text-gray-600">Day Streak 🔥</div>
                    <div className="text-xs text-gray-500 mt-1">
                        Best: {userStats.learningStreak?.longest || 0} days
                    </div>
                </Card>

                <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                        {achievements.length}
                    </div>
                    <div className="text-sm text-gray-600">Achievements 🏆</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {userStats.total_points || 0} total points
                    </div>
                </Card>
            </div>

            {/* Progress and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Progress */}
                <Card className="p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Overall Progress
                    </h3>
                    <ProgressRing 
                        percentage={overallProgress}
                        title="Completion Level"
                        color="#3B82F6"
                    />
                    <div className="mt-4 text-sm text-gray-600">
                        Keep going! You're doing great 🚀
                    </div>
                </Card>

                {/* Activity Trend */}
                <div className="lg:col-span-2">
                    {chartData.activityTrend.length > 0 && (
                        <LineChart
                            data={chartData.activityTrend}
                            title="7-Day Activity Trend"
                            color="#10B981"
                        />
                    )}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chartData.activityDistribution.length > 0 && (
                    <PieChart
                        data={chartData.activityDistribution}
                        title="Activity Types Distribution"
                    />
                )}

                {chartData.performanceData.length > 0 && (
                    <BarChart
                        data={chartData.performanceData}
                        title="Recent Test Performance"
                        color="#8B5CF6"
                    />
                )}
            </div>

            {/* Career Insights */}
            {careerInsights && (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        🎯 AI Career Insights
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {careerInsights.careerDirections?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Recommended Career Paths
                                </h3>
                                <div className="space-y-2">
                                    {careerInsights.careerDirections.slice(0, 3).map((direction, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{direction.direction}</p>
                                                <p className="text-xs text-gray-500">
                                                    {direction.examples?.slice(0, 2).join(', ')}
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">
                                                {Math.round(direction.confidence)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {careerInsights.strengths?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Your Top Strengths
                                </h3>
                                <div className="space-y-2">
                                    {careerInsights.strengths.slice(0, 4).map((strength, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900 rounded">
                                            <span className="text-sm font-medium">{strength.skill}</span>
                                            <span className="text-xs text-green-600 font-bold">
                                                {strength.score}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Link href="/career-path">
                            <Button size="sm">View Full Career Analysis →</Button>
                        </Link>
                    </div>
                </Card>
            )}

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        📋 Recent Activities
                    </h2>
                    {activities.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {activities.slice(0, 10).map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm capitalize">
                                            {activity.activity_type?.replace('_', ' ') || 'Activity'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recently'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {activity.score && (
                                            <span className="text-sm font-bold text-blue-600">
                                                {activity.score}%
                                            </span>
                                        )}
                                        {activity.session_duration && (
                                            <p className="text-xs text-gray-500">
                                                {Math.round(activity.session_duration / 60)}min
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No activities yet. Start practicing to see your progress!
                        </p>
                    )}
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        🏆 Recent Achievements
                    </h2>
                    {achievements.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {achievements.slice(0, 8).map((achievement, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                                    <span className="text-2xl">{achievement.badge_icon || '🏆'}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{achievement.achievement_name}</p>
                                        <p className="text-xs text-gray-500">
                                            +{achievement.points_earned} points
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {achievement.earned_at ? new Date(achievement.earned_at).toLocaleDateString() : 'Recent'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            Complete activities to earn achievements!
                        </p>
                    )}
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🚀 Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Link href="/communication-practice">
                        <Button className="w-full">
                            Practice Communication
                        </Button>
                    </Link>
                    <Link href="/tests">
                        <Button variant="secondary" className="w-full">
                            Take a Test
                        </Button>
                    </Link>
                    <Link href="/interview-prep">
                        <Button variant="secondary" className="w-full">
                            Interview Prep
                        </Button>
                    </Link>
                    <Link href="/career-path">
                        <Button variant="outline" className="w-full">
                            Career Analysis
                        </Button>
                    </Link>
                    <Link href="/scholarships">
                        <Button variant="outline" className="w-full">
                            Find Scholarships
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default DashboardPage;
