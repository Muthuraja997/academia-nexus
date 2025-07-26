'use client';
import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// This component now fetches and displays data directly from a local JSON file
// located in the `public` folder, removing the need for a Python backend.
const ScholarshipPage = () => {
    // State hooks to manage the data from the JSON file.
    const [scholarshipList, setScholarshipList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect hook runs once when the component mounts to fetch the data.
    useEffect(() => {
        const fetchScholarshipsFromFile = async () => {
            try {
                // Fetch the JSON file directly from the `public` folder.
                // The browser knows to look in `public` for this path.
                const response = await fetch('scholarships_output.json');
                
                if (!response.ok) {
                    throw new Error('Failed to load the scholarship file. Make sure `scholarships_output.json` is in the `public` folder.');
                }
                
                const data = await response.json();
                // Assuming the JSON file is an array of scholarships
                setScholarshipList(data);

            } catch (error) {
                console.error("Failed to fetch scholarships:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchScholarshipsFromFile();
    }, []); // The empty array [] ensures this effect runs only once.

    // A reusable component to display each scholarship card.
    const ScholarshipCard = ({ scholarship }) => (
         <Card className="hover:border-blue-500 border-2 border-transparent mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="flex-1 mb-4 sm:mb-0 sm:mr-4">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{scholarship.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs mt-2">
                        {scholarship.funded_by && <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">Funder: {scholarship.funded_by}</span>}
                        {scholarship.target_group && <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">Target: {scholarship.target_group}</span>}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-3"><b className="text-gray-900 dark:text-gray-100">Eligibility:</b> {scholarship.eligibility}</p>
                </div>
                {scholarship.link && (
                    <a href={scholarship.link} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full">Apply / View Details</Button>
                    </a>
                )}
            </div>
        </Card>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Available Scholarships</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Displaying all scholarships from our database.</p>

            {/* Conditionally render the loading spinner */}
            {isLoading && (
                 <div className="text-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading scholarships from file...</p>
                 </div>
            )}
            
            {/* Conditionally render any error messages */}
            {error && (
                <Card>
                    <p className="text-red-500 text-center font-semibold">{error}</p>
                </Card>
            )}

            {/* Conditionally render the list of scholarships once loaded */}
            {!isLoading && !error && scholarshipList.length > 0 && (
                <div>
                    {scholarshipList.map((scholarship, index) => <ScholarshipCard key={index} scholarship={scholarship} />)}
                </div>
            )}
        </div>
    );
};

export default ScholarshipPage;
