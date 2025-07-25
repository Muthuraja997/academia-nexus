'use client';
import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// The Interview Prep page component.
const InterviewPrepPage = () => {
    // State to manage form inputs, loading state, and results.
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [questions, setQuestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Function to simulate generating questions.
    const handleGenerate = () => {
        if (!company || !role) return;
        setIsLoading(true);
        setQuestions(null);
        // Simulate a network request to a web scraping agent.
        setTimeout(() => {
            setQuestions([
                { category: 'Company Values', q: `Based on ${company}'s mission, how do you align with their core values?` },
                { category: 'Behavioral', q: 'Tell me about a time you faced a difficult challenge in a team project.' },
                { category: 'Technical', q: `Describe a project where you used skills relevant to the ${role} position.` },
            ]);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Interview Prep</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Get tailored questions for your next interview.</p>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Enter Company Name (e.g., Google)" className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Enter Job Role (e.g., Software Engineer)" className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                    {isLoading ? 'Generating...' : 'Generate Questions'}
                </Button>
            </Card>

            {/* Show a loading spinner while generating */}
            {isLoading && (
                 <div className="text-center mt-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Scraping and analyzing...</p>
                 </div>
            )}

            {/* Display the generated questions */}
            {questions && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Generated Questions for {company}</h2>
                    <div className="space-y-4">
                        {questions.map((item, index) => (
                            <Card key={index}>
                                <p className="font-semibold text-lg text-gray-800 dark:text-white">{item.q}</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">{item.category}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewPrepPage;
