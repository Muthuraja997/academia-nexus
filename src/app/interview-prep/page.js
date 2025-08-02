'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// The Interview Prep page component.
const InterviewPrepPage = () => {
    const { user } = useAuth();
    const { testResults: contextTestResults } = useData();
    // Helper function to safely render feedback items
    const renderFeedbackItem = (item) => {
        if (typeof item === 'string') {
            return item;
        }
        if (typeof item === 'object' && item !== null) {
            // Handle object with step, action, details properties
            if (item.step || item.action || item.details) {
                return `${item.step || ''} ${item.action || ''} ${item.details || ''}`.trim();
            }
            // Handle other object structures
            return Object.values(item).filter(Boolean).join(' ').trim() || JSON.stringify(item);
        }
        return String(item);
    };

    // State to manage form inputs, loading state, and results.
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [questions, setQuestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [allTestResults, setAllTestResults] = useState([]); // Changed to array for multiple results
    
    // Multiple previous year questions management
    const [allPreviousYearQuestions, setAllPreviousYearQuestions] = useState([]);
    const [previousYearQuestions, setPreviousYearQuestions] = useState(null);
    const [showPreviousQuestions, setShowPreviousQuestions] = useState(false);
    const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
    
    // Multiple programming questions management
    const [allProgrammingQuestions, setAllProgrammingQuestions] = useState([]);
    const [programmingQuestions, setProgrammingQuestions] = useState(null);
    const [showProgrammingQuestions, setShowProgrammingQuestions] = useState(false);
    const [isLoadingProgramming, setIsLoadingProgramming] = useState(false);
    
    // Load test results and saved data
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        // Load existing test results from localStorage
        const storedResults = localStorage.getItem(`interviewTestResults_${user?.id}`);
        if (storedResults) {
            try {
                setAllTestResults(JSON.parse(storedResults));
            } catch (error) {
                console.error('Error parsing stored test results:', error);
                setAllTestResults([]);
            }
        }

        // Load existing previous year questions from localStorage
        const storedPreviousQuestions = typeof window !== 'undefined' ? localStorage.getItem(`interviewPreviousQuestions_${user?.id}`) : null;
        if (storedPreviousQuestions) {
            try {
                setAllPreviousYearQuestions(JSON.parse(storedPreviousQuestions));
            } catch (error) {
                console.error('Error parsing stored previous questions:', error);
                setAllPreviousYearQuestions([]);
            }
        }

        // Load existing programming questions from localStorage
        const storedProgrammingQuestions = typeof window !== 'undefined' ? localStorage.getItem(`interviewProgrammingQuestions_${user?.id}`) : null;
        if (storedProgrammingQuestions) {
            try {
                setAllProgrammingQuestions(JSON.parse(storedProgrammingQuestions));
            } catch (error) {
                console.error('Error parsing stored programming questions:', error);
                setAllProgrammingQuestions([]);
            }
        }

        // Check for new test results from test completion
        const hasNewResults = typeof window !== 'undefined' ? localStorage.getItem('hasNewTestResults') : null;
        if (hasNewResults === 'true') {
            const newResults = typeof window !== 'undefined' ? localStorage.getItem('testResults') : null;
            if (newResults) {
                try {
                    const parsedNewResults = JSON.parse(newResults);
                    // Add new results to existing results
                    setAllTestResults(prev => {
                        const updated = [parsedNewResults, ...prev];
                        // Save to localStorage
                        if (user?.id && typeof window !== 'undefined') {
                            localStorage.setItem(`interviewTestResults_${user.id}`, JSON.stringify(updated));
                        }
                        return updated;
                    });
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('hasNewTestResults');
                        localStorage.removeItem('testResults');
                    }
                } catch (error) {
                    console.error('Error parsing new test results:', error);
                }
            }
        }
        
        // Load saved company and role
        const savedCompany = typeof window !== 'undefined' ? localStorage.getItem('interviewCompany') : null;
        const savedRole = typeof window !== 'undefined' ? localStorage.getItem('interviewRole') : null;
        if (savedCompany) setCompany(savedCompany);
        if (savedRole) setRole(savedRole);
    }, [user?.id]);

    // Function to simulate generating questions.
    const handleGenerate = () => {
        if (!company || !role) return;
        setIsLoading(true);
        setQuestions(null);
        
        // Save company and role to localStorage for test agent
        if (typeof window !== 'undefined') {
            localStorage.setItem('interviewCompany', company);
            localStorage.setItem('interviewRole', role);
        }
        
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

    // Function to delete a specific test result
    const deleteTestResult = (index) => {
        if (window.confirm('Are you sure you want to delete this test result?')) {
            setAllTestResults(prev => {
                const updated = prev.filter((_, i) => i !== index);
                // Update localStorage
                if (user?.id && typeof window !== 'undefined') {
                    localStorage.setItem(`interviewTestResults_${user.id}`, JSON.stringify(updated));
                }
                return updated;
            });
        }
    };

    // Function to clear all test results
    const clearAllTestResults = () => {
        if (window.confirm('Are you sure you want to delete all test results? This action cannot be undone.')) {
            setAllTestResults([]);
            if (user?.id && typeof window !== 'undefined') {
                localStorage.removeItem(`interviewTestResults_${user.id}`);
            }
        }
    };

    // Function to delete a specific previous year questions set
    const deletePreviousYearQuestions = (index) => {
        if (window.confirm('Are you sure you want to delete this previous year questions set?')) {
            setAllPreviousYearQuestions(prev => {
                const updated = prev.filter((_, i) => i !== index);
                // Update localStorage
                if (user?.id && typeof window !== 'undefined') {
                    localStorage.setItem(`interviewPreviousQuestions_${user.id}`, JSON.stringify(updated));
                }
                return updated;
            });
        }
    };

    // Function to clear all previous year questions
    const clearAllPreviousYearQuestions = () => {
        if (window.confirm('Are you sure you want to delete all previous year questions? This action cannot be undone.')) {
            setAllPreviousYearQuestions([]);
            if (user?.id && typeof window !== 'undefined') {
                localStorage.removeItem(`interviewPreviousQuestions_${user.id}`);
            }
        }
    };

    // Function to delete a specific programming questions set
    const deleteProgrammingQuestions = (index) => {
        if (window.confirm('Are you sure you want to delete this programming questions set?')) {
            setAllProgrammingQuestions(prev => {
                const updated = prev.filter((_, i) => i !== index);
                // Update localStorage
                if (user?.id && typeof window !== 'undefined') {
                    localStorage.setItem(`interviewProgrammingQuestions_${user.id}`, JSON.stringify(updated));
                }
                return updated;
            });
        }
    };

    // Function to clear all programming questions
    const clearAllProgrammingQuestions = () => {
        if (window.confirm('Are you sure you want to delete all programming questions? This action cannot be undone.')) {
            setAllProgrammingQuestions([]);
            if (user?.id && typeof window !== 'undefined') {
                localStorage.removeItem(`interviewProgrammingQuestions_${user.id}`);
            }
        }
    };

    // Function to fetch both previous year questions and programming questions
    const handleGetAllQuestions = async () => {
        if (!company || !role) {
            alert('Please enter company and role first');
            return;
        }
        
        // Start both requests simultaneously
        setIsLoadingPrevious(true);
        setIsLoadingProgramming(true);
        
        try {
            // Fetch both types of questions in parallel
            const [previousResponse, programmingResponse] = await Promise.all([
                fetch('http://localhost:8080/getPreviousYearQuestions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ company, role })
                }),
                fetch('http://localhost:8080/getProgrammingQuestions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ company, role })
                })
            ]);

            let successCount = 0;
            let errorMessages = [];

            // Process previous year questions
            if (previousResponse.ok) {
                const previousData = await previousResponse.json();
                if (previousData.success) {
                    setPreviousYearQuestions(previousData.questions);
                    setShowPreviousQuestions(true);
                    successCount++;
                    
                    // Store in persistent array with metadata
                    const questionsWithMetadata = {
                        id: Date.now(),
                        timestamp: new Date().toISOString(),
                        company,
                        role,
                        questions: previousData.questions
                    };
                    
                    setAllPreviousYearQuestions(prev => {
                        const updated = [questionsWithMetadata, ...prev].slice(0, 10); // Keep last 10
                        if (user?.id && typeof window !== 'undefined') {
                            localStorage.setItem(`interviewPreviousQuestions_${user.id}`, JSON.stringify(updated));
                        }
                        return updated;
                    });
                } else {
                    errorMessages.push('Failed to get previous year questions');
                }
            } else {
                errorMessages.push(`Previous year questions server error: ${previousResponse.status}`);
            }

            // Process programming questions
            if (programmingResponse.ok) {
                const programmingData = await programmingResponse.json();
                if (programmingData.success) {
                    setProgrammingQuestions(programmingData.questions);
                    setShowProgrammingQuestions(true);
                    successCount++;
                    
                    // Store in persistent array with metadata
                    const programmingQuestionsWithMetadata = {
                        id: Date.now() + 1, // Ensure unique ID
                        timestamp: new Date().toISOString(),
                        company,
                        role,
                        questions: programmingData.questions
                    };
                    
                    setAllProgrammingQuestions(prev => {
                        const updated = [programmingQuestionsWithMetadata, ...prev].slice(0, 10); // Keep last 10
                        if (user?.id && typeof window !== 'undefined') {
                            localStorage.setItem(`interviewProgrammingQuestions_${user.id}`, JSON.stringify(updated));
                        }
                        return updated;
                    });
                } else {
                    errorMessages.push('Failed to get programming questions');
                }
            } else {
                errorMessages.push(`Programming questions server error: ${programmingResponse.status}`);
            }

            // Show appropriate message based on results
            if (successCount === 0) {
                alert('Failed to fetch any questions. Please check if the server is running and try again.\n\nErrors:\n' + errorMessages.join('\n'));
            } else if (successCount === 1) {
                alert('Partially successful: One type of questions loaded successfully, but there were issues with the other.\n\nErrors:\n' + errorMessages.join('\n'));
            }
            // If successCount === 2, both loaded successfully, no alert needed

        } catch (error) {
            console.error('Error fetching questions:', error);
            alert(`Network error: Unable to connect to the server. Please ensure the backend server is running on http://localhost:8080\n\nError details: ${error.message}`);
        } finally {
            setIsLoadingPrevious(false);
            setIsLoadingProgramming(false);
        }
    };

    // Function to fetch previous year questions
    const handleGetPreviousQuestions = async () => {
        if (!company || !role) {
            alert('Please enter company and role first');
            return;
        }
        
        setIsLoadingPrevious(true);
        try {
            const response = await fetch('http://localhost:8080/getPreviousYearQuestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company, role })
            });
            
            const data = await response.json();
            if (data.success) {
                setPreviousYearQuestions(data.questions);
                setShowPreviousQuestions(true);
                
                // Store in persistent array with metadata
                const questionsWithMetadata = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    company,
                    role,
                    questions: data.questions
                };
                
                setAllPreviousYearQuestions(prev => {
                    const updated = [questionsWithMetadata, ...prev].slice(0, 10); // Keep last 10
                    if (user?.id && typeof window !== 'undefined') {
                        localStorage.setItem(`interviewPreviousQuestions_${user.id}`, JSON.stringify(updated));
                    }
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error fetching previous questions:', error);
            alert('Failed to fetch previous year questions. Please try again.');
        } finally {
            setIsLoadingPrevious(false);
        }
    };

    // Function to fetch programming questions
    const handleGetProgrammingQuestions = async () => {
        if (!company || !role) {
            alert('Please enter company and role first');
            return;
        }
        
        setIsLoadingProgramming(true);
        try {
            const response = await fetch('http://localhost:8080/getProgrammingQuestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company, role })
            });
            
            const data = await response.json();
            if (data.success) {
                setProgrammingQuestions(data.questions);
                setShowProgrammingQuestions(true);
                
                // Store in persistent array with metadata
                const questionsWithMetadata = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    company,
                    role,
                    questions: data.questions
                };
                
                setAllProgrammingQuestions(prev => {
                    const updated = [questionsWithMetadata, ...prev].slice(0, 10); // Keep last 10
                    if (user?.id && typeof window !== 'undefined') {
                        localStorage.setItem(`interviewProgrammingQuestions_${user.id}`, JSON.stringify(updated));
                    }
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error fetching programming questions:', error);
            alert('Failed to fetch programming questions. Please try again.');
        } finally {
            setIsLoadingProgramming(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Interview Prep</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Get tailored questions for your next interview.</p>
            
            {/* Test Results Section */}
            {allTestResults.length > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-green-600">🎉 Test Results ({allTestResults.length})</h2>
                        <Button 
                            onClick={clearAllTestResults} 
                            variant="outline" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                            Clear All Results
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {allTestResults.map((testResult, resultIndex) => (
                            <Card key={resultIndex} className="p-6 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {testResult.test_title}
                                        <span className="text-sm text-gray-500 ml-2">
                                            ({testResult.company} - {testResult.role})
                                        </span>
                                    </h3>
                                    <Button 
                                        onClick={() => deleteTestResult(resultIndex)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                        🗑️ Delete
                                    </Button>
                                </div>
                                
                                <div className="text-xs text-gray-500 mb-4">
                                    Completed: {new Date(testResult.timestamp).toLocaleString()}
                                </div>

                                {/* Score Summary */}
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <div className="text-3xl font-bold text-blue-600">{testResult.score_percentage.toFixed(1)}%</div>
                                        <div className="text-sm text-gray-600">Final Score</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg text-center">
                                        <div className="text-3xl font-bold text-green-600">{testResult.correct_answers}</div>
                                        <div className="text-sm text-gray-600">Correct Answers</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <div className="text-3xl font-bold text-gray-600">{testResult.total_questions}</div>
                                        <div className="text-sm text-gray-600">Total Questions</div>
                                    </div>
                                </div>

                                {/* Collapsible Detailed Review */}
                                <details className="mb-6">
                                    <summary className="cursor-pointer text-lg font-semibold mb-4 hover:text-blue-600">
                                        📝 View Detailed Answer Review
                                    </summary>
                                    <div className="space-y-4 mt-4">
                                        {testResult.answers.map((answer, index) => (
                                            <Card key={index} className={`p-4 border-l-4 ${answer.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                                <div className="mb-2">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${answer.is_correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                        {answer.category}
                                                    </span>
                                                    <span className={`ml-2 text-xs font-semibold px-2 py-1 rounded ${answer.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                        {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                                                    </span>
                                                </div>
                                                
                                                <h4 className="font-semibold text-gray-800 mb-2">{answer.question_text}</h4>
                                                
                                                <div className="space-y-2 text-sm">
                                                    <div className={`p-2 rounded ${answer.is_correct ? 'bg-green-100' : 'bg-red-100'}`}>
                                                        <span className="font-medium">Your Answer: </span>
                                                        <span className={answer.is_correct ? 'text-green-700' : 'text-red-700'}>
                                                            {answer.selected_option || 'Not answered'}
                                                        </span>
                                                    </div>
                                                    
                                                    {!answer.is_correct && (
                                                        <div className="p-2 bg-green-100 rounded">
                                                            <span className="font-medium">Correct Answer: </span>
                                                            <span className="text-green-700">{answer.correct_option}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {answer.explanation && (
                                                        <div className="p-2 bg-blue-50 rounded">
                                                            <span className="font-medium">Explanation: </span>
                                                            <span className="text-blue-700">{answer.explanation}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </details>

                                {/* AI Feedback Section - Collapsible */}
                                {testResult.feedback && (
                                    <details className="mb-6">
                                        <summary className="cursor-pointer text-lg font-semibold mb-4 hover:text-blue-600">
                                            💡 View AI Feedback & Recommendations
                                        </summary>
                                        <div className="space-y-4 mt-4">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-blue-800 text-lg">Overall Performance: {testResult.feedback.overall_performance}</h4>
                                                <p className="text-blue-700 mt-2">{testResult.feedback.score_interpretation}</p>
                                            </div>

                                            {testResult.feedback.strengths && testResult.feedback.strengths.length > 0 && (
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-green-800 mb-2">✅ Your Strengths</h4>
                                                    <ul className="text-green-700 space-y-1">
                                                        {testResult.feedback.strengths.map((strength, index) => (
                                                            <li key={index} className="flex items-start">
                                                                <span className="mr-2">•</span>
                                                                <span>{renderFeedbackItem(strength)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {testResult.feedback.areas_for_improvement && testResult.feedback.areas_for_improvement.length > 0 && (
                                                <div className="bg-yellow-50 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-yellow-800 mb-2">🎯 Areas for Improvement</h4>
                                                    <ul className="text-yellow-700 space-y-1">
                                                        {testResult.feedback.areas_for_improvement.map((area, index) => (
                                                            <li key={index} className="flex items-start">
                                                                <span className="mr-2">•</span>
                                                                <span>{renderFeedbackItem(area)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {testResult.feedback.recommendations && testResult.feedback.recommendations.length > 0 && (
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-purple-800 mb-2">💡 Recommendations for {testResult.company}</h4>
                                                    <ul className="text-purple-700 space-y-1">
                                                        {testResult.feedback.recommendations.map((rec, index) => (
                                                            <li key={index} className="flex items-start">
                                                                <span className="mr-2">•</span>
                                                                <span>{renderFeedbackItem(rec)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {testResult.feedback.encouragement && (
                                                <div className="bg-pink-50 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-pink-800 mb-2">🌟 Encouragement</h4>
                                                    <p className="text-pink-700">{testResult.feedback.encouragement}</p>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                )}
                                
                                <div className="flex gap-4 mt-4">
                                    <a href="/tests" className="inline-block">
                                        <Button className="bg-blue-500 hover:bg-blue-600">
                                            Take Another Test
                                        </Button>
                                    </a>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Enter Company Name (e.g., Google)" className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Enter Job Role (e.g., Software Engineer)" className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full mb-2">
                    {isLoading ? 'Generating...' : 'Generate Questions'}
                </Button>
                <Button 
                    onClick={handleGetAllQuestions} 
                    disabled={isLoadingPrevious || isLoadingProgramming} 
                    className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                >
                    {(isLoadingPrevious || isLoadingProgramming) ? 'Loading...' : '📚💻 Get Previous Year & Programming Questions'}
                </Button>
            </Card>

            {/* Show a loading spinner while generating */}
            {isLoading && (
                 <div className="text-center mt-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Scraping and analyzing...</p>
                 </div>
            )}

            {/* Show loading for both previous year and programming questions */}
            {(isLoadingPrevious || isLoadingProgramming) && (
                 <div className="text-center mt-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-purple-600 border-r-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {isLoadingPrevious && isLoadingProgramming ? 'Fetching previous year questions and programming solutions...' :
                         isLoadingPrevious ? 'Fetching previous year questions...' :
                         'Generating programming questions and solutions...'}
                    </p>
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
                    
                    {/* Link to Test Center */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            🧪 Ready to Test Your Knowledge?
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 mb-3">
                            Practice with a company-specific assessment based on {company} and {role} position.
                        </p>
                        <a 
                            href="/tests" 
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Create Test for {company} →
                        </a>
                    </div>
                </div>
            )}

            {/* Previous Year Questions Section - Show All Saved Questions */}
            {allPreviousYearQuestions.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">📚 Previous Year Questions ({allPreviousYearQuestions.length})</h2>
                        <div className="flex gap-2">
                            {allProgrammingQuestions.length > 0 && (
                                <Button 
                                    onClick={() => document.getElementById('programming-section').scrollIntoView({ behavior: 'smooth' })}
                                    className="text-sm bg-green-600 hover:bg-green-700"
                                >
                                    Go to Programming Questions ↓
                                </Button>
                            )}
                            <Button 
                                onClick={clearAllPreviousYearQuestions}
                                variant="outline"
                                className="text-sm text-red-600 border-red-600 hover:bg-red-50"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                    
                    <div className="space-y-8">
                        {allPreviousYearQuestions.map((questionSet, setIndex) => (
                            <div key={questionSet.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {questionSet.company} - {questionSet.role}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Fetched: {new Date(questionSet.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => deletePreviousYearQuestions(setIndex)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                        🗑️ Delete
                                    </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {questionSet.questions.questions.map((item, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="mb-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex gap-2">
                                                        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                            {item.category}
                                                        </span>
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                            item.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                                                            item.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-red-100 text-red-600'
                                                        }`}>
                                                            {item.difficulty}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{item.year_range}</span>
                                                </div>
                                                <h4 className="font-semibold text-lg text-gray-800 mb-2">{item.question}</h4>
                                                <p className="text-gray-600 mb-3">{item.answer}</p>
                                                
                                                {item.additional_info && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-sm text-blue-800"><strong>Additional Info:</strong> {item.additional_info}</p>
                                                    </div>
                                                )}
                                                
                                                {item.tips && item.tips.length > 0 && (
                                                    <div className="mt-3">
                                                        <h5 className="text-sm font-semibold text-gray-700 mb-1">💡 Tips:</h5>
                                                        <ul className="text-sm text-gray-600 list-disc pl-5">
                                                            {item.tips.map((tip, tipIndex) => (
                                                                <li key={tipIndex}>{tip}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Previous Year Questions Section - Show when just fetched */}
            {showPreviousQuestions && previousYearQuestions && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">📚 Latest Previous Year Questions - {previousYearQuestions.company}</h2>
                        <div className="flex gap-2">
                            {showProgrammingQuestions && (
                                <Button 
                                    onClick={() => document.getElementById('programming-section').scrollIntoView({ behavior: 'smooth' })}
                                    className="text-sm bg-green-600 hover:bg-green-700"
                                >
                                    Go to Programming Questions ↓
                                </Button>
                            )}
                            <Button 
                                onClick={() => setShowPreviousQuestions(false)}
                                variant="secondary"
                                className="text-sm"
                            >
                                Hide Latest Questions
                            </Button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {previousYearQuestions.questions.map((item, index) => (
                            <Card key={index} className="p-6">
                                <div className="mb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                {item.category}
                                            </span>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                item.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                                                item.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                                {item.difficulty}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">{item.year_range}</span>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-3">
                                        Q{index + 1}: {item.question}
                                    </h3>
                                </div>

                                {/* Ideal Answer */}
                                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                                        ✅ Ideal Answer:
                                    </h4>
                                    <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                                        {item.ideal_answer}
                                    </p>
                                </div>

                                {/* Key Points */}
                                {item.key_points && item.key_points.length > 0 && (
                                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                            🎯 Key Points to Cover:
                                        </h4>
                                        <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                                            {item.key_points.map((point, pointIndex) => (
                                                <li key={pointIndex} className="flex items-start">
                                                    <span className="mr-2 mt-1">•</span>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Follow-up Questions */}
                                {item.follow_up_questions && item.follow_up_questions.length > 0 && (
                                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                                            🔄 Possible Follow-up Questions:
                                        </h4>
                                        <ul className="text-orange-700 dark:text-orange-300 text-sm space-y-1">
                                            {item.follow_up_questions.map((followUp, followUpIndex) => (
                                                <li key={followUpIndex} className="flex items-start">
                                                    <span className="mr-2 mt-1">•</span>
                                                    <span>{followUp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>

                    {/* Summary Card */}
                    <Card className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                        <div className="text-center">
                            <h3 className="font-bold text-lg mb-2">
                                📊 Questions Summary
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="font-semibold text-purple-600">Total Questions</div>
                                    <div className="text-xl font-bold">{previousYearQuestions.total_questions}</div>
                                </div>
                                <div>
                                    <div className="font-semibold text-green-600">Easy</div>
                                    <div className="text-xl font-bold">
                                        {previousYearQuestions.questions.filter(q => q.difficulty === 'Easy').length}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold text-yellow-600">Medium</div>
                                    <div className="text-xl font-bold">
                                        {previousYearQuestions.questions.filter(q => q.difficulty === 'Medium').length}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold text-red-600">Hard</div>
                                    <div className="text-xl font-bold">
                                        {previousYearQuestions.questions.filter(q => q.difficulty === 'Hard').length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

          {/* All Programming Questions Section - Show All Saved Questions */}
          {allProgrammingQuestions.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">💻 All Programming Questions ({allProgrammingQuestions.length})</h2>
                <div className="flex gap-2">
                  <Button 
                    onClick={clearAllProgrammingQuestions}
                    variant="outline"
                    className="text-sm text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-8">
                {allProgrammingQuestions.map((questionSet, setIndex) => (
                  <div key={questionSet.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {questionSet.company} - {questionSet.role}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Fetched: {new Date(questionSet.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        onClick={() => deleteProgrammingQuestions(setIndex)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                    
                    {questionSet.questions.questions && questionSet.questions.questions.length > 0 ? (
                      <div className="space-y-6">
                        <div className="text-sm text-gray-600 mb-4">
                          Total Questions: <span className="font-semibold">{questionSet.questions.total_questions}</span>
                        </div>
                        
                        {questionSet.questions.questions.map((question, index) => (
                          <div key={question.id || index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-lg font-bold text-gray-800">{question.title}</h4>
                              <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                  question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {question.difficulty}
                                </span>
                              </div>
                            </div>

                            {/* Problem Description */}
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-700 mb-2">Problem Description:</h5>
                              <p className="text-gray-600 leading-relaxed">{question.description}</p>
                            </div>

                            {/* Solution */}
                            {question.solution && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-700 mb-2">Solution:</h5>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                  <code>{question.solution}</code>
                                </pre>
                              </div>
                            )}

                            {/* Explanation */}
                            {question.explanation && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-700 mb-2">Explanation:</h5>
                                <p className="text-gray-600 leading-relaxed">{question.explanation}</p>
                              </div>
                            )}

                            {/* Time & Space Complexity */}
                            {(question.time_complexity || question.space_complexity) && (
                              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <h5 className="font-semibold text-blue-800 mb-2">Complexity Analysis:</h5>
                                {question.time_complexity && (
                                  <p className="text-blue-700 text-sm">
                                    <strong>Time:</strong> {question.time_complexity}
                                  </p>
                                )}
                                {question.space_complexity && (
                                  <p className="text-blue-700 text-sm">
                                    <strong>Space:</strong> {question.space_complexity}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Practice Links */}
                            {question.practice_links && question.practice_links.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-700 mb-2">Practice Links:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {question.practice_links.map((link, linkIndex) => (
                                    <a 
                                      key={linkIndex} 
                                      href={link.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="bg-blue-50 p-2 rounded hover:bg-blue-100 transition-colors text-sm"
                                    >
                                      <div className="font-medium text-blue-800">{link.platform}</div>
                                      <div className="text-xs text-gray-600">{link.problem_name}</div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Tags */}
                            {question.tags && question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {question.tags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No programming questions available in this set.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programming Questions Section */}
          {showProgrammingQuestions && (
            <div id="programming-section" className="mt-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">💻 Programming Questions & Solutions</h3>
                <div className="flex gap-2">
                  {showPreviousQuestions && (
                    <Button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-sm bg-purple-600 hover:bg-purple-700"
                    >
                      ↑ Back to Previous Questions
                    </Button>
                  )}
                  <Button 
                    onClick={() => setShowProgrammingQuestions(false)}
                    variant="secondary"
                    className="text-sm"
                  >
                    Hide Questions
                  </Button>
                </div>
              </div>
              {programmingQuestions.questions && programmingQuestions.questions.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-sm text-gray-600 mb-4">
                    Company: <span className="font-semibold">{programmingQuestions.company}</span> | 
                    Role: <span className="font-semibold">{programmingQuestions.role}</span> | 
                    Total Questions: <span className="font-semibold">{programmingQuestions.total_questions}</span>
                  </div>
                  
                  {programmingQuestions.questions.map((question, index) => (
                    <div key={question.id || index} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-gray-800">{question.title}</h4>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                            {question.category}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            question.company_frequency === 'High' ? 'bg-red-100 text-red-800' :
                            question.company_frequency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {question.company_frequency} Frequency
                          </span>
                        </div>
                      </div>

                      {/* Problem Description */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Problem Description:</h5>
                        <p className="text-gray-600 mb-2">{question.description}</p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Input:</span> {question.input_format}
                          </div>
                          <div>
                            <span className="font-medium">Output:</span> {question.output_format}
                          </div>
                        </div>
                      </div>

                      {/* Examples */}
                      {question.examples && question.examples.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-700 mb-2">Examples:</h5>
                          {question.examples.map((example, exIndex) => (
                            <div key={exIndex} className="bg-gray-50 p-3 rounded mb-2">
                              <div className="text-sm">
                                <div><span className="font-medium">Input:</span> {example.input}</div>
                                <div><span className="font-medium">Output:</span> {example.output}</div>
                                <div><span className="font-medium">Explanation:</span> {example.explanation}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Solutions */}
                      <div className="mb-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Brute Force Solution */}
                          {question.brute_force_solution && (
                            <div className="bg-red-50 p-4 rounded">
                              <h5 className="font-semibold text-red-800 mb-2">Brute Force Approach</h5>
                              <p className="text-sm text-gray-600 mb-2">{question.brute_force_solution.approach}</p>
                              <pre className="bg-white p-2 rounded text-xs overflow-x-auto border">
                                <code>{question.brute_force_solution.code}</code>
                              </pre>
                              <div className="mt-2 text-xs text-gray-600">
                                <div>Time: {question.brute_force_solution.time_complexity}</div>
                                <div>Space: {question.brute_force_solution.space_complexity}</div>
                              </div>
                            </div>
                          )}

                          {/* Optimal Solution */}
                          {question.optimal_solution && (
                            <div className="bg-green-50 p-4 rounded">
                              <h5 className="font-semibold text-green-800 mb-2">Optimal Approach</h5>
                              <p className="text-sm text-gray-600 mb-2">{question.optimal_solution.approach}</p>
                              <pre className="bg-white p-2 rounded text-xs overflow-x-auto border">
                                <code>{question.optimal_solution.code}</code>
                              </pre>
                              <div className="mt-2 text-xs text-gray-600">
                                <div>Time: {question.optimal_solution.time_complexity}</div>
                                <div>Space: {question.optimal_solution.space_complexity}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Practice Links */}
                      {question.practice_links && question.practice_links.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-700 mb-2">Practice Similar Problems:</h5>
                          <div className="grid md:grid-cols-2 gap-2">
                            {question.practice_links.map((link, linkIndex) => (
                              <a 
                                key={linkIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-50 p-3 rounded hover:bg-blue-100 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium text-blue-800">{link.platform}</div>
                                    <div className="text-sm text-gray-600">{link.problem_name}</div>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    link.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                    link.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {link.difficulty}
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Questions */}
                      {question.follow_up_questions && question.follow_up_questions.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-700 mb-2">Follow-up Questions:</h5>
                          <ul className="list-disc pl-5 text-sm text-gray-600">
                            {question.follow_up_questions.map((followUp, fuIndex) => (
                              <li key={fuIndex}>{followUp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tags */}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {question.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No programming questions available.</p>
              )}
            </div>
          )}
        </div>
    );
};

export default InterviewPrepPage;
