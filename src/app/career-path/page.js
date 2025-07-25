import React from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// The Career Trajectory page component.
const CareerPathPage = () => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Career Trajectory</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main predictions chart */}
            <div className="lg:col-span-3">
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Career Predictions</h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Data Scientist</span>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">85% Match</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div className="bg-blue-600 h-4 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Machine Learning Engineer</span>
                                 <span className="text-sm font-medium text-blue-700 dark:text-blue-400">78% Match</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div className="bg-blue-600 h-4 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            {/* Skill Gap Analysis card */}
            <div className="lg:col-span-2">
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skill Gap Analysis</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">For: Data Scientist</p>
                    <ul className="space-y-3">
                        <li className="flex items-center"><span className="text-green-500 mr-2">✔️</span><span>Python & Pandas</span></li>
                        <li className="flex items-center"><span className="text-green-500 mr-2">✔️</span><span>SQL Databases</span></li>
                        <li className="flex items-center"><span className="text-yellow-500 mr-2">⚠️</span><span>Tableau (Recommended)</span></li>
                    </ul>
                    <Button className="w-full mt-6">Find Courses</Button>
                </Card>
            </div>
        </div>
    </div>
);

export default CareerPathPage;
