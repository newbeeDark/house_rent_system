import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { TermsContent, PrivacyContent } from '../Legal/LegalContents';

interface TermsModalProps {
    mode?: 'standalone' | 'embedded'; // standalone = post-login (default), embedded = pre-login
    onAgree?: () => void; // Callback for embedded mode
    onClose?: () => void; // Callback to close modal (for embedded mode)
}

export const TermsModal: React.FC<TermsModalProps> = ({
    mode = 'standalone',
    onAgree,
    onClose
}) => {
    const { refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
    const [termsRead, setTermsRead] = useState(false);
    const [privacyRead, setPrivacyRead] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const termsScrollRef = useRef<HTMLDivElement>(null);
    const privacyScrollRef = useRef<HTMLDivElement>(null);

    // Scroll detection for Terms tab
    const handleTermsScroll = () => {
        const element = termsScrollRef.current;
        if (!element) return;

        const { scrollTop, scrollHeight, clientHeight } = element;
        const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

        if (scrolledToBottom && !termsRead) {
            setTermsRead(true);
        }
    };

    // Scroll detection for Privacy tab
    const handlePrivacyScroll = () => {
        const element = privacyScrollRef.current;
        if (!element) return;

        const { scrollTop, scrollHeight, clientHeight } = element;
        const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

        if (scrolledToBottom && !privacyRead) {
            setPrivacyRead(true);
        }
    };

    // Reset scroll position when switching tabs
    useEffect(() => {
        if (activeTab === 'terms' && termsScrollRef.current) {
            termsScrollRef.current.scrollTop = 0;
        } else if (activeTab === 'privacy' && privacyScrollRef.current) {
            privacyScrollRef.current.scrollTop = 0;
        }
    }, [activeTab]);

    // Check if content is short enough that it doesn't need scrolling
    useEffect(() => {
        const checkTermsHeight = () => {
            const element = termsScrollRef.current;
            if (element && element.scrollHeight <= element.clientHeight) {
                setTermsRead(true);
            }
        };

        const checkPrivacyHeight = () => {
            const element = privacyScrollRef.current;
            if (element && element.scrollHeight <= element.clientHeight) {
                setPrivacyRead(true);
            }
        };

        // Small delay to ensure content is rendered
        setTimeout(() => {
            checkTermsHeight();
            checkPrivacyHeight();
        }, 100);
    }, []);

    const handleAgree = async () => {
        // EMBEDDED MODE (pre-login): Just call the callback, don't touch DB
        if (mode === 'embedded') {
            if (onAgree) {
                onAgree();
            }
            return;
        }

        // STANDALONE MODE (post-login): Update DB and refresh profile
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error } = await supabase
                .from('users')
                .update({ terms_accepted_at: new Date().toISOString() })
                .eq('id', user.id);

            if (error) throw error;

            // Refresh profile to update AuthContext (modal will close automatically)
            await refreshProfile();
        } catch (err) {
            console.error('Error accepting terms:', err);
            alert('Failed to accept terms. Please try again.');
            setSubmitting(false);
        }
    };

    const canAgree = termsRead && privacyRead;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20
            }}
        >
            {/* Semi-transparent blurred overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)'
                }}
            />

            {/* Modal Card - Neo-Brutalist Style */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 800,
                    maxHeight: '90vh',
                    background: 'white',
                    borderRadius: 16,
                    border: '4px solid #212529',
                    boxShadow: '8px 8px 0 rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '24px 28px',
                        borderBottom: '4px solid #212529',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                                border: '3px solid #212529',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: 24
                            }}
                        >
                            📜
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#212529' }}>
                                Welcome to UKM Housing Rental System
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d', fontWeight: 500 }}>
                                Please read and accept our terms to continue
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div
                    style={{
                        display: 'flex',
                        gap: 0,
                        borderBottom: '4px solid #212529',
                        background: '#f8f9fa'
                    }}
                >
                    <button
                        onClick={() => setActiveTab('terms')}
                        style={{
                            flex: 1,
                            padding: '16px 20px',
                            border: 'none',
                            borderRight: '2px solid #212529',
                            background: activeTab === 'terms'
                                ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                                : 'transparent',
                            color: activeTab === 'terms' ? 'white' : '#495057',
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        {termsRead && <span style={{ fontSize: 18 }}>✅</span>}
                        Terms of Service
                    </button>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        style={{
                            flex: 1,
                            padding: '16px 20px',
                            border: 'none',
                            background: activeTab === 'privacy'
                                ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                                : 'transparent',
                            color: activeTab === 'privacy' ? 'white' : '#495057',
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        {privacyRead && <span style={{ fontSize: 18 }}>✅</span>}
                        Privacy Policy
                    </button>
                </div>

                {/* Scroll Reminder Banner - Only show if not read */}
                {((activeTab === 'terms' && !termsRead) || (activeTab === 'privacy' && !privacyRead)) && (
                    <div
                        style={{
                            padding: 12,
                            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
                            borderBottom: '2px solid #d4af37',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#856404',
                            textAlign: 'center'
                        }}
                    >
                        📖 Please scroll to the bottom to read the entire document
                    </div>
                )}

                {/* Content Area with Scroll Detection */}
                <div
                    ref={activeTab === 'terms' ? termsScrollRef : privacyScrollRef}
                    onScroll={activeTab === 'terms' ? handleTermsScroll : handlePrivacyScroll}
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: 28,
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: '#212529'
                    }}
                >
                    {/* Header inside content */}
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: '#212529' }}>
                            {activeTab === 'terms'
                                ? 'Terms of Service — UKM Students off School Rented System'
                                : 'Privacy Policy — UKM Students off School Rented System'}
                        </h1>
                        <div style={{ fontSize: 13, color: '#6c757d' }}>Last updated: 2025-12-07</div>
                    </div>

                    <hr style={{ border: 0, borderTop: '2px solid #dee2e6', margin: '0 0 20px' }} />

                    {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}

                    {/* Spacer to ensure scroll */}
                    <div style={{ height: 1 }} />
                </div>

                {/* Footer with Action Buttons */}
                <div
                    style={{
                        padding: 24,
                        borderTop: '4px solid #212529',
                        background: '#f8f9fa'
                    }}
                >
                    {/* Status Indicators */}
                    <div style={{ marginBottom: 16, display: 'flex', gap: 16, justifyContent: 'center' }}>
                        <div
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: termsRead ? '#d4edda' : '#f8d7da',
                                border: `2px solid ${termsRead ? '#28a745' : '#dc3545'}`,
                                fontSize: 13,
                                fontWeight: 600,
                                color: termsRead ? '#155724' : '#721c24'
                            }}
                        >
                            {termsRead ? '✅ Terms Read' : '⏳ Read Terms'}
                        </div>
                        <div
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: privacyRead ? '#d4edda' : '#f8d7da',
                                border: `2px solid ${privacyRead ? '#28a745' : '#dc3545'}`,
                                fontSize: 13,
                                fontWeight: 600,
                                color: privacyRead ? '#155724' : '#721c24'
                            }}
                        >
                            {privacyRead ? '✅ Privacy Read' : '⏳ Read Privacy'}
                        </div>
                    </div>

                    {/* Action Buttons Container */}
                    <div style={{ display: 'flex', gap: 12, flexDirection: mode === 'embedded' ? 'row' : 'column' }}>
                        {/* Cancel Button - Only show in embedded mode */}
                        {mode === 'embedded' && onClose && (
                            <button
                                onClick={onClose}
                                disabled={submitting}
                                style={{
                                    flex: mode === 'embedded' ? 1 : undefined,
                                    padding: 16,
                                    background: '#6c757d',
                                    color: 'white',
                                    border: '3px solid #212529',
                                    borderRadius: 12,
                                    fontSize: 16,
                                    fontWeight: 800,
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    opacity: submitting ? 0.6 : 1,
                                    transition: 'all 0.3s'
                                }}
                            >
                                ← Cancel
                            </button>
                        )}

                        {/* Agree Button */}
                        <button
                            onClick={handleAgree}
                            disabled={!canAgree || submitting}
                            style={{
                                flex: mode === 'embedded' ? 2 : undefined,
                                width: mode === 'standalone' ? '100%' : undefined,
                                padding: 16,
                                background: canAgree && !submitting
                                    ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                    : '#6c757d',
                                color: 'white',
                                border: '3px solid #212529',
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: 800,
                                cursor: canAgree && !submitting ? 'pointer' : 'not-allowed',
                                opacity: canAgree && !submitting ? 1 : 0.6,
                                transition: 'all 0.3s',
                                boxShadow: canAgree && !submitting ? '4px 4px 0 rgba(0,0,0,0.2)' : 'none'
                            }}
                        >
                            {submitting ? '⏳ Processing...' : canAgree ? '✅ I Accept the Terms and Privacy Policy' : '🔒 Read Both Documents to Continue'}
                        </button>
                    </div>

                    <p style={{ margin: '12px 0 0', fontSize: 12, color: '#6c757d', textAlign: 'center', lineHeight: 1.5 }}>
                        By clicking "I Accept", you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};
