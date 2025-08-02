import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../../database/db.js';
import { requireAuth } from '../../../../lib/auth.js';

async function handler(request) {
    try {
        const {
            userId,
            activity_type,
            activity_details,
            session_duration,
            score,
            company,
            job_role
        } = await request.json();

        // Use authenticated userId instead of the one from request body for security
        const authenticatedUserId = request.userId;

        if (!activity_type) {
            return NextResponse.json(
                { success: false, error: 'Activity type is required' },
                { status: 400 }
            );
        }

        const db = getDatabase();

        // Enhanced activity logging
        const activityData = {
            activityType: activity_type,
            activityDetails: activity_details || {},
            sessionDuration: session_duration || 0,
            score: score,
            company: company || null,
            jobRole: job_role || null,
            skillsUsed: extractSkillsFromActivity(activity_type, activity_details),
            difficultyLevel: determineDifficultyLevel(activity_details),
            completionStatus: 'completed'
        };

        const result = await db.logEnhancedActivity(authenticatedUserId, activityData);

        return NextResponse.json({
            success: true,
            activityId: result.id,
            message: 'Activity logged successfully'
        });

    } catch (error) {
        console.error('Activity logging error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to log activity' },
            { status: 500 }
        );
    }
}

export const POST = requireAuth(handler);

// Helper function to extract skills from activity
function extractSkillsFromActivity(activityType, details) {
    const skillMap = {
        'communication_practice': ['communication', 'presentation', 'verbal skills'],
        'interview_prep': ['interview skills', 'communication', 'problem solving'],
        'test_taking': ['technical skills', 'analytical thinking', 'time management'],
        'career_analysis': ['self-reflection', 'career planning', 'decision making'],
        'scholarship_search': ['research', 'application writing', 'planning'],
        'page_visit': []
    };

    const baseSkills = skillMap[activityType] || [];
    
    // Add specific skills based on details
    if (details) {
        if (details.company) baseSkills.push('company research');
        if (details.role) baseSkills.push('role analysis');
        if (details.difficulty === 'hard') baseSkills.push('advanced problem solving');
        if (details.programming) baseSkills.push('programming', 'coding');
        if (details.technical) baseSkills.push('technical knowledge');
    }

    return [...new Set(baseSkills)]; // Remove duplicates
}

// Helper function to determine difficulty level
function determineDifficultyLevel(details) {
    if (!details) return 'medium';
    
    if (details.difficulty) return details.difficulty;
    if (details.advanced || details.expert) return 'hard';
    if (details.beginner || details.basic) return 'easy';
    
    return 'medium';
}
