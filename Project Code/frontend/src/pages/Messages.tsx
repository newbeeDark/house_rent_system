import React from 'react';
import { Navbar } from '../components/Layout/Navbar';

interface Message {
    id: number;
    title: string;
    content: string;
    date: string;
    isRead: boolean;
    type: 'system' | 'application' | 'general';
}

const MOCK_MESSAGES: Message[] = [
    {
        id: 1,
        title: "Welcome to UKM Rented!",
        content: "Thanks for joining. Complete your profile to start exploring properties near UKM.",
        date: "2025-12-01 09:00",
        isRead: true,
        type: 'system'
    },
    {
        id: 2,
        title: "Application Status Update",
        content: "Your application for 'Studio near UKM' has been viewed by the landlord.",
        date: "2025-12-14 14:30",
        isRead: false,
        type: 'application'
    },
    {
        id: 3,
        title: "New Listings Alert",
        content: "3 new properties match your favorites criteria.",
        date: "2025-12-13 18:15",
        isRead: false,
        type: 'general'
    }
];

export const Messages: React.FC = () => {
    return (
        <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
            <Navbar />

            <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Messages</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>System notifications and updates.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {MOCK_MESSAGES.map(msg => (
                        <div key={msg.id} className="card" style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: 20,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                            borderLeft: msg.isRead ? '4px solid transparent' : '4px solid var(--accent)',
                            opacity: msg.isRead ? 0.8 : 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: 99,
                                        background: msg.type === 'system' ? '#eef3fb' : msg.type === 'application' ? '#e6ffef' : '#fff7e6',
                                        color: msg.type === 'system' ? 'var(--accent)' : msg.type === 'application' ? '#17c964' : '#a36b00',
                                        textTransform: 'uppercase',
                                        fontWeight: 700
                                    }}>{msg.type}</span>
                                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{msg.title}</span>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{msg.date}</span>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>
                                {msg.content}
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};
