import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Layout/Navbar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ApplicationDetailModal } from '../components/Application/ApplicationDetailModal';
import type { Application } from '../types';

export const Applications: React.FC = () => {
    const { user } = useAuth();
    const [apps, setApps] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        const { data } = await supabase
            .from('applications')
            .select(`
                *,
                properties (title, price),
                applicant:users!applicant_id (
                    full_name,
                    student_id,
                    email,
                    phone
                )
            `);

        if (data) {
            const mapped = data.map((a: any) => ({
                id: String(a.id),
                propertyId: a.property_id,
                propertyTitle: a.properties?.title || 'Unknown Property',
                applicant: a.applicant?.full_name || 'Unknown Applicant',
                studentId: a.applicant?.student_id || 'N/A',
                submitted: a.created_at,
                status: a.status,
                message: a.message,
                appointmentTime: a.appointment_at || null,
                feedback: a.feedback || null,
                applicantId: a.applicant_id,
                propertyOwnerId: a.property_owner_id,
                stage: a.stage || 'application',
                contract_url: a.contract_url || null,
                contract_status: a.contract_status || 'pending',
                contract_signed_landlord: a.contract_signed_landlord || false,
                contract_signed_tenant: a.contract_signed_tenant || false,
                payment_status: a.payment_status || 'unpaid',
                files: a.documents
                    ? (typeof a.documents === 'string' ? JSON.parse(a.documents) : a.documents)
                    : []
            }));
            setApps(mapped);
        }
    };

    const filteredApps = apps.filter(a => {
        const matchesText = (a.applicant + a.propertyTitle + a.studentId).toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesText && matchesStatus;
    });

    const isPropertyOwner = (app: Application) => {
        return user?.id === app.propertyOwnerId;
    };

    const isTenant = (app: Application) => {
        return user?.id === app.applicantId;
    };

    const handleViewDetails = (app: Application) => {
        setSelectedApp(app);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        fetchApps(); // Refresh list when modal closes
    };

    return (
        <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
            <Navbar />

            <main className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>📋 Applications</h1>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input
                            type="search"
                            placeholder="Search..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 8,
                                border: '2px solid #dee2e6',
                                fontSize: 14
                            }}
                        />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 8,
                                border: '2px solid #dee2e6',
                                fontSize: 14,
                                fontWeight: 600
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Application Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filteredApps.length === 0 ? (
                        <div style={{
                            padding: 60,
                            background: 'white',
                            borderRadius: 12,
                            border: '3px solid #dee2e6',
                            textAlign: 'center',
                            color: '#6c757d'
                        }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                            <div style={{ fontSize: 18, fontWeight: 600 }}>No applications found</div>
                        </div>
                    ) : (
                        filteredApps.map(app => (
                            <div
                                key={app.id}
                                style={{
                                    background: 'white',
                                    borderRadius: 12,
                                    border: '3px solid #212529',
                                    padding: 20,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                                                {app.propertyTitle}
                                            </h3>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                background: app.status === 'pending' ? '#fff7e6' : app.status === 'accepted' ? '#d4edda' : '#f8d7da',
                                                color: app.status === 'pending' ? '#856404' : app.status === 'accepted' ? '#155724' : '#721c24'
                                            }}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 14, color: '#6c757d', marginBottom: 4 }}>
                                            <strong>Applicant:</strong> {app.applicant} ({app.studentId})
                                        </div>
                                        <div style={{ fontSize: 13, color: '#6c757d' }}>
                                            Submitted on {new Date(app.submitted).toLocaleString('en-MY', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>

                                        {/* Stage Badge */}
                                        <div style={{ marginTop: 12 }}>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '6px 12px',
                                                borderRadius: 6,
                                                background: app.stage === 'completed' ? '#28a745' : app.stage === 'processing' ? '#ffc107' : '#6c757d',
                                                color: 'white',
                                                fontSize: 12,
                                                fontWeight: 700
                                            }}>
                                                {app.stage === 'application' && '📝 Application'}
                                                {app.stage === 'processing' && '⚙️ Processing'}
                                                {app.stage === 'completed' && '✅ Completed'}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewDetails(app)}
                                        style={{
                                            padding: '12px 24px',
                                            background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontSize: 15,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        👁️ View Details & Progress
                                    </button>
                                </div>

                                {/* Preview Info */}
                                {app.message && (
                                    <div style={{
                                        padding: 12,
                                        background: '#f8f9fa',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        color: '#495057',
                                        fontStyle: 'italic',
                                        marginTop: 12,
                                        maxHeight: 60,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {app.message.length > 150 ? app.message.substring(0, 150) + '...' : app.message}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Application Detail Modal */}
            {selectedApp && (
                <ApplicationDetailModal
                    application={selectedApp}
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    isLandlord={isPropertyOwner(selectedApp)}
                    isTenant={isTenant(selectedApp)}
                    onUpdate={fetchApps}
                />
            )}
        </div>
    );
};
