import React, { useState, useEffect, useRef } from 'react';
import {
    sendAnalyticsMessage,
    saveAnalyticsChatHistory,
    loadAnalyticsChatHistory,
    clearAnalyticsChatHistory,
    type AnalyticsChatMessage
} from '../services/analyticsAiService';

interface AnalyticsAIChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Sparkle Icon
const SparkleIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="currentColor" />
        <path d="M19 15L19.54 17.46L22 18L19.54 18.54L19 21L18.46 18.54L16 18L18.46 17.46L19 15Z" fill="currentColor" />
        <path d="M6 14L6.36 15.64L8 16L6.36 16.36L6 18L5.64 16.36L4 16L5.64 15.64L6 14Z" fill="currentColor" />
    </svg>
);

export const AnalyticsAIChatModal: React.FC<AnalyticsAIChatModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<AnalyticsChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load chat history on mount
    useEffect(() => {
        if (isOpen) {
            const history = loadAnalyticsChatHistory();
            setMessages(history);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Save chat history when messages change
    useEffect(() => {
        if (messages.length > 0) {
            saveAnalyticsChatHistory(messages);
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: AnalyticsChatMessage = {
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await sendAnalyticsMessage(userMessage.content, messages);

            const assistantMessage: AnalyticsChatMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: AnalyticsChatMessage = {
                role: 'assistant',
                content: '❌ Sorry, something went wrong. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearHistory = () => {
        if (window.confirm('Clear chat history?')) {
            clearAnalyticsChatHistory();
            setMessages([]);
        }
    };

    // Sample questions for analytics
    const sampleQuestions = [
        "What are the most popular residential areas?",
        "Where have the most fully furnished houses?",
        "What is the average rental price?",
        "Which amenities are most common?"
    ];

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                style={{ maxHeight: 'calc(100vh - 120px)', marginTop: '60px' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SparkleIcon size={20} />
                        <div>
                            <h3 className="text-white font-bold text-sm">Analytics Assistant</h3>
                            <p className="text-white/70 text-xs">Ask about market trends & data</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                            <button
                                onClick={handleClearHistory}
                                className="text-white/70 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <SparkleIcon size={32} />
                            <h4 className="font-semibold text-slate-700 mt-3">Analytics AI Assistant</h4>
                            <p className="text-sm text-slate-500 mt-1 mb-4">
                                Ask me about market trends, area information, or chart data.
                            </p>
                            <div className="space-y-2">
                                {sampleQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setInputValue(q);
                                            inputRef.current?.focus();
                                        }}
                                        className="block w-full text-left text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-slate-600"
                                    >
                                        "{q}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-slate-100">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about analytics..."
                            className="flex-1 px-4 py-2 bg-slate-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Send
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                        Powered by DeepSeek • Analytics Mode
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsAIChatModal;
