'use client';
import React, { useState, useEffect, useRef } from 'react';
import { IconChat, IconSend, IconClose } from '../common/Icons';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'ai', text: 'Hello! How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { from: 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        // AI Response Simulation
        setTimeout(() => {
            setMessages(prev => [...prev, { from: 'ai', text: 'Thinking...' }]);
            setTimeout(() => {
                 setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { from: 'ai', text: `I've received your message about: "${input}". Let me process that.`};
                    return updated;
                 });
            }, 1500);
        }, 500);
    };

    return (
        <>
            <div className={cn("fixed bottom-6 right-6 z-50 transition-transform duration-300", isOpen ? "scale-0" : "scale-100")}>
                <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all">
                    <IconChat className="h-8 w-8" />
                </button>
            </div>
            <div className={cn(
                "fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right",
                isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
            )}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Academia Nexus AI</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
                        <IconClose className="h-6 w-6" />
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={cn("flex", msg.from === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={cn(
                                    "max-w-xs md:max-w-sm rounded-2xl px-4 py-2",
                                    msg.from === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything..."
                            className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shrink-0">
                            <IconSend className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatWidget;
