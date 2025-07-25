import React from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// The Scholarship Finder page component.
const ScholarshipPage = () => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Scholarship Finder</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Discover opportunities tailored for you.</p>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <input type="text" placeholder="Search scholarships..." className="flex-grow p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <select className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option>All Fields</option>
                <option>Computer Science</option>
            </select>
        </div>
        <div className="space-y-4">
            <Card className="hover:border-blue-500 border-2 border-transparent">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-4 sm:mb-0">
                        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">Future Innovators STEM Grant</h3>
                        <p className="text-gray-600 dark:text-gray-300">Amount: $5,000</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Deadline: Oct 15, 2025</p>
                    </div>
                    <Button variant="secondary">View & Apply</Button>
                </div>
            </Card>
        </div>
    </div>
);

export default ScholarshipPage;
