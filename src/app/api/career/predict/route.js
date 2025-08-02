import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../../database/db.js';

// Career prediction algorithm based on student activities
export async function POST(request) {
    try {
        const { userId } = await request.json();
        const db = getDatabase();

        // Get comprehensive user data for analysis
        const [userStats, activities, testResults, communicationSessions, userProfile] = await Promise.all([
            db.getUserStats(userId),
            db.getUserActivities(userId, 100), // Get more activities for better analysis
            db.getUserTestResults(userId, 50),
            db.getUserCommunicationSessions(userId, 30),
            db.getUserById(userId)
        ]);

        // Career prediction logic
        const careerPredictions = await analyzeCareerPath({
            userStats,
            activities,
            testResults,
            communicationSessions,
            userProfile
        });

        return NextResponse.json({
            success: true,
            predictions: careerPredictions,
            analysisDate: new Date().toISOString()
        });

    } catch (error) {
        console.error('Career prediction error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate career predictions' },
            { status: 500 }
        );
    }
}

// Main career analysis function
async function analyzeCareerPath(userData) {
    const { activities, testResults, communicationSessions, userProfile } = userData;

    // Define career paths with their characteristics
    const careerPaths = {
        'Data Scientist': {
            requiredSkills: ['python', 'sql', 'statistics', 'machine learning', 'data analysis'],
            industries: ['tech', 'finance', 'healthcare', 'consulting'],
            avgSalary: 95000,
            growth: 'High',
            description: 'Analyze complex data to help organizations make informed decisions'
        },
        'Software Engineer': {
            requiredSkills: ['programming', 'algorithms', 'system design', 'debugging'],
            industries: ['tech', 'finance', 'gaming', 'startup'],
            avgSalary: 105000,
            growth: 'Very High',
            description: 'Design and develop software applications and systems'
        },
        'Product Manager': {
            requiredSkills: ['communication', 'strategy', 'analytics', 'leadership'],
            industries: ['tech', 'consulting', 'retail', 'finance'],
            avgSalary: 115000,
            growth: 'High',
            description: 'Guide product development from conception to launch'
        },
        'Marketing Manager': {
            requiredSkills: ['communication', 'creativity', 'analytics', 'social media'],
            industries: ['marketing', 'retail', 'tech', 'media'],
            avgSalary: 75000,
            growth: 'Medium',
            description: 'Develop and execute marketing strategies to promote products'
        },
        'Financial Analyst': {
            requiredSkills: ['finance', 'excel', 'analytics', 'economics'],
            industries: ['finance', 'consulting', 'investment', 'banking'],
            avgSalary: 85000,
            growth: 'Medium',
            description: 'Analyze financial data to guide investment decisions'
        },
        'UX Designer': {
            requiredSkills: ['design', 'user research', 'prototyping', 'communication'],
            industries: ['tech', 'design', 'consulting', 'media'],
            avgSalary: 90000,
            growth: 'High',
            description: 'Create intuitive and engaging user experiences for digital products'
        },
        'Consultant': {
            requiredSkills: ['communication', 'problem solving', 'analytics', 'presentation'],
            industries: ['consulting', 'finance', 'strategy', 'operations'],
            avgSalary: 100000,
            growth: 'Medium',
            description: 'Provide expert advice to help organizations solve complex problems'
        },
        'Business Analyst': {
            requiredSkills: ['analytics', 'communication', 'process improvement', 'sql'],
            industries: ['consulting', 'finance', 'tech', 'operations'],
            avgSalary: 80000,
            growth: 'Medium',
            description: 'Analyze business processes and recommend improvements'
        }
    };

    // Calculate scores for each career path
    const predictions = [];
    
    for (const [careerName, careerData] of Object.entries(careerPaths)) {
        const score = calculateCareerMatchScore(
            careerData,
            activities,
            testResults,
            communicationSessions,
            userProfile
        );
        
        const skillGaps = identifySkillGaps(careerData.requiredSkills, activities, testResults);
        const recommendations = generateRecommendations(careerData, skillGaps, userData);
        
        predictions.push({
            career: careerName,
            matchScore: Math.round(score),
            ...careerData,
            skillGaps,
            recommendations,
            confidence: calculateConfidence(activities.length, testResults.length, communicationSessions.length)
        });
    }

    // Sort by match score and return top predictions
    return predictions
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);
}

// Calculate how well a career matches the student's profile
function calculateCareerMatchScore(careerData, activities, testResults, communicationSessions, userProfile) {
    let score = 50; // Base score
    
    // Analyze activity patterns
    const activityScore = analyzeActivities(activities, careerData.requiredSkills);
    score += activityScore * 0.3;
    
    // Analyze test performance
    const testScore = analyzeTestResults(testResults, careerData);
    score += testScore * 0.25;
    
    // Analyze communication skills
    const commScore = analyzeCommunicationSessions(communicationSessions, careerData);
    score += commScore * 0.25;
    
    // Consider user's major/field of study
    const majorScore = analyzeMajorAlignment(userProfile.major, careerData);
    score += majorScore * 0.2;
    
    return Math.min(100, Math.max(0, score));
}

// Analyze student activities for career relevance
function analyzeActivities(activities, requiredSkills) {
    if (activities.length === 0) return 0;
    
    const skillMatches = new Set();
    let totalRelevance = 0;
    
    activities.forEach(activity => {
        const details = activity.activity_details || {};
        const activityText = (activity.activity_type + ' ' + JSON.stringify(details)).toLowerCase();
        
        requiredSkills.forEach(skill => {
            if (activityText.includes(skill.toLowerCase())) {
                skillMatches.add(skill);
                totalRelevance += activity.score || 70; // Use score if available
            }
        });
    });
    
    const skillCoverage = (skillMatches.size / requiredSkills.length) * 100;
    const avgPerformance = totalRelevance / Math.max(activities.length, 1);
    
    return (skillCoverage * 0.6 + avgPerformance * 0.4) / 2;
}

// Analyze test results for career fit
function analyzeTestResults(testResults, careerData) {
    if (testResults.length === 0) return 0;
    
    let relevantTests = 0;
    let totalScore = 0;
    
    testResults.forEach(test => {
        const testText = (test.test_title + ' ' + test.company + ' ' + test.job_role).toLowerCase();
        const isRelevant = careerData.requiredSkills.some(skill => 
            testText.includes(skill.toLowerCase())
        ) || careerData.industries.some(industry => 
            testText.includes(industry.toLowerCase())
        );
        
        if (isRelevant) {
            relevantTests++;
            totalScore += test.score_percentage || 0;
        }
    });
    
    if (relevantTests === 0) return 30; // Neutral score if no relevant tests
    
    return (totalScore / relevantTests) * 0.8; // Scale down slightly
}

// Analyze communication sessions
function analyzeCommunicationSessions(sessions, careerData) {
    if (sessions.length === 0) return 0;
    
    const avgFeedbackScore = sessions.reduce((sum, session) => 
        sum + (session.feedback_score || 70), 0) / sessions.length;
    
    // Communication-heavy careers get bonus
    const communicationHeavy = ['Product Manager', 'Marketing Manager', 'Consultant'].includes(careerData);
    const bonus = communicationHeavy ? 10 : 0;
    
    return Math.min(100, avgFeedbackScore + bonus);
}

// Analyze major alignment with career
function analyzeMajorAlignment(major, careerData) {
    if (!major) return 50;
    
    const majorLower = major.toLowerCase();
    const alignmentMap = {
        'computer science': ['Software Engineer', 'Data Scientist'],
        'business': ['Product Manager', 'Business Analyst', 'Consultant'],
        'marketing': ['Marketing Manager', 'Product Manager'],
        'finance': ['Financial Analyst', 'Business Analyst'],
        'design': ['UX Designer'],
        'mathematics': ['Data Scientist', 'Financial Analyst'],
        'economics': ['Financial Analyst', 'Business Analyst', 'Consultant']
    };
    
    for (const [field, careers] of Object.entries(alignmentMap)) {
        if (majorLower.includes(field)) {
            return careers.includes(careerData.career) ? 30 : 10;
        }
    }
    
    return 15; // Default for other majors
}

// Identify skill gaps for a career
function identifySkillGaps(requiredSkills, activities, testResults) {
    const demonstratedSkills = new Set();
    
    // Check activities for demonstrated skills
    activities.forEach(activity => {
        const activityText = (activity.activity_type + ' ' + JSON.stringify(activity.activity_details || {})).toLowerCase();
        requiredSkills.forEach(skill => {
            if (activityText.includes(skill.toLowerCase())) {
                demonstratedSkills.add(skill);
            }
        });
    });
    
    // Check test results for demonstrated skills
    testResults.forEach(test => {
        const testText = (test.test_title + ' ' + test.company + ' ' + test.job_role).toLowerCase();
        requiredSkills.forEach(skill => {
            if (testText.includes(skill.toLowerCase())) {
                demonstratedSkills.add(skill);
            }
        });
    });
    
    return {
        demonstrated: Array.from(demonstratedSkills),
        missing: requiredSkills.filter(skill => !demonstratedSkills.has(skill)),
        coverage: (demonstratedSkills.size / requiredSkills.length) * 100
    };
}

// Generate personalized recommendations
function generateRecommendations(careerData, skillGaps, userData) {
    const recommendations = [];
    
    // Skill development recommendations
    if (skillGaps.missing.length > 0) {
        recommendations.push({
            type: 'skill_development',
            title: 'Develop Missing Skills',
            description: `Focus on learning: ${skillGaps.missing.slice(0, 3).join(', ')}`,
            priority: 'high',
            actionItems: skillGaps.missing.slice(0, 3).map(skill => `Take a course in ${skill}`)
        });
    }
    
    // Experience recommendations
    if (userData.activities.length < 10) {
        recommendations.push({
            type: 'experience',
            title: 'Gain More Experience',
            description: 'Participate in more practice sessions and tests',
            priority: 'medium',
            actionItems: [
                'Complete interview practice sessions',
                'Take technical assessments',
                'Join communication practice sessions'
            ]
        });
    }
    
    // Industry-specific recommendations
    recommendations.push({
        type: 'industry_preparation',
        title: `Prepare for ${careerData.industries[0]} Industry`,
        description: `Build knowledge specific to the ${careerData.industries[0]} sector`,
        priority: 'medium',
        actionItems: [
            `Research top companies in ${careerData.industries[0]}`,
            'Follow industry news and trends',
            'Connect with professionals in the field'
        ]
    });
    
    return recommendations;
}

// Calculate prediction confidence based on data volume
function calculateConfidence(activitiesCount, testsCount, communicationCount) {
    const totalDataPoints = activitiesCount + testsCount + communicationCount;
    
    if (totalDataPoints >= 50) return 'high';
    if (totalDataPoints >= 20) return 'medium';
    return 'low';
}
