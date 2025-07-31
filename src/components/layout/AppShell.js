'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWidget from './ChatWidget';
import { IconMenu } from '../common/Icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// A mapping of routes to their display titles for the header.
// This includes the title for the new "Communication Practice" page.
const pageTitles = {
    '/dashboard': 'Dashboard',
    '/': 'Dashboard',
    '/tests': 'Test Agent',
    '/scholarships': 'Scholarship Finder',
    '/career-path': 'Career Trajectory',
    '/interview-prep': 'Interview Prep',
    '/communication-practice': 'Communication Practice',
};

// This is the main application shell that wraps every page.
// It manages the state for the sidebar visibility.
const AppShell = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const title = pageTitles[pathname] || 'Academia AIwithus';

    return (
        <div className="min-h-screen font-sans">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            
            <div className="lg:ml-64">
                {/* Header for mobile view, which is hidden on large screens */}
                <header className="lg:hidden sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 p-4 flex items-center justify-between shadow-sm">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <IconMenu className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h1>
                    <Link href="/dashboard">
                        <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300">
                          A
                        </div>
                    </Link>
                </header>

                {/* The main content area where different pages will be rendered */}
                <main className="p-4 sm:p-6 md:p-8">
                    {children}
                </main>
            </div>
            
            <ChatWidget />
        </div>
    );
};

export default AppShell;
