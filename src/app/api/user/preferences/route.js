import { requireAuth } from '../../../../lib/auth.js';
import { getDatabase } from '../../../../../database/db.js';

async function handler(request) {
    const db = getDatabase();
    const userId = request.userId;

    if (request.method === 'GET') {
        try {
            // Get user preferences
            const preferences = await db.getUserPreferences(userId) || {};
            
            return Response.json({
                success: true,
                preferences: {
                    theme: preferences.theme || 'system',
                    notifications: {
                        email: preferences.email_notifications !== false,
                        push: preferences.push_notifications !== false,
                        scholarships: preferences.scholarship_notifications !== false,
                        reminders: preferences.reminder_notifications !== false
                    },
                    privacy: {
                        profileVisibility: preferences.profile_visibility || 'private',
                        shareProgress: preferences.share_progress !== false,
                        analyticsOptOut: preferences.analytics_opt_out === true
                    },
                    dashboard: {
                        showWelcomeMessage: preferences.show_welcome_message !== false,
                        showQuickActions: preferences.show_quick_actions !== false,
                        showRecentActivity: preferences.show_recent_activity !== false
                    }
                }
            });

        } catch (error) {
            console.error('Preferences fetch error:', error);
            return Response.json({
                success: false,
                error: 'Failed to fetch preferences'
            }, { status: 500 });
        }
    }

    if (request.method === 'PUT') {
        try {
            const updates = await request.json();
            
            // Convert nested preferences to flat structure for database
            const flatPreferences = {};
            
            if (updates.theme) flatPreferences.theme = updates.theme;
            
            if (updates.notifications) {
                flatPreferences.email_notifications = updates.notifications.email;
                flatPreferences.push_notifications = updates.notifications.push;
                flatPreferences.scholarship_notifications = updates.notifications.scholarships;
                flatPreferences.reminder_notifications = updates.notifications.reminders;
            }
            
            if (updates.privacy) {
                flatPreferences.profile_visibility = updates.privacy.profileVisibility;
                flatPreferences.share_progress = updates.privacy.shareProgress;
                flatPreferences.analytics_opt_out = updates.privacy.analyticsOptOut;
            }
            
            if (updates.dashboard) {
                flatPreferences.show_welcome_message = updates.dashboard.showWelcomeMessage;
                flatPreferences.show_quick_actions = updates.dashboard.showQuickActions;
                flatPreferences.show_recent_activity = updates.dashboard.showRecentActivity;
            }

            // Update preferences
            await db.updateUserPreferences(userId, flatPreferences);

            // Log activity
            await db.logActivity(
                userId,
                'preferences_update',
                { updated_preferences: Object.keys(flatPreferences) },
                0,
                null,
                null,
                null
            );

            return Response.json({
                success: true,
                message: 'Preferences updated successfully'
            });

        } catch (error) {
            console.error('Preferences update error:', error);
            return Response.json({
                success: false,
                error: 'Failed to update preferences'
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
