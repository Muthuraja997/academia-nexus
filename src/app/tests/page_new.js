'use client';
import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const TestAgentPage = () => {
    const [isTestActive, setIsTestActive] = useState(false);
    const [currentTest, setCurrentTest] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [availableTests, setAvailableTests] = useState([]);
    
    // Test Generation Form States
    const [showCreateTest, setShowCreateTest] = useState(false);
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [testType, setTestType] = useState('technical');
    
    // Get company and role from localStorage (from interview prep page)
    useEffect(() => {
        const savedCompany = localStorage.getItem('interviewCompany');
        const savedRole = localStorage.getItem('interviewRole');
        if (savedCompany) setCompany(savedCompany);
        if (savedRole) setRole(savedRole);
    }, []);

    // Timer effect
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeLeft === 0 && isTestActive) {
            handleSubmitTest();
        }
    }, [timeLeft, isTestActive]);

    const generateTest = async () => {
        if (!company || !role) {
            alert('Please enter company and role');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/generateCompanyTest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company, role, test_type: testType })
            });
            
            const data = await response.json();
            if (data.success && data.test) {
                const newTest = {
                    ...data.test,
                    id: Date.now(),
                    created_at: new Date().toISOString()
                };
                setAvailableTests(prev => [newTest, ...prev]);
                setShowCreateTest(false);
                
                // Save to localStorage
                localStorage.setItem('interviewCompany', company);
                localStorage.setItem('interviewRole', role);
            }
        } catch (error) {
            console.error('Error generating test:', error);
            alert('Failed to generate test. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const startTest = (test) => {
        setCurrentTest(test);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setIsTestActive(true);
        setTimeLeft(test.duration_minutes * 60); // Convert to seconds
    };

    const handleAnswerSelect = (answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: answer
        }));
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < currentTest.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmitTest();
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmitTest = async () => {
        setIsLoading(true);
        
        // Calculate results
        const answers = currentTest.questions.map((question, index) => ({
            question_id: question.id,
            question_text: question.question,
            selected_answer: selectedAnswers[index],
            selected_option: question.options[selectedAnswers[index]] || 'Not answered',
            correct_answer: question.correct_answer,
            correct_option: question.options[question.correct_answer],
            is_correct: selectedAnswers[index] === question.correct_answer,
            explanation: question.explanation,
            category: question.category
        }));

        try {
            const response = await fetch('http://localhost:8080/evaluateTestResults', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers,
                    company: currentTest.company,
                    role: currentTest.role
                })
            });
            
            const results = await response.json();
            const completeResults = {
                ...results,
                answers,
                test_title: currentTest.test_title,
                company: currentTest.company,
                role: currentTest.role,
                timestamp: new Date().toISOString()
            };

            // Save results to localStorage for interview prep page
            localStorage.setItem('testResults', JSON.stringify(completeResults));
            localStorage.setItem('hasNewTestResults', 'true');
            
            // Redirect to interview prep page to show results
            window.location.href = '/interview-prep';
            
        } catch (error) {
            console.error('Error evaluating test:', error);
            alert('Failed to evaluate test results.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetTest = () => {
        setIsTestActive(false);
        setCurrentTest(null);
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        setTimeLeft(null);
    };

    // Active Test View
    if (isTestActive && currentTest) {
        const currentQuestion = currentTest.questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / currentTest.questions.length) * 100;

        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{currentTest.test_title}</h2>
                            <p className="text-gray-500">
                                Question {currentQuestionIndex + 1} of {currentTest.questions.length}
                            </p>
                        </div>
                        <div className="text-right">
                            {timeLeft !== null && (
                                <div className="text-lg font-mono">
                                    ⏰ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Question */}
                    <div className="mb-6">
                        <div className="mb-2">
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {currentQuestion.category}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
                        
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <label 
                                    key={index}
                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                        selectedAnswers[currentQuestionIndex] === index 
                                            ? 'bg-blue-50 border-2 border-blue-300' 
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name={`question-${currentQuestionIndex}`}
                                        value={index}
                                        checked={selectedAnswers[currentQuestionIndex] === index}
                                        onChange={() => handleAnswerSelect(index)}
                                        className="form-radio h-5 w-5 text-blue-600" 
                                    />
                                    <span className="ml-3 text-gray-800">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <div className="flex gap-2">
                            <Button 
                                variant="secondary" 
                                onClick={resetTest}
                                disabled={isLoading}
                            >
                                End Test
                            </Button>
                            {currentQuestionIndex > 0 && (
                                <Button 
                                    variant="secondary" 
                                    onClick={previousQuestion}
                                    disabled={isLoading}
                                >
                                    Previous
                                </Button>
                            )}
                        </div>
                        <Button 
                            onClick={nextQuestion}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined || isLoading}
                        >
                            {isLoading ? 'Loading...' : 
                             currentQuestionIndex === currentTest.questions.length - 1 ? 'Submit Test' : 'Next Question'}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Test List and Creation View
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">🧪 Test Center</h1>
                    <p className="text-gray-600">Practice with company-specific assessments</p>
                </div>
                <Button 
                    onClick={() => setShowCreateTest(true)}
                    className="bg-green-500 hover:bg-green-600"
                >
                    ➕ Create New Test
                </Button>
            </div>

            {/* Create Test Form */}
            {showCreateTest && (
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Create Company-Specific Test</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input 
                            type="text" 
                            value={company} 
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Company Name (e.g., Google, Microsoft)" 
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <input 
                            type="text" 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Job Role (e.g., Software Engineer)" 
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="mb-4">
                        <select 
                            value={testType} 
                            onChange={(e) => setTestType(e.target.value)}
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                        >
                            <option value="technical">Technical Assessment</option>
                            <option value="cultural">Cultural Fit</option>
                            <option value="mixed">Mixed (Technical + Cultural)</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={generateTest} 
                            disabled={isLoading || !company || !role}
                        >
                            {isLoading ? 'Generating...' : 'Generate Test'}
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowCreateTest(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}

            {/* Available Tests */}
            <div className="space-y-4">
                {availableTests.length === 0 ? (
                    <Card className="p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tests Available</h3>
                        <p className="text-gray-500 mb-4">Create your first company-specific test to get started!</p>
                        <Button 
                            onClick={() => setShowCreateTest(true)}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            Create Your First Test
                        </Button>
                    </Card>
                ) : (
                    availableTests.map((test) => (
                        <Card key={test.id} className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{test.test_title}</h2>
                                    <p className="text-gray-500">
                                        {test.company} • {test.role} • {test.total_questions} Questions • {test.duration_minutes} min
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Created: {new Date(test.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => startTest(test)} 
                                    className="mt-4 sm:mt-0"
                                    disabled={!test.questions || test.questions.length === 0}
                                >
                                    Start Test
                                </Button>
                            </div>
                            {test.error && (
                                <div className="mt-2 text-red-600 text-sm">
                                    ⚠️ {test.error}
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default TestAgentPage;
