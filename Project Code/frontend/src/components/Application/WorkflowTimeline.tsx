import React from 'react';
import type { Application } from '../../types';

interface WorkflowTimelineProps {
    application: Application;
}

interface TimelineEvent {
    title: string;
    status: 'completed' | 'current' | 'pending';
    timestamp?: string;
    description: string;
    icon: string;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ application }) => {
    const getTimelineEvents = (): TimelineEvent[] => {
        const events: TimelineEvent[] = [];

        // 1. Application Submitted (Always shown)
        events.push({
            title: 'Application Submitted',
            status: 'completed',
            timestamp: application.submitted,
            description: 'Application received',
            icon: '📝'
        });

        // 2. Landlord Review
        if (application.status === 'pending') {
            events.push({
                title: 'Landlord Review',
                status: 'current',
                description: 'Awaiting landlord decision',
                icon: '⏳'
            });
        } else if (application.status === 'accepted') {
            events.push({
                title: 'Landlord Review',
                status: 'completed',
                timestamp: application.submitted, // We don't have exact acceptance time
                description: '✅ Application Accepted',
                icon: '✓'
            });
        } else if (application.status === 'rejected') {
            events.push({
                title: 'Landlord Review',
                status: 'completed',
                timestamp: application.submitted,
                description: '❌ Application Rejected',
                icon: '✗'
            });
            // Don't show further steps if rejected
            return events;
        }

        // Only continue if accepted
        if (application.status !== 'accepted') {
            return events;
        }

        // 3. Contract Upload
        if (!application.contract_url) {
            events.push({
                title: 'Contract Upload',
                status: 'current',
                description: 'Waiting for landlord to upload contract',
                icon: '⏳'
            });
            // Don't show further steps
            return events;
        } else {
            events.push({
                title: 'Contract Upload',
                status: 'completed',
                description: 'Contract document uploaded',
                icon: '✓'
            });
        }

        // 4. Tenant Signature - Use the actual boolean field
        const hasTenantSigned = application.contract_signed_tenant === true;
        if (!hasTenantSigned) {
            events.push({
                title: 'Tenant Signature',
                status: application.contract_url ? 'current' : 'pending',
                description: 'Tenant needs to sign the contract',
                icon: application.contract_url ? '⏳' : '○'
            });
        } else {
            events.push({
                title: 'Tenant Signature',
                status: 'completed',
                description: 'Tenant has signed the contract',
                icon: '✓'
            });
        }

        // 5. Landlord Signature - Use the actual boolean field
        const hasLandlordSigned = application.contract_signed_landlord === true;
        if (!hasLandlordSigned) {
            events.push({
                title: 'Landlord Signature',
                status: application.contract_url ? 'current' : 'pending',
                description: 'Landlord needs to sign the contract',
                icon: application.contract_url ? '⏳' : '○'
            });
        } else {
            events.push({
                title: 'Landlord Signature',
                status: 'completed',
                description: 'Landlord has signed the contract',
                icon: '✓'
            });
        }

        // 6. Rent Payment
        if (application.payment_status === 'unpaid') {
            events.push({
                title: 'Rent Payment',
                status: application.contract_status === 'completed' ? 'current' : 'pending',
                description: 'Tenant needs to pay rent deposit',
                icon: application.contract_status === 'completed' ? '⏳' : '○'
            });
        } else {
            events.push({
                title: 'Rent Payment',
                status: 'completed',
                description: 'Payment completed successfully',
                icon: '✓'
            });
        }

        // 7. Finalization
        if (application.stage === 'completed') {
            events.push({
                title: 'Application Completed',
                status: 'completed',
                description: '🎉 All steps completed successfully',
                icon: '✓'
            });
        } else if (application.contract_status === 'completed' && application.payment_status === 'paid') {
            events.push({
                title: 'Application Finalization',
                status: 'current',
                description: 'Ready to finalize',
                icon: '⏳'
            });
        }

        return events;
    };

    const events = getTimelineEvents();

    const getStatusColor = (status: TimelineEvent['status']) => {
        switch (status) {
            case 'completed':
                return { bg: '#d4edda', border: '#28a745', text: '#155724' };
            case 'current':
                return { bg: '#fff3cd', border: '#d4af37', text: '#856404' };
            case 'pending':
                return { bg: '#f8f9fa', border: '#dee2e6', text: '#6c757d' };
        }
    };

    return (
        <div style={{
            background: 'white',
            padding: 20,
            borderRadius: 12,
            border: '3px solid #212529',
            marginTop: 20
        }}>
            {/* Golden top decoration */}
            <div style={{
                height: 8,
                background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)',
                marginBottom: 16,
                borderRadius: 4,
                marginLeft: -20,
                marginRight: -20,
                marginTop: -20
            }}></div>

            <h3 style={{
                margin: '0 0 20px',
                fontSize: '18px',
                fontWeight: 800,
                color: '#212529'
            }}>
                📊 Application Timeline
            </h3>

            <div style={{ position: 'relative' }}>
                {/* Vertical line */}
                <div style={{
                    position: 'absolute',
                    left: 14,
                    top: 10,
                    bottom: 10,
                    width: 3,
                    background: 'linear-gradient(to bottom, #28a745 0%, #d4af37 50%, #dee2e6 100%)'
                }}></div>

                {/* Timeline events */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {events.map((event, idx) => {
                        const colors = getStatusColor(event.status);

                        return (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    position: 'relative',
                                    paddingLeft: 40
                                }}
                            >
                                {/* Icon circle */}
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: colors.bg,
                                    border: `3px solid ${colors.border}`,
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: colors.text,
                                    zIndex: 1
                                }}>
                                    {event.icon}
                                </div>

                                {/* Event content */}
                                <div style={{
                                    flex: 1,
                                    background: colors.bg,
                                    border: `2px solid ${colors.border}`,
                                    borderRadius: 8,
                                    padding: 12
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        marginBottom: 4
                                    }}>
                                        <div style={{
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            color: colors.text
                                        }}>
                                            {event.title}
                                        </div>
                                        {event.timestamp && (
                                            <div style={{
                                                fontSize: '11px',
                                                color: colors.text,
                                                opacity: 0.8
                                            }}>
                                                {new Date(event.timestamp).toLocaleString('en-MY', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: colors.text,
                                        opacity: 0.9
                                    }}>
                                        {event.description}
                                    </div>

                                    {/* Show feedback if exists and this is the landlord review step */}
                                    {event.title === 'Landlord Review' && application.feedback && (
                                        <div style={{
                                            marginTop: 8,
                                            padding: 8,
                                            background: 'rgba(255,255,255,0.6)',
                                            borderRadius: 6,
                                            fontSize: '12px',
                                            fontStyle: 'italic',
                                            color: colors.text
                                        }}>
                                            💬 "{application.feedback}"
                                        </div>
                                    )}

                                    {/* Status badge */}
                                    <div style={{
                                        marginTop: 6,
                                        display: 'inline-block',
                                        padding: '3px 8px',
                                        borderRadius: 4,
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        background: event.status === 'completed'
                                            ? '#28a745'
                                            : event.status === 'current'
                                                ? '#d4af37'
                                                : '#6c757d',
                                        color: 'white',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {event.status === 'completed' ? 'DONE' : event.status === 'current' ? 'IN PROGRESS' : 'WAITING'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Golden bottom decoration */}
            <div style={{
                height: 8,
                background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)',
                marginTop: 20,
                borderRadius: 4,
                marginLeft: -20,
                marginRight: -20,
                marginBottom: -20
            }}></div>
        </div>
    );
};
