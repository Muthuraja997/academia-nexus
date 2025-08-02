'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [communicationSessions, setCommunicationSessions] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [userStats, setUserStats] = useState({});
    const [careerInsights, setCareerInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoggingActivity, setIsLoggingActivity] = useState(false); // Prevent infinite loops

    // Load data from localStorage on mount
    useEffect(() => {
        if (user?.id) {
            loadPersistedData();
            // Delay fetchLatestData to prevent initial load conflicts
            const timer = setTimeout(() => {
                fetchLatestData();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user?.id]); // Only depend on user.id

    const loadPersistedData = () => {
        if (!user?.id || typeof window === 'undefined') return;
        
        try {
            const persistedData = {
                activities: JSON.parse(localStorage.getItem(`activities_${user.id}`) || '[]'),
                testResults: JSON.parse(localStorage.getItem(`testResults_${user.id}`) || '[]'),
                communicationSessions: JSON.parse(localStorage.getItem(`communicationSessions_${user.id}`) || '[]'),
                achievements: JSON.parse(localStorage.getItem(`achievements_${user.id}`) || '[]'),
                userStats: JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}'),
                careerInsights: JSON.parse(localStorage.getItem(`careerInsights_${user.id}`) || 'null')
            };

            setActivities(persistedData.activities || []);
            setTestResults(persistedData.testResults || []);
            setCommunicationSessions(persistedData.communicationSessions || []);
            setAchievements(persistedData.achievements || []);
            setUserStats(persistedData.userStats || {});
            setCareerInsights(persistedData.careerInsights);
        } catch (error) {
            console.error('Error loading persisted data:', error);
            // Reset to defaults if localStorage is corrupted
            setActivities([]);
            setTestResults([]);
            setCommunicationSessions([]);
            setAchievements([]);
            setUserStats({});
            setCareerInsights(null);
        }
    };

    const persistData = (dataType, data) => {
        if (!user || typeof window === 'undefined') return;
        
        try {
            localStorage.setItem(`${dataType}_${user.id}`, JSON.stringify(data));
        } catch (error) {
            console.error(`Error persisting ${dataType}:`, error);
        }
    };

    const fetchLatestData = async () => {
        if (!user || loading) return; // Prevent multiple simultaneous calls

        setLoading(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (!token) {
                console.log('No auth token available for fetching data');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/user/dashboard?userId=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                
                if (data.dashboard) {
                    // Update state without triggering additional activity logging
                    setActivities(data.dashboard.recentActivities || []);
                    setTestResults(data.recentTests || []);
                    setCommunicationSessions(data.recentCommunicationSessions || []);
                    setAchievements(data.dashboard.achievements || []);
                    setUserStats(data.dashboard.stats || {});
                    setCareerInsights(data.careerInsights);
                    
                    // Persist the fetched data
                    persistData('activities', data.dashboard.recentActivities || []);
                    persistData('testResults', data.recentTests || []);
                    persistData('communicationSessions', data.recentCommunicationSessions || []);
                    persistData('achievements', data.dashboard.achievements || []);
                    persistData('userStats', data.dashboard.stats || {});
                    persistData('careerInsights', data.careerInsights);
                }
            }
        } catch (error) {
            console.error('Error fetching latest data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update functions that persist data
    const updateActivities = (newActivities) => {
        setActivities(newActivities);
        persistData('activities', newActivities);
    };

    const addActivity = (activity) => {
        const updatedActivities = [activity, ...activities].slice(0, 50); // Keep last 50
        updateActivities(updatedActivities);
        
        // Only log to database if not already logging to prevent infinite loops
        if (!isLoggingActivity) {
            logActivityToDatabase(activity);
        }
    };

    const updateTestResults = (newResults) => {
        setTestResults(newResults);
        persistData('testResults', newResults);
    };

    const addTestResult = (result) => {
        const updatedResults = [result, ...testResults].slice(0, 20); // Keep last 20
        updateTestResults(updatedResults);
    };

    const updateCommunicationSessions = (newSessions) => {
        setCommunicationSessions(newSessions);
        persistData('communicationSessions', newSessions);
    };

    const addCommunicationSession = (session) => {
        const updatedSessions = [session, ...communicationSessions].slice(0, 20);
        updateCommunicationSessions(updatedSessions);
    };

    const updateAchievements = (newAchievements) => {
        setAchievements(newAchievements);
        persistData('achievements', newAchievements);
    };

    const addAchievement = (achievement) => {
        const updatedAchievements = [achievement, ...achievements];
        updateAchievements(updatedAchievements);
    };

    const updateUserStats = (newStats) => {
        setUserStats(newStats);
        persistData('userStats', newStats);
    };

    const updateCareerInsights = (newInsights) => {
        setCareerInsights(newInsights);
        persistData('careerInsights', newInsights);
    };

    const logActivityToDatabase = async (activity) => {
        if (!user || isLoggingActivity) return;

        // Double-check to prevent recursive calls
        if (activity.activity_type === 'api_call' || activity.isLogging) return;

        setIsLoggingActivity(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (!token) {
                console.log('No auth token available for logging activity');
                setIsLoggingActivity(false);
                return;
            }

            const response = await fetch('/api/user/activity', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    ...activity,
                    isLogging: true // Mark this to prevent recursion
                }),
            });
            
            if (!response.ok) {
                console.error('Failed to log activity:', response.statusText);
            }
        } catch (error) {
            console.error('Error logging activity to database:', error);
        } finally {
            setIsLoggingActivity(false);
        }
    };

    // Auto-track page visits with throttling
    const trackPageVisit = (pageName, duration = 0) => {
        // Throttle page visits to prevent spam
        const lastVisit = localStorage.getItem(`lastVisit_${pageName}`);
        const now = Date.now();
        
        if (lastVisit && (now - parseInt(lastVisit)) < 5000) { // 5 second throttle
            return;
        }
        
        localStorage.setItem(`lastVisit_${pageName}`, now.toString());
        
        const activity = {
            activity_type: 'page_visit',
            activity_details: { page: pageName, duration },
            session_duration: duration,
            score: null,
            created_at: new Date().toISOString()
        };
        addActivity(activity);
    };

    // Auto-track interactions with throttling
    const trackInteraction = (type, details, score = null) => {
        // Don't track if already logging to prevent recursion
        if (isLoggingActivity) return;
        
        const activity = {
            activity_type: type,
            activity_details: details,
            session_duration: details.duration || 0,
            score: score,
            created_at: new Date().toISOString()
        };
        addActivity(activity);
    };

    // Main activity tracking function with better control
    const trackActivity = async (activityType, details = {}) => {
        if (!user || isLoggingActivity) return;

        const activity = {
            activity_type: activityType,
            activity_details: details,
            session_duration: details.session_duration || 0,
            score: details.score || null,
            created_at: new Date().toISOString()
        };

        // Add to local state immediately
        const updatedActivities = [activity, ...activities].slice(0, 50);
        updateActivities(updatedActivities);

        // Log to database with throttling
        await logActivityToDatabase(activity);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Clear any ongoing requests
            setIsLoggingActivity(false);
            setLoading(false);
        };
    }, []);

    const contextValue = {
        // Data
        activities,
        testResults,
        communicationSessions,
        achievements,
        userStats,
        careerInsights,
        loading,
        
        // Update functions
        updateActivities,
        addActivity,
        updateTestResults,
        addTestResult,
        updateCommunicationSessions,
        addCommunicationSession,
        updateAchievements,
        addAchievement,
        updateUserStats,
        updateCareerInsights,
        
        // Tracking functions
        trackPageVisit,
        trackInteraction,
        trackActivity,
        
        // Refresh function
        fetchLatestData
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};
