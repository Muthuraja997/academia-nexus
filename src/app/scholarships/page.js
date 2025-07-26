'use client';
import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// This component now uses a form to collect student details and sends them to the agent.
const ScholarshipAgentPage = () => {
    // State for student details form
    const [studentMajor, setStudentMajor] = useState('');
    const [studentState, setStudentState] = useState('');
    const [studentIncome, setStudentIncome] = useState('');

    // State for the agent's response
    const [agentResponse, setAgentResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFindScholarships = async () => {
        // Basic validation to ensure the user has selected at least one option.
        if (!studentMajor && !studentState && !studentIncome) {
            setError("Please provide at least one detail to search.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAgentResponse(null);

        // Create the structured profile object to send to the backend.
        const studentProfile = {
            major: studentMajor,
            state: studentState,
            income: studentIncome,
        };

        try {
            // Call our new Python agent's API endpoint with the structured data.
            const response = await fetch('http://127.0.0.1:5002/api/find-scholarships-by-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentProfile),
            });

            if (!response.ok) {
                throw new Error('The agent responded with an error.');
            }
            
            const data = await response.json();
            setAgentResponse(data);

        } catch (error) {
            console.error("Failed to get response from agent:", error);
            setError("Could not connect to the scholarship agent. Please ensure the Python server is running.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // A sub-component to render each scholarship card.
    const ScholarshipCard = ({ scholarship }) => (
         <Card className="hover:border-blue-500 border-2 border-transparent mb-4">
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{scholarship.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Source: {scholarship.source}</p>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{scholarship.description}</p>
        </Card>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Intelligent Scholarship Agent</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Provide your details and the agent will recommend scholarships for you.</p>

            {/* Student Details Input Form */}
            <Card className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select value={studentMajor} onChange={(e) => setStudentMajor(e.target.value)} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="">Select Major...</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Science">Science</option>
                        <option value="Medical">Medical</option>
                        <option value="Arts">Arts</option>
                        <option value="Commerce">Commerce</option>
                    </select>
                    <select value={studentState} onChange={(e) => setStudentState(e.target.value)} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="">Select State...</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Karnataka">Karnataka</option>
                    </select>
                     <select value={studentIncome} onChange={(e) => setStudentIncome(e.target.value)} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="">Select Income Level...</option>
                        <option value="low">Low Income Family</option>
                        <option value="middle">Middle Income Family</option>
                    </select>
                </div>
                <div className="text-center mt-6">
                    <Button onClick={handleFindScholarships} disabled={isLoading}>
                        {isLoading ? 'Agent is Researching...' : 'Recommend Scholarships'}
                    </Button>
                </div>
            </Card>

            {/* Loading State */}
            {isLoading && (
                 <div className="text-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Agent is using your details to search...</p>
                 </div>
            )}
            
            {/* Error State */}
            {error && (
                <Card>
                    <p className="text-red-500 text-center font-semibold">{error}</p>
                </Card>
            )}

            {/* Agent Response Display */}
            {agentResponse && (
                <div>
                    <Card className="bg-blue-50 dark:bg-blue-900/30 mb-6">
                        <h2 className="text-lg font-semibold mb-2">Agent's Summary:</h2>
                        <p className="text-gray-800 dark:text-gray-200">{agentResponse.summary}</p>
                    </Card>

                    {agentResponse.scholarships && agentResponse.scholarships.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Recommended Scholarships:</h2>
                            {agentResponse.scholarships.map((scholarship, index) => <ScholarshipCard key={index} scholarship={scholarship} />)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScholarshipAgentPage;
