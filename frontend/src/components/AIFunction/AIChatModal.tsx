import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    sendMessageToAI,
    saveChatHistory,
    loadChatHistory,
    clearChatHistory,
    type ChatMessage
} from './aiService';

interface AIChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Sparkle Icon SVG Component
export const SparkleIcon: React.FC<{ className?: string; size?: number }> = ({
    className = '',
    size = 24
}) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
            fill="currentColor"
        />
        <path
            d="M19 15L19.54 17.46L22 18L19.54 18.54L19 21L18.46 18.54L16 18L18.46 17.46L19 15Z"
            fill="currentColor"
        />
        <path
            d="M6 14L6.36 15.64L8 16L6.36 16.36L6 18L5.64 16.36L4 16L5.64 15.64L6 14Z"
            fill="currentColor"
        />
    </svg>
);

// AI Chat Button Component
export const AIChatButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="relative group p-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        title="AI Housing Assistant"
        aria-label="Open AI Chat"
    >
        <SparkleIcon size={20} className="animate-pulse" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
    </button>
);

/**
 * Parse message content and render clickable property links
 * Matches patterns like [Property Title](/property/uuid)
 */
const renderMessageContent = (content: string, onLinkClick?: () => void): React.ReactNode => {
    // Regex to match markdown-style links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = linkRegex.exec(content)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }

        const linkText = match[1];
        const linkUrl = match[2];

        // Check if it's an internal property link
        if (linkUrl.startsWith('/property/')) {
            parts.push(
                <Link
                    key={`link-${keyIndex++}`}
                    to={linkUrl}
                    onClick={onLinkClick}
                    className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold underline decoration-purple-300 hover:decoration-purple-500 transition-colors"
                >
                    🏠 {linkText}
                </Link>
            );
        } else {
            // External or other links
            parts.push(
                <a
                    key={`link-${keyIndex++}`}
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    {linkText}
                </a>
            );
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    // If no links found, return original content
    if (parts.length === 0) {
        return content;
    }

    return parts;
};

// Main Chat Modal Component
export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load chat history on mount
    useEffect(() => {
        const history = loadChatHistory();
        if (history.length > 0) {
            setMessages(history);
        }
    }, []);

    // Save chat history whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(messages);
        }
    }, [messages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        // Add user message
        const userMessage: ChatMessage = {
            role: 'user',
            content: trimmedInput,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Get AI response
            const response = await sendMessageToAI(trimmedInput, messages);

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: ChatMessage = {
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
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        if (window.confirm('Clear all chat history?')) {
            setMessages([]);
            clearChatHistory();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end justify-end p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Chat Window */}
            <div className="relative w-full max-w-md h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <SparkleIcon size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">AI Housing Assistant</h3>
                            <p className="text-xs text-white/80">Powered by DeepSeek</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleClearChat}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Clear chat"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                                <SparkleIcon size={32} className="text-white" />
                            </div>
                            <h4 className="font-bold text-lg text-slate-800 mb-2">Welcome! 👋</h4>
                            <p className="text-slate-500 text-sm mb-6">
                                I'm your AI housing assistant. Ask me about available rentals, recommendations, or anything about finding your perfect home near UKM!
                            </p>
                            <div className="space-y-2 w-full">
                                <button
                                    onClick={() => setInputValue("Find me a cheap studio in Bangi")}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:border-purple-300 transition-all text-left"
                                >
                                    💡 "Find me a cheap studio in Bangi"
                                </button>
                                <button
                                    onClick={() => setInputValue("What properties are available under RM500?")}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:border-purple-300 transition-all text-left"
                                >
                                    💡 "What's available under RM500?"
                                </button>
                                <button
                                    onClick={() => setInputValue("Show me 2-bedroom apartments")}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:border-purple-300 transition-all text-left"
                                >
                                    💡 "Show me 2-bedroom apartments"
                                </button>
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
                                        className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-br-md'
                                            : 'bg-white shadow-md border border-slate-100 text-slate-700 rounded-bl-md'
                                            }`}
                                    >
                                        <div className="text-sm whitespace-pre-wrap">
                                            {msg.role === 'assistant'
                                                ? renderMessageContent(msg.content, onClose)
                                                : msg.content
                                            }
                                        </div>
                                        <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'
                                            }`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white shadow-md border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-xs text-slate-400">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about housing..."
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:bg-white transition-all disabled:opacity-50"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="p-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                        Press Enter to send • AI can make mistakes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIChatModal;
