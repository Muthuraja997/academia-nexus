'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWidget from './ChatWidget';
import { IconMenu } from '../common/Icons';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import Link from 'next/link';

// A mapping of routes to their display titles for the header.
const pageTitles = {
    '/dashboard': 'Dashboard',
    '/': 'Dashboard',
    '/tests': 'Test Agent',
    '/scholarships': 'Scholarship Finder',
    '/career-path': 'Career Trajectory',
    '/interview-prep': 'Interview Prep',
    '/communication-practice': 'Communication Practice',
    '/auth/login': 'Login',
    '/auth/register': 'Register',
};

// This is the main application shell that wraps every page.
const AppShell = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const title = pageTitles[pathname] || 'Academia Nexus';
    const { user, isAuthenticated, logout, loading } = useAuth();
    
    // Initialize activity logger for automatic page tracking
    useActivityLogger();

    // Show loading screen while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't show sidebar for auth pages
    const isAuthPage = pathname?.startsWith('/auth');

    const handleLogout = async () => {
        await logout();
        window.location.href = '/auth/login';
    };

    return (
        <div className="min-h-screen font-sans">
            {!isAuthPage && isAuthenticated() && (
                <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            )}
            
            <div className={!isAuthPage && isAuthenticated() ? "lg:ml-64" : ""}>
                {/* Header for mobile view and authenticated users */}
                {!isAuthPage && isAuthenticated() && (
                    <header className="lg:hidden sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 p-4 flex items-center justify-between shadow-sm">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <IconMenu className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h1>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {user?.first_name || user?.username}
                            </span>
                            <button 
                                onClick={handleLogout}
                                className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300"
                            >
                                {(user?.first_name || user?.username || 'U')[0].toUpperCase()}
                            </button>
                        </div>
                    </header>
                )}

                {/* Header for desktop authenticated users */}
                {!isAuthPage && isAuthenticated() && (
                    <header className="hidden lg:block sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h1>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Welcome, {user?.first_name || user?.username}!
                                </span>
                                <button 
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </header>
                )}

                {/* The main content area */}
                <main className={!isAuthPage && isAuthenticated() ? "p-4 sm:p-6 md:p-8" : ""}>
                    {children}
                </main>
            </div>
            
            <ChatWidget />
        </div>
    );
};

export default AppShell;
