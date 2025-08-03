'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';

export function useActivityLogger() {
    const { user, token } = useAuth();
    const pathname = usePathname();
    const lastPathRef = useRef('');
    const sessionStartRef = useRef(null);

    const logActivity = async (activityType, details = {}) => {
        if (!user || !token) return;

        try {
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activity_type: activityType,
                    activity_details: details,
                    session_duration: sessionStartRef.current ? 
                        Math.floor((Date.now() - sessionStartRef.current) / 1000) : 0
                })
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    };

    const logPageVisit = async (pagePath) => {
        const pageNames = {
            '/dashboard': 'Dashboard',
            '/': 'Home',
            '/tests': 'Test Agent',
            '/scholarships': 'Scholarship Finder',
            '/career-path': 'Career Trajectory',
            '/interview-prep': 'Interview Preparation',
            '/communication-practice': 'Communication Practice'
        };

        const pageName = pageNames[pagePath] || pagePath.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        await logActivity('page_visit', {
            page: pageName,
            path: pagePath,
            timestamp: new Date().toISOString()
        });
    };

    // Log page visits automatically
    useEffect(() => {
        if (!user || !pathname) return;

        // Don't log auth pages
        if (pathname.startsWith('/auth')) return;

        // Only log if path changed
        if (lastPathRef.current !== pathname) {
            sessionStartRef.current = Date.now();
            logPageVisit(pathname);
            lastPathRef.current = pathname;
        }

        // Cleanup function to log session duration when leaving page
        return () => {
            if (sessionStartRef.current) {
                const sessionDuration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
                if (sessionDuration > 5) { // Only log if stayed for more than 5 seconds
                    logActivity('session_end', {
                        page: lastPathRef.current,
                        duration: sessionDuration
                    });
                }
            }
        };
    }, [pathname, user, token]);

    return {
        logActivity,
        logPageVisit,
        // Helper functions for common activities
        logTest: (testName, score, company) => logActivity('test_taking', { 
            test: testName, 
            score, 
            company,
            timestamp: new Date().toISOString()
        }),
        logInterview: (company, role, score) => logActivity('interview_prep', { 
            company, 
            role, 
            score,
            timestamp: new Date().toISOString()
        }),
        logCommunication: (exercise, score, duration) => logActivity('communication_practice', { 
            exercise, 
            score, 
            duration,
            timestamp: new Date().toISOString()
        }),
        logScholarship: (action, scholarship) => logActivity('scholarship_search', { 
            action, 
            scholarship,
            timestamp: new Date().toISOString()
        }),
        logCareerAnalysis: (company, role, analysis) => logActivity('career_analysis', { 
            company, 
            role, 
            analysis,
            timestamp: new Date().toISOString()
        })
    };
}
