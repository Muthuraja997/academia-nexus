import React from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Link from 'next/link';

const DashboardPage = () => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome Back, Alex!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Here's your summary for today, Friday, July 25, 2025.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="md:col-span-2 lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Deadlines</h2>
                <ul className="space-y-4">
                    <li className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Physics Lab Report</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Due: July 28, 2025</p>
                        </div>
                        <span className="text-sm font-bold text-red-500">3 Days Left</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Calculus Mid-term Exam</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled: August 02, 2025</p>
                        </div>
                        <span className="text-sm font-bold text-yellow-500">8 Days Left</span>
                    </li>
                </ul>
            </Card>
            <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Career Path</h2>
                 <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-2">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-gray-200 dark:text-gray-700" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-blue-600" strokeWidth="3" fill="none" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-800 dark:text-white">85%</div>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Data Scientist</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Profile Match</p>
                </div>
            </Card>
            <Card className="lg:col-span-3">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                 <div className="flex flex-wrap gap-4">
                    <Link href="/tests"><Button>Start New Test</Button></Link>
                    <Link href="/scholarships"><Button variant="secondary">Find Scholarships</Button></Link>
                    <Link href="/interview-prep"><Button variant="secondary">Prep for Interview</Button></Link>
                 </div>
            </Card>
        </div>
    </div>
);

export default DashboardPage;
