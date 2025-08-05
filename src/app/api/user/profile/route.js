import { requireAuth } from '../../../../lib/auth.js';
import { getDatabase } from '../../../../../database/db.js';

async function handler(request) {
    const db = getDatabase();
    const userId = request.userId;

    if (request.method === 'GET') {
        try {
            // Get user profile with additional details
            const user = await db.getUserById(userId);
            const preferences = await db.getUserPreferences(userId);
            const achievements = await db.getUserAchievements(userId);
            const stats = await db.getUserStats(userId);

            const { password_hash, ...userProfile } = user;

            return Response.json({
                success: true,
                profile: {
                    ...userProfile,
                    preferences,
                    achievements,
                    stats
                }
            });

        } catch (error) {
            console.error('Profile fetch error:', error);
            return Response.json({
                success: false,
                error: 'Failed to fetch profile'
            }, { status: 500 });
        }
    }

    if (request.method === 'PUT') {
        try {
            const updates = await request.json();
            
            // Validate and sanitize updates
            const allowedFields = [
                'first_name', 'last_name', 'university', 'major', 
                'year_of_study', 'phone', 'bio', 'date_of_birth',
                'nationality', 'gpa', 'interests', 'achievements',
                'skills', 'linkedin_url', 'github_url', 'portfolio_url',
                'career_goals', 'education_level', 'graduation_year'
            ];
            
            const sanitizedUpdates = {};
            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key)) {
                    // Convert empty strings to null for database
                    const sanitizedValue = value === '' ? null : value;
                    
                    // Special validation for specific fields
                    if (key === 'gpa' && sanitizedValue) {
                        const gpaNum = parseFloat(sanitizedValue);
                        if (gpaNum >= 0 && gpaNum <= 4.0) {
                            sanitizedUpdates[key] = gpaNum;
                        }
                    } else if (key === 'graduation_year' && sanitizedValue) {
                        const year = parseInt(sanitizedValue);
                        if (year >= 2020 && year <= 2030) {
                            sanitizedUpdates[key] = year;
                        }
                    } else if (key.includes('_url') && sanitizedValue) {
                        // Basic URL validation
                        try {
                            new URL(sanitizedValue);
                            sanitizedUpdates[key] = sanitizedValue;
                        } catch {
                            // Skip invalid URLs
                        }
                    } else {
                        sanitizedUpdates[key] = sanitizedValue;
                    }
                }
            }

            // Update user profile
            await db.updateUser(userId, sanitizedUpdates);

            // Log activity
            await db.logActivity(
                userId,
                'profile_update',
                { updated_fields: Object.keys(sanitizedUpdates) },
                0,
                null,
                null,
                null
            );

            // Get updated profile
            const updatedUser = await db.getUserById(userId);
            const { password_hash, ...userProfile } = updatedUser;

            return Response.json({
                success: true,
                message: 'Profile updated successfully',
                profile: userProfile
            });

        } catch (error) {
            console.error('Profile update error:', error);
            return Response.json({
                success: false,
                error: 'Failed to update profile'
            }, { status: 500 });
        }
    }

    return Response.json({
        success: false,
        error: 'Method not allowed'
    }, { status: 405 });
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
