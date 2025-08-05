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
import { IconChat, IconSend, IconClose } from '../common/Icons';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            from: 'ai', 
            text: '👋 Hello! I\'m your Academia Nexus AI Assistant. How can I help you with scholarships, career planning, or communication practice today?',
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Simulate typing indicator
    const simulateTyping = (callback, delay = 1000) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            callback();
        }, delay);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { 
            from: 'user', 
            text: input,
            timestamp: new Date().toISOString()
        };
        
        // Add user message immediately
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            // Simulate AI thinking with typing indicator
            simulateTyping(async () => {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        history: [...messages, userMessage],
                        message: currentInput 
                    })
                });

                if (!response.ok) {
                    throw new Error('API request failed');
                }

                const data = await response.json();
                
                // Add AI response
                setMessages(prev => [...prev, { 
                    from: 'ai', 
                    text: data.text,
                    timestamp: data.timestamp
                }]);
                setIsLoading(false);
            });

        } catch (error) {
            console.error("Failed to get AI response:", error);
            setMessages(prev => [...prev, { 
                from: 'ai', 
                text: 'Sorry, I encountered an error. Please try again! 🔄',
                timestamp: new Date().toISOString()
            }]);
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const TypingIndicator = () => (
        <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none px-4 py-2 max-w-xs">
                <div className="flex items-center space-x-1">
                    <div className="text-sm">Assistant is typing</div>
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const QuickActions = () => (
        <div className="flex flex-wrap gap-2 mb-4">
            <button 
                onClick={() => setInput("Help me find scholarships")}
                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
                🎓 Find Scholarships
            </button>
            <button 
                onClick={() => setInput("Career guidance please")}
                className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            >
                🚀 Career Help
            </button>
            <button 
                onClick={() => setInput("Help me practice communication")}
                className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            >
                🗣️ Practice Speaking
            </button>
        </div>
    );

    return (
        <>
            {/* Chat Toggle Button with Notification Indicator */}
            <div className={cn("fixed bottom-6 right-6 z-50 transition-transform duration-300", isOpen ? "scale-0" : "scale-100")}>
                <div className="relative">
                    <button 
                        onClick={() => setIsOpen(true)} 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                        <IconChat className="h-8 w-8" />
                    </button>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <div className={cn(
                "fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-md h-[75vh] max-h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right border border-gray-200 dark:border-gray-700",
                isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <h3 className="font-bold text-lg">Academia Nexus AI</h3>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <IconClose className="h-6 w-6" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="space-y-4">
                        {/* Quick Actions (shown only at the start) */}
                        {messages.length <= 1 && <QuickActions />}
                        
                        {messages.map((msg, index) => (
                            <div key={index} className={cn("flex", msg.from === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={cn(
                                    "max-w-xs md:max-w-sm rounded-2xl px-4 py-3 shadow-sm",
                                    msg.from === 'user' 
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none' 
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                                )}>
                                    <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                                    {msg.timestamp && (
                                        <div className={cn(
                                            "text-xs mt-1 opacity-70",
                                            msg.from === 'user' ? 'text-white/70' : 'text-gray-500'
                                        )}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && <TypingIndicator />}
                        
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything about scholarships, careers, or communication..."
                            disabled={isLoading}
                            className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 border border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 text-sm"
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={isLoading || !input.trim()} 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                        >
                            <IconSend className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                        Powered by Academia Nexus AI Assistant
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatWidget;