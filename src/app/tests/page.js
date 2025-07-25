'use client';
import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// The Test Agent page component.
const TestAgentPage = () => {
    // State to toggle between the list of tests and the active test view.
    const [isTestActive, setIsTestActive] = useState(false);

    // Conditional rendering: If a test is active, show the question view.
    if (isTestActive) {
        return (
            <Card className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Calculus Practice Quiz</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Question 1 of 10</p>
                <div className="mb-6">
                    <p className="font-semibold text-lg mb-4">What is the derivative of x²?</p>
                    <div className="space-y-3">
                        <label className="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50 cursor-pointer">
                            <input type="radio" name="question1" className="form-radio h-5 w-5 text-blue-600" />
                            <span className="ml-3 text-gray-800 dark:text-gray-200">2x</span>
                        </label>
                         <label className="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50 cursor-pointer">
                            <input type="radio" name="question1" className="form-radio h-5 w-5 text-blue-600" />
                            <span className="ml-3 text-gray-800 dark:text-gray-200">x</span>
                        </label>
                    </div>
                </div>
                <div className="flex justify-between">
                    <Button variant="secondary" onClick={() => setIsTestActive(false)}>End Test</Button>
                    <Button>Next Question</Button>
                </div>
            </Card>
        );
    }

    // Otherwise, show the list of available and completed tests.
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Test Center</h1>
            <div className="space-y-6">
                <Card>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calculus Practice Quiz</h2>
                            <p className="text-gray-500 dark:text-gray-400">10 Questions, 15 minutes</p>
                        </div>
                        <Button onClick={() => setIsTestActive(true)} className="mt-4 sm:mt-0">Start Test</Button>
                    </div>
                </Card>
                 <Card>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between opacity-50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Physics Final Review (Completed)</h2>
                            <p className="text-gray-500 dark:text-gray-400">Score: 88%</p>
                        </div>
                        <Button className="mt-4 sm:mt-0" disabled>View Results</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TestAgentPage;
