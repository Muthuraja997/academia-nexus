import { requireAuth } from '../../../../lib/auth.js';
import { getDatabase } from '../../../../../database/db.js';

async function handler(request) {
    const db = getDatabase();
    const userId = parseInt(request.userId, 10);

    if (!userId || isNaN(userId)) {
        return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        console.log(`Dashboard API: Processing request for userId: ${userId}`);
        
        // Get comprehensive dashboard data
        const [
            user,
            recentActivities,
            achievements,
            stats,
            preferences,
            activityPatterns,
            skillProgression,
            testResults,
            communicationSessions
        ] = await Promise.all([
            db.getUserById(userId),
            db.getRecentActivities(userId, 10),
            db.getUserAchievements(userId),
            db.getUserStats(userId),
            db.getUserPreferences(userId),
            db.getActivityPatterns?.(userId) || Promise.resolve([]),
            db.getSkillProgression?.(userId) || Promise.resolve([]),
            db.getUserTestResults(userId, 5),
            db.getUserCommunicationSessions(userId, 5)
        ]);

        const { password_hash, ...userProfile } = user;

        // Calculate progress metrics
        const totalActivities = await db.getUserActivityCount(userId);

        // Calculate learning streak
        const learningStreak = await calculateLearningStreak(db, userId);

        // Get weekly activity chart data
        const weeklyActivity = await getWeeklyActivityData(db, userId);

        // Generate career insights
        const careerInsights = generateQuickCareerInsights({
            activityPatterns,
            skillProgression,
            testResults,
            communicationSessions
        });

        // Calculate engagement metrics
        const engagementMetrics = calculateEngagementMetrics(recentActivities, skillProgression);

        const dashboardData = {
            user: userProfile,
            recentActivities,
            achievements,
            stats: {
                ...stats,
                totalActivities,
                learningStreak,
                weeklyActivity
            },
            recentTests: testResults,
            recentCommunicationSessions: communicationSessions,
            preferences,
            careerInsights,
            engagement: engagementMetrics
        };

        return Response.json({
            success: true,
            dashboard: dashboardData
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch dashboard data'
        }, { status: 500 });
    }
}

async function calculateLearningStreak(db, userId) {
    try {
        // Get activities from the last 30 days, grouped by date
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activities = await db.getUserActivitiesSince(userId, thirtyDaysAgo.toISOString());
        
        if (!activities || activities.length === 0) {
            return { current: 0, longest: 0 };
        }

        // Group activities by date
        const activityDates = new Set();
        activities.forEach(activity => {
            const date = new Date(activity.created_at).toDateString();
            activityDates.add(date);
        });

        // Convert to sorted array of dates
        const sortedDates = Array.from(activityDates)
            .map(dateStr => new Date(dateStr))
            .sort((a, b) => b - a); // Most recent first

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if there's activity today or yesterday to start current streak
        const hasRecentActivity = sortedDates.some(date => {
            const dateStr = date.toDateString();
            return dateStr === today.toDateString() || dateStr === yesterday.toDateString();
        });

        if (hasRecentActivity) {
            // Calculate current streak from most recent date backwards
            let checkDate = new Date(today);
            
            for (let i = 0; i < sortedDates.length; i++) {
                const activityDate = sortedDates[i];
                const checkDateStr = checkDate.toDateString();
                const activityDateStr = activityDate.toDateString();
                
                if (checkDateStr === activityDateStr) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        tempStreak = 1;
        longestStreak = 1;
        
        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = sortedDates[i - 1];
            const currDate = sortedDates[i];
            const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        return { current: currentStreak, longest: longestStreak };
    } catch (error) {
        console.error('Learning streak calculation error:', error);
        return { current: 0, longest: 0 };
    }
}

async function getWeeklyActivityData(db, userId) {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const activities = await db.getUserActivitiesSince(userId, sevenDaysAgo.toISOString());
        
        // Initialize data for last 7 days
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            weekData.push({
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                activities: 0
            });
        }

        // Count activities per day
        activities.forEach(activity => {
            const activityDate = new Date(activity.created_at).toISOString().split('T')[0];
            const dayData = weekData.find(day => day.date === activityDate);
            if (dayData) {
                dayData.activities++;
            }
        });

        return weekData;
    } catch (error) {
        console.error('Weekly activity data error:', error);
        return [];
    }
}

// Generate quick career insights for dashboard
function generateQuickCareerInsights({ activityPatterns, skillProgression, testResults, communicationSessions }) {
    const insights = {
        topInterests: [],
        strengths: [],
        improvementAreas: [],
        recommendedActivities: [],
        careerDirections: []
    };

    // Analyze activity patterns for interests
    if (activityPatterns && activityPatterns.length > 0) {
        insights.topInterests = activityPatterns
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 3)
            .map(pattern => ({
                activity: pattern.activity_type,
                frequency: pattern.frequency,
                performance: Math.round(pattern.avg_score || 70)
            }));
    }

    // Identify strengths from high-performing activities
    if (activityPatterns) {
        const strongActivities = activityPatterns.filter(p => (p.avg_score || 0) > 80);
        insights.strengths = strongActivities.slice(0, 3).map(activity => ({
            skill: activity.activity_type,
            score: Math.round(activity.avg_score),
            sessions: activity.frequency
        }));

        // Identify improvement areas from low-performing activities
        const weakActivities = activityPatterns.filter(p => (p.avg_score || 0) < 60);
        insights.improvementAreas = weakActivities.slice(0, 2).map(activity => ({
            skill: activity.activity_type,
            score: Math.round(activity.avg_score),
            suggestion: `Practice more ${activity.activity_type} to improve performance`
        }));

        // Generate recommended activities based on patterns
        if (activityPatterns.length > 0) {
            const leastPracticed = activityPatterns
                .sort((a, b) => a.frequency - b.frequency)
                .slice(0, 2);
            
            insights.recommendedActivities = leastPracticed.map(activity => ({
                type: activity.activity_type,
                reason: 'Limited practice - great opportunity for growth',
                priority: 'medium'
            }));
        }

        // Basic career direction hints
        const techActivities = activityPatterns.filter(p => 
            p.activity_type.toLowerCase().includes('coding') || 
            p.activity_type.toLowerCase().includes('technical') ||
            p.activity_type.toLowerCase().includes('programming')
        );
        
        const communicationActivities = activityPatterns.filter(p => 
            p.activity_type.toLowerCase().includes('communication') || 
            p.activity_type.toLowerCase().includes('presentation')
        );

        if (techActivities.length > 0) {
            insights.careerDirections.push({
                direction: 'Technical Roles',
                confidence: Math.min(90, (techActivities.length / activityPatterns.length) * 100 + 30),
                examples: ['Software Engineer', 'Data Scientist', 'Technical Analyst']
            });
        }

        if (communicationActivities.length > 0) {
            insights.careerDirections.push({
                direction: 'Communication-Focused Roles',
                confidence: Math.min(85, (communicationActivities.length / activityPatterns.length) * 100 + 25),
                examples: ['Product Manager', 'Marketing Manager', 'Consultant']
            });
        }
    }

    return insights;
}

// Calculate engagement and learning metrics
function calculateEngagementMetrics(recentActivities, skillProgression) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate activity streaks
    const dailyActivities = {};
    recentActivities.forEach(activity => {
        const date = new Date(activity.created_at).toDateString();
        dailyActivities[date] = (dailyActivities[date] || 0) + 1;
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = checkDate.toDateString();
        if (dailyActivities[dateStr]) {
            currentStreak++;
        } else {
            break;
        }
    }

    // Recent activity count
    const weeklyActivities = recentActivities.filter(a => 
        new Date(a.created_at) > weekAgo
    ).length;

    const monthlyActivities = recentActivities.filter(a => 
        new Date(a.created_at) > monthAgo
    ).length;

    // Skill improvement trend
    const skillTrend = calculateSkillTrend(skillProgression);

    return {
        currentStreak,
        weeklyActivities,
        monthlyActivities,
        skillTrend,
        engagementLevel: calculateEngagementLevel(currentStreak, weeklyActivities),
        lastActiveDate: recentActivities[0]?.created_at || null
    };
}

function calculateSkillTrend(skillProgression) {
    if (!skillProgression || skillProgression.length < 5) return 'neutral';
    
    const recent = skillProgression.slice(-5);
    const older = skillProgression.slice(-10, -5);
    
    if (recent.length === 0 || older.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((sum, activity) => sum + (activity.score || 70), 0) / recent.length;
    const olderAvg = older.reduce((sum, activity) => sum + (activity.score || 70), 0) / older.length;
    
    const improvement = recentAvg - olderAvg;
    
    if (improvement > 5) return 'improving';
    if (improvement < -5) return 'declining';
    return 'stable';
}

function calculateEngagementLevel(streak, weeklyActivities) {
    if (streak >= 7 && weeklyActivities >= 10) return 'high';
    if (streak >= 3 && weeklyActivities >= 5) return 'medium';
    return 'low';
}

export const GET = requireAuth(handler);
