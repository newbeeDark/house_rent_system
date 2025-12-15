import React, { useState } from 'react';
import { Navbar } from '../components/Layout/Navbar';
// import { useAuth } from '../context/AuthContext';
// import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Application } from '../types';

const MOCK_APPS: Application[] = [
    { id: 8001, propertyId: 101, propertyTitle: "Studio near UKM - 5 min", applicant: "Zhang Peigen", studentId: "A199958", submitted: "2025-12-01T10:15", status: "pending", message: "I need the room from Jan to June. I can provide guarantor.", files: [{ name: "student_id.jpg", type: "image/jpeg", url: "#" }, { name: "transcript.pdf", type: "application/pdf", url: "#" }] },
    { id: 8002, propertyId: 103, propertyTitle: "2BR apartment — quiet neighbourhood", applicant: "Liu Zetong", studentId: "A199538", submitted: "2025-12-03T14:20", status: "pending", message: "Looking for a 2-month stay in Jan-Feb.", files: [{ name: "id_card.png", type: "image/png", url: "#" }] },
    { id: 8003, propertyId: 102, propertyTitle: "Cozy 1BR, close to bus stop", applicant: "Siti Nur", studentId: "A201234", submitted: "2025-11-24T09:05", status: "accepted", files: [] }
];

export const Applications: React.FC = () => {
    const [apps, setApps] = useState<Application[]>(MOCK_APPS);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const selectedApp = apps.find(a => a.id === selectedId);

    const filteredApps = apps.filter(a => {
        const matchesText = (a.applicant + a.propertyTitle + a.studentId).toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesText && matchesStatus;
    });

    const updateStatus = (id: number, status: 'accepted' | 'rejected') => {
        setApps(apps.map(a => a.id === id ? { ...a, status } : a));
    };

    return (
        <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
            <Navbar />

            <main className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 380px', gap: '24px', maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
                {/* List Panel */}
                <section className="card" style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 16, height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Applications</h2>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="search" placeholder="Search..."
                                value={filter} onChange={e => setFilter(e.target.value)}
                                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #eee', fontSize: '13px' }}
                            />
                            <select
                                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                style={{ padding: '6px', borderRadius: 8, border: '1px solid #eee', fontSize: '13px' }}
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredApps.map(app => (
                            <div
                                key={app.id} onClick={() => setSelectedId(app.id)}
                                style={{
                                    padding: 12, borderRadius: 10, background: selectedId === app.id ? '#f0f7ff' : '#fff',
                                    border: selectedId === app.id ? '1px solid var(--accent)' : '1px solid #f0f0f0',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <strong style={{ fontSize: '14px' }}>{app.applicant}</strong>
                                    <span className={clsx('status-pill', app.status)} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 99, textTransform: 'capitalize', background: app.status === 'pending' ? '#fff7e6' : app.status === 'accepted' ? '#e6ffef' : '#ffecec', color: app.status === 'pending' ? '#a36b00' : app.status === 'accepted' ? '#17c964' : '#ff6b6b' }}>
                                        {app.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{app.studentId} • {new Date(app.submitted).toLocaleDateString()}</div>
                                <div style={{ fontSize: '12px', color: '#444', marginTop: 4 }}>{app.propertyTitle}</div>
                            </div>
                        ))}
                        {filteredApps.length === 0 && <div style={{ padding: 20, textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>No applications found.</div>}
                    </div>
                </section>

                {/* Detail Panel */}
                <aside className="card" style={{ background: '#fff', borderRadius: 12, padding: 20, height: 'fit-content', minHeight: '400px' }}>
                    {selectedApp ? (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: 700 }}>{selectedApp.applicant}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{selectedApp.studentId}</div>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{new Date(selectedApp.submitted).toLocaleString()}</div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: 6 }}>Applied for</div>
                                <div style={{ fontSize: '14px', color: 'var(--accent)' }}>{selectedApp.propertyTitle}</div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: 6 }}>Message</div>
                                <div style={{ fontSize: '14px', background: '#f9fafb', padding: 10, borderRadius: 8 }}>{selectedApp.message || 'No message provided.'}</div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: 6 }}>Documents</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {selectedApp.files.length > 0 ? selectedApp.files.map((f, i) => (
                                        <div key={i} style={{ padding: '6px 12px', border: '1px solid #eee', borderRadius: 8, fontSize: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            📄 {f.name}
                                        </div>
                                    )) : <span style={{ fontSize: '13px', color: 'var(--muted)' }}>No files attached</span>}
                                </div>
                            </div>

                            <div style={{ height: 1, background: '#eee', margin: '20px 0' }}></div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={() => updateStatus(selectedApp.id, 'accepted')}
                                    className="btn btn-primary"
                                    disabled={selectedApp.status === 'accepted'}
                                    style={{ flex: 1, padding: '10px' }}
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => updateStatus(selectedApp.id, 'rejected')}
                                    className="btn btn-ghost"
                                    style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                    disabled={selectedApp.status === 'rejected'}
                                >
                                    Reject
                                </button>
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <button className="btn btn-ghost" style={{ width: '100%', fontSize: '13px' }}>Request more info</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                            Select an application to view details
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
};
