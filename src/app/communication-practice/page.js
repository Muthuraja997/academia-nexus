'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { IconMic } from '../../components/common/Icons';

export default function CommunicationPracticePage() {
  const { user } = useAuth();
  const { trackActivity, communicationSessions } = useData();
  
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

  const [sessionId, setSessionId] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Text-to-speech function
  const speakText = useCallback((text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any currently speaking text
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to use a female voice if available (more Alexa-like)
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen')
    );
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [speechEnabled]);

  const startSession = useCallback(async () => {
    console.log('Click startSession, studentName=', studentName);
    if (!studentName.trim()) { setError('Enter your name'); return; }
    setError(''); setIsLoading(true);
    try {
      console.log('Fetching startCommunicationSession');
      const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const res = await fetch('http://localhost:8080/startCommunicationSession', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: newSessionId, studentName: studentName })
      });
      const data = await res.json();
      console.log('startSession response data:', data);
      setSessionId(data.sessionId);
      setMessages([{ type: 'ai', text: data.aiResponse }]);
      
      // Speak the AI's greeting
      if (speechEnabled) {
        setTimeout(() => speakText(data.aiResponse), 500); // Small delay for better UX
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setError('Failed to start session');
    } finally { setIsLoading(false); }
  }, [studentName, speechEnabled, speakText]);

  const sendMessage = useCallback(async (text) => {
    if (!sessionId || !text.trim()) return;
    setMessages(ms => [...ms, { type: 'user', text }]);
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/sendMessage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId, message: text })
      });
      const data = await res.json();
      setMessages(ms => [...ms, { type: 'ai', text: data.aiResponse }]);
      
      // Speak the AI's response
      if (speechEnabled) {
        setTimeout(() => speakText(data.aiResponse), 300); // Small delay for better UX
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Message failed');
    } finally { setIsLoading(false); }
  }, [sessionId, speechEnabled, speakText]);

  const endSession = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    const sessionStartTime = Date.now();
    
    try {
      console.log('Ending session with ID:', sessionId);
      const res = await fetch('http://localhost:8080/endCommunicationSession', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json(); 
      console.log('End session response:', data);
      
      if (data.feedback) {
        setFeedback(data.feedback);
        console.log('Feedback set:', data.feedback);
        
        // Track the communication session completion
        if (user) {
          const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
          
          // Extract scores from feedback if available
          let overallScore = null;
          if (data.feedback && data.feedback.overallScore) {
            overallScore = Math.round(data.feedback.overallScore);
          }
          
          await trackActivity('communication_session_completed', {
            session_duration: sessionDuration,
            total_messages: messages.length,
            student_name: studentName,
            overall_score: overallScore,
            feedback_categories: data.feedback ? Object.keys(data.feedback).length : 0
          });
        }
      } else {
        console.warn('No feedback received in response');
        setError('No feedback received');
      }
      
      setSessionId(null);
    } catch (error) {
      console.error('Error ending session:', error);
      setError('End session failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Function to clear feedback and start a new session
  const startNewSession = useCallback(() => {
    setFeedback(null);
    setMessages([]);
    setError('');
    setTimeLeft(null);
    // Keep the student name for convenience
  }, []);

  const initRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setError('Speech API not supported'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR(); r.continuous = true; r.interimResults = true;
    r.onresult = e => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) sendMessage(final);
      setCurrentTranscript(final);
    };
    r.onerror = () => setIsRecording(false);
    r.onend = () => setIsRecording(false);
    recognitionRef.current = r;
  }, [sendMessage]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) initRecognition();
    if (isRecording) { recognitionRef.current.stop(); setIsRecording(false); }
    else { recognitionRef.current.start(); setIsRecording(true); setError(''); }
  }, [isRecording, initRecognition]);

  // Initialize session timer when session starts
  useEffect(() => {
    if (sessionId) {
      setTimeLeft(300); // 5 minutes
    } else {
      setTimeLeft(null);
    }
  }, [sessionId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || isLoading) return; // Don't end session while loading
    if (timeLeft <= 0) {
      console.log('Time up! Ending session automatically.');
      endSession();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, endSession, isLoading]);

  useEffect(() => { /* scroll to bottom if needed */ }, [messages]);

  // Initialize speech synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices - some browsers need this
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🎤 Communication Practice</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Practice your communication skills with AI-powered feedback
        </p>
        <p className="text-sm text-gray-500">
          {communicationSessions.length} sessions completed
        </p>
      </div>
      {sessionId && timeLeft !== null && (
        <div className="text-center mb-4 text-sm text-gray-600">
          Time Left: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
        </div>
      )}
      { !sessionId ? (
        <Card className="p-4 mb-6">
          {/* Show validation or fetch errors */}
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="Your name"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
          />
          <Button onClick={startSession} disabled={isLoading}>{isLoading ? 'Starting…' : 'Start Session'}</Button>
        </Card>
      ) : (
        <Card className="p-4 mb-6">
          {/* Conversation header with End button */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Conversation</h2>
            <Button onClick={endSession}>End Session</Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-auto mb-4">
            {messages.map((m,i) => (
              <div key={i} className={m.type==='user' ? 'text-right':'text-left'}>
                <p className="text-xs text-gray-500 mb-1">{m.type === 'user' ? 'Student' : 'Alexa'}</p>
                <span className={`inline-block p-2 rounded ${m.type==='user'? 'bg-blue-500 text-white':'bg-gray-100'}`}>{m.text}</span>
              </div>
            ))}
            {isLoading && <p>AI is typing…</p>}
            {isSpeaking && <p className="text-blue-600 italic">🔊 AI is speaking...</p>}
          </div>
          <div className="flex space-x-2">
            <Button onClick={toggleRecording}><IconMic className="inline w-5 h-5"/> {isRecording?'Stop':'Speak'}</Button>
            <Button 
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={speechEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}
            >
              🔊 AI Speech: {speechEnabled ? 'ON' : 'OFF'}
            </Button>
            {isSpeaking && (
              <Button 
                onClick={() => window.speechSynthesis.cancel()}
                className="bg-red-500 hover:bg-red-600"
              >
                🛑 Stop Speaking
              </Button>
            )}
          </div>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </Card>
      )}
      {feedback && (
        <Card className="p-4 mt-4">
          <h2 className="font-bold mb-4 text-xl">📝 Communication Feedback</h2>
          
          {feedback.error ? (
            <p className="text-red-600">{feedback.error}</p>
          ) : (
            <div className="space-y-4">
              {/* Overall Performance */}
              <div className="bg-blue-50 p-3 rounded">
                <h3 className="font-semibold text-blue-800">Overall Performance: {feedback.overall_performance}</h3>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedback.clarity && (
                  <div className="bg-green-50 p-3 rounded">
                    <h4 className="font-semibold text-green-800">🎯 Clarity: {feedback.clarity.score}</h4>
                    <p className="text-sm text-green-700 mt-1">{feedback.clarity.feedback}</p>
                  </div>
                )}
                
                {feedback.confidence && (
                  <div className="bg-purple-50 p-3 rounded">
                    <h4 className="font-semibold text-purple-800">💪 Confidence: {feedback.confidence.score}</h4>
                    <p className="text-sm text-purple-700 mt-1">{feedback.confidence.feedback}</p>
                  </div>
                )}
                
                {feedback.engagement && (
                  <div className="bg-orange-50 p-3 rounded">
                    <h4 className="font-semibold text-orange-800">🤝 Engagement: {feedback.engagement.score}</h4>
                    <p className="text-sm text-orange-700 mt-1">{feedback.engagement.feedback}</p>
                  </div>
                )}
                
                {feedback.conversation_flow && (
                  <div className="bg-teal-50 p-3 rounded">
                    <h4 className="font-semibold text-teal-800">🌊 Flow: {feedback.conversation_flow.score}</h4>
                    <p className="text-sm text-teal-700 mt-1">{feedback.conversation_flow.feedback}</p>
                  </div>
                )}
              </div>

              {/* Strengths */}
              {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Strengths</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{renderFeedbackItem(strength)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {feedback.areas_for_improvement && feedback.areas_for_improvement.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-2">🎯 Areas for Improvement</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {feedback.areas_for_improvement.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{renderFeedbackItem(area)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Suggestions</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {feedback.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{renderFeedbackItem(suggestion)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Encouragement */}
              {feedback.encouragement && (
                <div className="bg-pink-50 p-3 rounded">
                  <h4 className="font-semibold text-pink-800 mb-2">🌟 Encouragement</h4>
                  <p className="text-sm text-pink-700">{feedback.encouragement}</p>
                </div>
              )}

              {/* Fallback for simple feedback */}
              {feedback.overall_feedback && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-700">{feedback.overall_feedback}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Start New Session Button */}
          <div className="mt-4 text-center">
            <Button onClick={startNewSession} className="bg-blue-500 hover:bg-blue-600">
              🚀 Start New Session
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
