// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { IconChat, IconSend, IconClose } from '../common/Icons';

// const cn = (...classes) => classes.filter(Boolean).join(' ');

// const ChatWidget = () => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [messages, setMessages] = useState([
//         { from: 'ai', text: 'Hello! How can I help you today?' }
//     ]);
//     const [input, setInput] = useState('');
//     const messagesEndRef = useRef(null);

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     useEffect(scrollToBottom, [messages]);

//     const handleSend = () => {
//         if (!input.trim()) return;
//         const newMessages = [...messages, { from: 'user', text: input }];
//         setMessages(newMessages);
//         setInput('');

//         // AI Response Simulation
//         setTimeout(() => {
//             setMessages(prev => [...prev, { from: 'ai', text: 'Thinking...' }]);
//             setTimeout(() => {
//                  setMessages(prev => {
//                     const updated = [...prev];
//                     updated[updated.length - 1] = { from: 'ai', text: `I've received your message about: "${input}". Let me process that.`};
//                     return updated;
//                  });
//             }, 1500);
//         }, 500);
//     };

//     return (
//         <>
//             <div className={cn("fixed bottom-6 right-6 z-50 transition-transform duration-300", isOpen ? "scale-0" : "scale-100")}>
//                 <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all">
//                     <IconChat className="h-8 w-8" />
//                 </button>
//             </div>
//             <div className={cn(
//                 "fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right",
//                 isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
//             )}>
//                 <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
//                     <h3 className="font-bold text-lg text-gray-800 dark:text-white">Academia Nexus AI</h3>
//                     <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
//                         <IconClose className="h-6 w-6" />
//                     </button>
//                 </div>
//                 <div className="flex-1 p-4 overflow-y-auto">
//                     <div className="space-y-4">
//                         {messages.map((msg, index) => (
//                             <div key={index} className={cn("flex", msg.from === 'user' ? 'justify-end' : 'justify-start')}>
//                                 <div className={cn(
//                                     "max-w-xs md:max-w-sm rounded-2xl px-4 py-2",
//                                     msg.from === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
//                                 )}>
//                                     {msg.text}
//                                 </div>
//                             </div>
//                         ))}
//                         <div ref={messagesEndRef} />
//                     </div>
//                 </div>
//                 <div className="p-4 border-t border-gray-200 dark:border-gray-700">
//                     <div className="flex items-center gap-2">
//                         <input
//                             type="text"
//                             value={input}
//                             onChange={(e) => setInput(e.target.value)}
//                             onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//                             placeholder="Ask me anything..."
//                             className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                         />
//                         <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shrink-0">
//                             <IconSend className="h-5 w-5" />
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default ChatWidget;

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { IconChat, IconSend, IconClose, IconSparkles, IconBulb } from '../common/Icons';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'ai', text: '🎓 Hello! I\'m your Academia Nexus AI assistant. I can help you with scholarships, career planning, study resources, and more! What would you like to explore today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([
        'Find scholarships for my major',
        'Help me plan my career path',
        'Recommend study resources'
    ]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
        setShowSuggestions(false);
        // Auto-send the suggestion
        setTimeout(() => handleSend(suggestion), 100);
    };

    const handleSend = async (messageText = null) => {
        const messageToSend = messageText || input;
        if (!messageToSend.trim() || isLoading) return;

        const userMessage = { from: 'user', text: messageToSend };
        const thinkingMessage = { from: 'ai', text: '🤔 Thinking...', isThinking: true };
        
        // Add user message and "Thinking..." placeholder immediately
        setMessages(prev => [...prev, userMessage, thinkingMessage]);
        setInput('');
        setIsLoading(true);
        setShowSuggestions(false);

        try {
            // Send the history and new message to your backend API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    history: [...messages, userMessage], // Send the full history up to the user's message
                    message: messageToSend 
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            
            // Replace "Thinking..." with the actual AI response
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { from: 'ai', text: data.text };
                return updated;
            });

            // Update suggestions if provided
            if (data.suggestions) {
                setSuggestions(data.suggestions);
                setShowSuggestions(true);
            }

        } catch (error) {
            console.error("Failed to get AI response:", error);
            // Replace "Thinking..." with an error message
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { from: 'ai', text: '❌ Sorry, I ran into an error. Please try again.' };
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Button with Enhanced Animation */}
            <div className={cn(
                "fixed bottom-6 right-6 z-50 transition-all duration-300 transform",
                isOpen ? "scale-0 rotate-180" : "scale-100 rotate-0 hover:scale-110"
            )}>
                <button 
                    onClick={() => setIsOpen(true)} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all group relative"
                >
                    <IconChat className="h-8 w-8 group-hover:animate-pulse" />
                    {/* Notification Badge */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
            </div>

            {/* Chat Widget */}
            <div className={cn(
                "fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right border border-gray-200 dark:border-gray-700",
                isOpen ? "scale-100 opacity-100 h-[70vh] max-h-[500px]" : "scale-95 opacity-0 pointer-events-none h-0"
            )}>
                {/* Header with Assistant Status */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <IconSparkles className="h-6 w-6 text-blue-600 animate-pulse" />
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Academia Nexus AI</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                {isLoading ? '🤔 Thinking...' : '✨ Ready to help'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                        <IconClose className="h-6 w-6" />
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={cn("flex", msg.from === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={cn(
                                    "max-w-xs md:max-w-sm rounded-2xl px-4 py-2 shadow-sm",
                                    msg.from === 'user' 
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none' 
                                        : msg.isThinking 
                                            ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 text-gray-800 dark:text-gray-200 rounded-bl-none animate-pulse'
                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                )}>
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Quick Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="px-4 pb-2">
                        <div className="flex items-center gap-1 mb-2">
                            <IconBulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Quick suggestions:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-all transform hover:scale-105"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about your academic journey..."
                                disabled={isLoading}
                                rows="1"
                                className="w-full p-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:opacity-50 transition-all"
                                style={{ minHeight: '44px', maxHeight: '100px' }}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                                }}
                            />
                        </div>
                        <button 
                            onClick={() => handleSend()} 
                            disabled={isLoading || !input.trim()} 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <IconSend className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                        Press Enter to send • Shift+Enter for new line
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatWidget;