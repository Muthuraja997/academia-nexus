'use client';
import React, { useState, useEffect, useRef } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { IconMic } from '@/components/common/Icons';

// A mapping of Speech Recognition errors to user-friendly messages.
const recognitionErrorMessages = {
  'no-speech': 'No speech was detected. Please try again.',
  'audio-capture': 'Audio capture failed. Please check your microphone settings.',
  'not-allowed': 'Microphone access was denied. Please allow microphone access in your browser settings.',
  'network': 'A network error occurred. Please check your connection.',
  'aborted': 'Recording was aborted. Please try again.'
};

// The main component for the Communication Practice page.
const CommunicationPracticePage = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState('');
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

    const recognitionRef = useRef(null);
    const currentPrompt = "Tell me about a time you had to lead a team project.";

    // Setup the SpeechRecognition API on component mount.
    useEffect(() => {
        // The Web Speech API is prefixed in some browsers.
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Sorry, your browser doesn't support speech recognition.");
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop recording after a pause.
        recognition.interimResults = false; // We only want the final result.
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
            setError('');
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onresult = (event) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
        };
        
        recognition.onerror = (event) => {
            setError(recognitionErrorMessages[event.error] || 'An unknown error occurred.');
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
    }, []);

    // Function to start or stop recording.
    const handleToggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setTranscript('');
            setFeedback(null);
            recognitionRef.current.start();
        }
    };

    // Function to simulate getting AI feedback.
    const getAIFeedback = () => {
        setIsLoadingFeedback(true);
        setFeedback(null);
        setTimeout(() => {
            setFeedback({
                clarity: 'Good',
                confidence: 'Excellent',
                fillerWords: ['um', 'like'],
                suggestion: 'Great job! Try to be more concise at the beginning. Your confidence was very strong throughout.'
            });
            setIsLoadingFeedback(false);
        }, 2000);
    };

    if (!isSessionActive) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Communication Practice</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Practice your interview answers, presentations, or general speaking skills. The AI will provide feedback on your clarity, confidence, and use of filler words.
                </p>
                <Button onClick={() => setIsSessionActive(true)}>Start Practice Session</Button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Practice Session</h1>
            <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">AI Prompt:</h2>
                <p className="text-xl text-gray-900 dark:text-white">{currentPrompt}</p>
            </Card>

            <div className="text-center mb-6">
                <button
                    onClick={handleToggleRecording}
                    disabled={!recognitionRef.current}
                    className={`px-6 py-4 rounded-full transition-all duration-300 flex items-center justify-center mx-auto ${
                        isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    <IconMic className="h-6 w-6 mr-2" />
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                {isRecording && <div className="mt-3 text-sm text-gray-500 animate-pulse">Recording...</div>}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            {transcript && (
                <Card className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Your Response (Transcript):</h2>
                    <p className="text-gray-700 dark:text-gray-300 italic">"{transcript}"</p>
                    <div className="text-center mt-4">
                        <Button onClick={getAIFeedback} disabled={isLoadingFeedback}>
                            {isLoadingFeedback ? 'Analyzing...' : 'Get AI Feedback'}
                        </Button>
                    </div>
                </Card>
            )}

            {feedback && (
                <Card>
                    <h2 className="text-lg font-semibold mb-4">AI Feedback:</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
                        <div>
                            <p className="text-sm text-gray-500">Clarity</p>
                            <p className="text-xl font-bold text-green-500">{feedback.clarity}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Confidence</p>
                            <p className="text-xl font-bold text-green-500">{feedback.confidence}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Filler Words</p>
                            <p className="text-xl font-bold text-yellow-500">{feedback.fillerWords.length}</p>
                        </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="font-semibold">Suggestion:</p>
                        <p>{feedback.suggestion}</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default CommunicationPracticePage;
