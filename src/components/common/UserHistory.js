'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function UserHistory({ isCollapsed = false }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(!isCollapsed);
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            fetchActivities();
        }
    }, [user, token]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/activity?limit=20', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data.activities || []);
            } else {
                setError('Failed to load activities');
            }
        } catch (err) {
            console.error('Error fetching activities:', err);
            setError('Failed to load activities');
        } finally {
            setLoading(false);
        }
    };

    const deleteActivity = async (activityId) => {
        try {
            const response = await fetch(`/api/user/activity?activityId=${activityId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Remove the deleted activity from the list
                setActivities(prev => prev.filter(activity => activity.id !== activityId));
            } else {
                alert('Failed to delete activity');
            }
        } catch (err) {
            console.error('Error deleting activity:', err);
            alert('Failed to delete activity');
        }
    };

    const formatActivityType = (type) => {
        const typeMap = {
            'communication_practice': 'Communication Practice',
            'interview_prep': 'Interview Preparation',
            'test_taking': 'Test Taking',
            'career_analysis': 'Career Analysis',
            'scholarship_search': 'Scholarship Search',
            'page_visit': 'Page Visit'
        };
        return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString();
    };

    const getActivityIcon = (type) => {
        const iconMap = {
            'communication_practice': '💬',
            'interview_prep': '🎯',
            'test_taking': '📝',
            'career_analysis': '📊',
            'scholarship_search': '🎓',
            'page_visit': '👁️'
        };
        return iconMap[type] || '📋';
    };

    if (!user) return null;

    return (
        <div className="fixed right-4 top-20 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* Header */}
            <div 
                className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-2">
                    <span className="text-lg">📚</span>
                    <h3 className="font-semibold text-gray-800">Activity History</h3>
                    <span className="text-sm text-gray-500">({activities.length})</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            Loading activities...
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">
                            {error}
                            <button 
                                onClick={fetchActivities}
                                className="block mx-auto mt-2 text-blue-500 hover:underline"
                            >
                                Retry
                            </button>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No activities yet. Start exploring!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {activities.map((activity) => (
                                <div key={activity.id} className="p-3 hover:bg-gray-50 group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">{getActivityIcon(activity.activity_type)}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {formatActivityType(activity.activity_type)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(activity.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Activity Details */}
                                            {activity.activity_details && typeof activity.activity_details === 'object' && (
                                                <div className="mt-2 text-xs text-gray-600">
                                                    {activity.company && (
                                                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-1 mb-1">
                                                            {activity.company}
                                                        </span>
                                                    )}
                                                    {activity.job_role && (
                                                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full mr-1 mb-1">
                                                            {activity.job_role}
                                                        </span>
                                                    )}
                                                    {activity.score && (
                                                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mr-1 mb-1">
                                                            Score: {activity.score}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Are you sure you want to delete this activity?')) {
                                                    deleteActivity(activity.id);
                                                }
                                            }}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 rounded transition-opacity"
                                            title="Delete activity"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Refresh Button */}
                    {activities.length > 0 && (
                        <div className="p-3 border-t border-gray-100">
                            <button
                                onClick={fetchActivities}
                                className="w-full text-sm text-blue-600 hover:text-blue-800 py-2 hover:bg-blue-50 rounded transition-colors"
                            >
                                🔄 Refresh Activities
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
