'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// The Career Trajectory page component with intelligent predictions
const CareerPathPage = () => {
    const { user } = useAuth();
    const [predictions, setPredictions] = useState([]);
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchCareerPredictions();
        }
    }, [user]);

    const fetchCareerPredictions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/career/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch career predictions');
            }

            const data = await response.json();
            setPredictions(data.predictions || []);
            setSelectedCareer(data.predictions?.[0] || null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching career predictions:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMatchColor = (score) => {
        if (score >= 80) return 'bg-green-600';
        if (score >= 60) return 'bg-blue-600';
        if (score >= 40) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    const getConfidenceColor = (confidence) => {
        switch (confidence) {
            case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Unable to Load Predictions</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <Button onClick={fetchCareerPredictions}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">AI-Powered Career Trajectory</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Confidence:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(predictions[0]?.confidence)}`}>
                        {predictions[0]?.confidence?.toUpperCase() || 'LOW'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main predictions chart */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Career Match Analysis</h2>
                            <Button variant="outline" size="sm" onClick={fetchCareerPredictions}>
                                Refresh
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            {predictions.slice(0, 5).map((prediction, index) => (
                                <div 
                                    key={prediction.career}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedCareer?.career === prediction.career 
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                                    onClick={() => setSelectedCareer(prediction)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">#{index + 1}</span>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {prediction.career}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    ${prediction.avgSalary?.toLocaleString()} avg • {prediction.growth} growth
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {prediction.matchScore}%
                                            </span>
                                            <p className="text-xs text-gray-500">match</p>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className={`h-3 rounded-full ${getMatchColor(prediction.matchScore)}`}
                                            style={{ width: `${prediction.matchScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Career Details and Skill Gap Analysis */}
                <div className="space-y-6">
                    {selectedCareer && (
                        <>
                            {/* Career Overview */}
                            <Card>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                    {selectedCareer.career} Overview
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {selectedCareer.description}
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Average Salary:</span>
                                        <span className="font-medium">${selectedCareer.avgSalary?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Growth Outlook:</span>
                                        <span className="font-medium">{selectedCareer.growth}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Top Industries:</span>
                                        <span className="font-medium">{selectedCareer.industries?.slice(0, 2).join(', ')}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Skill Gap Analysis */}
                            <Card>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    Skill Analysis
                                </h3>
                                <div className="mb-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-500">Skill Coverage</span>
                                        <span className="text-sm font-medium">{Math.round(selectedCareer.skillGaps?.coverage || 0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${selectedCareer.skillGaps?.coverage || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-green-600 mb-2">✓ Skills Demonstrated</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedCareer.skillGaps?.demonstrated?.map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                                                    {skill}
                                                </span>
                                            )) || <span className="text-xs text-gray-500">None yet</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-orange-600 mb-2">⚡ Skills to Develop</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedCareer.skillGaps?.missing?.map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded">
                                                    {skill}
                                                </span>
                                            )) || <span className="text-xs text-gray-500">All covered!</span>}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Recommendations */}
                            <Card>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    Personalized Recommendations
                                </h3>
                                <div className="space-y-3">
                                    {selectedCareer.recommendations?.map((rec, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                {rec.title}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                {rec.description}
                                            </p>
                                            <ul className="text-xs text-gray-500 space-y-1">
                                                {rec.actionItems?.slice(0, 2).map((item, i) => (
                                                    <li key={i}>• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full mt-4" size="sm">
                                    Get Learning Resources
                                </Button>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareerPathPage;
