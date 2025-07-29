'use client';
import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// Function to connect to scholarship server
const mcpClient = {
    async getScholarshipRecommendations(studentDetails) {
        try {
            console.log('Getting scholarship recommendations for:', studentDetails);
            const response = await fetch('http://localhost:8080/getRecommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentDetails)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server responded with status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Scholarship recommendations error:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Could not connect to scholarship server. Please ensure the server is running.');
            }
            throw error;
        }
    }
};

const ScholarshipPage = () => {
    const [scholarships, setScholarships] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [studentProfile, setStudentProfile] = useState({
        name: '',
        educationLevel: '',
        gpa: '',
        majorField: '',
        nationality: '',
        interests: '',
        achievements: ''
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const data = await mcpClient.getScholarshipRecommendations(studentProfile);
            console.log('Received scholarships:', data); // Debug log
            if (Array.isArray(data)) {
                setScholarships(data);
            } else if (data.recommendations) {
                setScholarships(data.recommendations);
            } else {
                setError('Invalid response format from server');
            }
        } catch (error) {
            console.error("Failed to get scholarships:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setStudentProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // A reusable component to display each scholarship card.
    const ScholarshipCard = ({ scholarship, analysis }) => (
        <Card className="hover:border-blue-500 border-2 border-transparent mb-4">
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="flex-1 mb-4 sm:mb-0 sm:mr-4">
                        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{scholarship.name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs mt-2">
                            {scholarship.source && (
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                    Source: {new URL(scholarship.source).hostname}
                                </span>
                            )}
                            {scholarship.deadline && (
                                <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                                    Deadline: {scholarship.deadline}
                                </span>
                            )}
                            {scholarship.amount && (
                                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                    Amount: {scholarship.amount}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mt-3">
                            <b className="text-gray-900 dark:text-gray-100">Eligibility:</b> {scholarship.eligibility}
                        </p>
                        {scholarship.full_eligibility && (
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            <b className="text-gray-900 dark:text-gray-100">Full Eligibility:</b> {scholarship.full_eligibility}
                          </p>
                        )}
                        {scholarship.documents_required && (
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            <b className="text-gray-900 dark:text-gray-100">Documents Required:</b> {scholarship.documents_required}
                          </p>
                        )}
                        {scholarship.application_process && (
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            <b className="text-gray-900 dark:text-gray-100">Application Process:</b> {scholarship.application_process}
                          </p>
                        )}
                        {scholarship.important_dates && (
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            <b className="text-gray-900 dark:text-gray-100">Important Dates:</b> {scholarship.important_dates}
                          </p>
                        )}
                    </div>
                    {scholarship.link && (
                        <a href={scholarship.link} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                            <Button variant="secondary" className="w-full">Apply Now</Button>
                        </a>
                    )}
                </div>

                {analysis && (
                    <div className="border-t pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.eligibility_match && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Eligibility Match</h4>
                                    <p className="text-sm text-gray-600">{analysis.eligibility_match}</p>
                                </div>
                            )}
                            {analysis.application_tips && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Application Tips</h4>
                                    <p className="text-sm text-gray-600">{analysis.application_tips}</p>
                                </div>
                            )}
                            {analysis.required_documents && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Required Documents</h4>
                                    <p className="text-sm text-gray-600">{analysis.required_documents}</p>
                                </div>
                            )}
                            {analysis.success_probability && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Success Probability</h4>
                                    <p className="text-sm text-gray-600">{analysis.success_probability}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {scholarship.timestamp && (
                    <div className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date(scholarship.timestamp).toLocaleString()}
                    </div>
                )}
            </div>
        </Card>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Available Scholarships</h1>
                    <p className="text-gray-500 dark:text-gray-400">Find scholarships matching your profile.</p>
                </div>
            </div>

            <Card className="mb-8">
                <h2 className="text-xl font-bold mb-4">Student Profile</h2>
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={studentProfile.name}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Education Level</label>
                            <select
                                name="educationLevel"
                                value={studentProfile.educationLevel}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="">Select Level</option>
                                <option value="High School">High School</option>
                                <option value="Undergraduate">Undergraduate</option>
                                <option value="Graduate">Graduate</option>
                                <option value="PhD">PhD</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">GPA</label>
                            <input
                                type="text"
                                name="gpa"
                                value={studentProfile.gpa}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded-lg"
                                placeholder="e.g., 3.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Major/Field of Study</label>
                            <input
                                type="text"
                                name="majorField"
                                value={studentProfile.majorField}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded-lg"
                                placeholder="e.g., Computer Science"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nationality</label>
                            <input
                                type="text"
                                name="nationality"
                                value={studentProfile.nationality}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Your nationality"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Interests/Research Areas</label>
                            <input
                                type="text"
                                name="interests"
                                value={studentProfile.interests}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded-lg"
                                placeholder="e.g., Machine Learning, Robotics"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Achievements</label>
                            <textarea
                                name="achievements"
                                value={studentProfile.achievements}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded-lg"
                                placeholder="List your academic achievements, awards, publications..."
                                rows="3"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Searching...' : 'Search Scholarships'}
                        </Button>
                    </div>
                </form>
            </Card>

            {isLoading && (
                <div className="text-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading scholarships...</p>
                </div>
            )}
            
            {/* Conditionally render any error messages */}
            {error && (
                <Card>
                    <p className="text-red-500 text-center font-semibold">{error}</p>
                </Card>
            )}

            {isLoading ? (
                <div className="text-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Searching for scholarships...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <p>{error}</p>
                </div>
            ) : scholarships.length > 0 ? (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Found Scholarships ({scholarships.length})</h2>
                    {scholarships.map((item, index) => {
                        // Support both {scholarship, analysis, ...} and flat scholarship objects
                        const scholarship = item.scholarship || item;
                        const analysis = item.analysis || null;
                        return (
                            <ScholarshipCard 
                                key={index} 
                                scholarship={scholarship} 
                                analysis={analysis}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center my-8 text-gray-500">
                    Fill in your details and click "Search Scholarships" to find matching opportunities.
                </div>
            )}
        </div>
    );
};

export default ScholarshipPage;
