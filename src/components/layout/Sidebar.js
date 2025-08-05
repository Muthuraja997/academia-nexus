'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconDashboard, IconTest, IconScholarship, IconPrediction, IconInterview, IconChat, IconStudy, IconProfile } from '../common/Icons';

// A helper function to combine class names.
const cn = (...classes) => classes.filter(Boolean).join(' ');

// An array defining our navigation items for easy mapping.
// The new "Communication" and "Study Assistant" items have been added here.
const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: IconDashboard },
    { href: '/profile', label: 'Profile', icon: IconProfile },
    { href: '/tests', label: 'Test Agent', icon: IconTest },
    { href: '/study', label: 'Study Assistant', icon: IconStudy },
    { href: '/scholarships', label: 'Scholarships', icon: IconScholarship },
    { href: '/career-path', label: 'Career Path', icon: IconPrediction },
    { href: '/interview-prep', label: 'Interview Prep', icon: IconInterview },
    { href: '/communication-practice', label: 'Communication', icon: IconChat },
];

// A sub-component for each navigation link to handle active state styling.
const NavItem = ({ item, closeSidebar }) => {
    const pathname = usePathname();
    // Check if the current path matches the item's href to apply active styles.
    const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
    
    return (
        <li>
            <Link
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                    "flex items-center p-3 my-1 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors",
                    isActive && "bg-blue-500 text-white dark:bg-blue-600 dark:text-white hover:bg-blue-500"
                )}
            >
                <item.icon className="h-6 w-6" />
                <span className="ml-4 font-medium">
                    {item.label}
                </span>
            </Link>
        </li>
    );
};

// The main Sidebar component. It controls its own visibility on mobile.
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    return (
        <>
            <aside className={cn(
                "fixed top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                "lg:translate-x-0" // On large screens, it's always visible.
            )}>
                <div className="p-6">
                    <Link href="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400">Academia Nexus</Link>
                </div>
                <nav className="px-4">
                    <ul>
                        {navItems.map(item => (
                             <NavItem key={item.href} item={item} closeSidebar={() => setIsSidebarOpen(false)} />
                        ))}
                    </ul>
                </nav>
            </aside>
            {/* Overlay for mobile view when sidebar is open */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;
