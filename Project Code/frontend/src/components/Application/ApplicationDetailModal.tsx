import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '../Payment/StripePaymentForm';
import type { Application } from '../../types';

interface ApplicationDetailModalProps {
    application: Application;
    isOpen: boolean;
    onClose: () => void;
    isLandlord: boolean;
    isTenant: boolean;
    onUpdate: () => void;
}

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
    application,
    isOpen,
    onClose,
    isLandlord,
    isTenant,
    onUpdate
}) => {
    const [localApp, setLocalApp] = useState(application);
    const [activeTab, setActiveTab] = useState<number>(
        application.stage === 'application' ? 0 : application.stage === 'processing' ? 1 : 2
    );
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Response modal state for accepting/rejecting
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseAction, setResponseAction] = useState<'accepted' | 'rejected'>('accepted');
    const [feedbackText, setFeedbackText] = useState('');

    if (!isOpen) return null;

    const handleContractSignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        setUploading(true);
        try {
            const role = isLandlord ? 'landlord' : 'tenant';
            const fileName = `${role}_signed.pdf`;
            const filePath = `contracts/${application.id}/${fileName}`;

            console.log('📤 Starting contract upload:', { role, fileName, applicationId: application.id });

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.error('❌ Storage upload error:', uploadError);
                throw uploadError;
            }

            console.log('✅ File uploaded successfully to storage');

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            console.log('🔗 Public URL generated:', publicUrl);

            // Check current signing status from the actual database values
            const hasLandlordSigned = application.contract_signed_landlord || false;
            const hasTenantSigned = application.contract_signed_tenant || false;

            console.log('📋 Current signing status before update:', {
                hasLandlordSigned,
                hasTenantSigned,
                currentUser: role
            });

            // Determine new status based on who just signed
            let newContractStatus: Application['contract_status'];
            const updatePayload: any = {
                contract_url: publicUrl
            };

            // Will both parties have signed after this upload?
            let willBothBeSigned = false;

            if (isLandlord) {
                updatePayload.contract_signed_landlord = true;
                // If tenant has already signed, mark as completed
                willBothBeSigned = hasTenantSigned;
                newContractStatus = willBothBeSigned ? 'completed' : 'signed_by_landlord';
            } else {
                updatePayload.contract_signed_tenant = true;
                // If landlord has already signed, mark as completed
                willBothBeSigned = hasLandlordSigned;
                newContractStatus = willBothBeSigned ? 'completed' : 'signed_by_tenant';
            }

            updatePayload.contract_status = newContractStatus;

            // If both parties have signed AND payment is complete, auto-finalize the application
            if (willBothBeSigned && application.payment_status === 'paid') {
                updatePayload.stage = 'completed';
                updatePayload.status = 'completed';
            }

            console.log('📝 Update payload to be sent to database:', updatePayload);
            console.log('🎯 Updating application with ID:', application.id);

            // Update database
            const { data: updateData, error: updateError } = await supabase
                .from('applications')
                .update(updatePayload)
                .eq('id', application.id)
                .select();

            if (updateError) {
                console.error('❌ Database update error:', updateError);
                console.error('Error details:', {
                    message: updateError.message,
                    details: updateError.details,
                    hint: updateError.hint,
                    code: updateError.code
                });
                throw updateError;
            }

            console.log('✅ Database updated successfully!', updateData);
            console.log('Updated record:', updateData?.[0]);

            // Refetch application to update local state immediately
            const { data: freshApp, error: fetchError } = await supabase
                .from('applications')
                .select('*')
                .eq('id', application.id)
                .single();

            if (!fetchError && freshApp) {
                setLocalApp({
                    ...application,
                    ...freshApp,
                    contract_signed_landlord: freshApp.contract_signed_landlord || false,
                    contract_signed_tenant: freshApp.contract_signed_tenant || false
                });
            }

            if (willBothBeSigned && application.payment_status === 'paid') {
                alert('Contract fully signed! Application automatically completed. 🎉');
            } else if (willBothBeSigned) {
                alert('Contract fully signed by both parties! Waiting for payment to complete the process.');
            } else {
                alert('Signed contract uploaded successfully!');
            }

            onUpdate();
        } catch (err) {
            console.error('❌ Error uploading signed contract:', err);
            alert(`Failed to upload signed contract: ${err instanceof Error ? err.message : 'Unknown error'}. Please check console for details.`);
        } finally {
            setUploading(false);
        }
    };

    const handleContractInitialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        setUploading(true);
        try {
            const fileName = `contract_${Date.now()}.pdf`;
            const filePath = `contracts/${application.id}/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            // Update database
            const { error: updateError } = await supabase
                .from('applications')
                .update({
                    contract_url: publicUrl,
                    contract_status: 'uploaded'
                })
                .eq('id', application.id);

            if (updateError) throw updateError;

            alert('Contract uploaded successfully!');
            onUpdate();
        } catch (err) {
            console.error('Error uploading contract:', err);
            alert('Failed to upload contract. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handlePayment = () => {
        // Check if BOTH parties have signed using boolean fields
        const bothSigned =
            application.contract_signed_landlord === true &&
            application.contract_signed_tenant === true;

        if (!bothSigned) {
            alert('Please wait for both parties to sign the contract before making payment.');
            return;
        }

        // Open Stripe payment modal
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false);
        setProcessing(true);

        try {
            // Update payment status
            const { error: paymentError } = await supabase
                .from('applications')
                .update({ payment_status: 'paid' })
                .eq('id', application.id);

            if (paymentError) throw paymentError;

            // Auto-finalize if BOTH contract signatures are present
            const bothPartiesSigned =
                application.contract_signed_landlord === true &&
                application.contract_signed_tenant === true;

            if (bothPartiesSigned) {
                const { error: finalizeError } = await supabase
                    .from('applications')
                    .update({
                        stage: 'completed',
                        status: 'completed',
                        contract_status: 'completed' // Ensure contract_status is also set
                    })
                    .eq('id', application.id);

                if (finalizeError) throw finalizeError;

                // Switch to completed tab
                setActiveTab(2);
                alert('Payment successful! Application completed.');
            } else {
                alert('Payment recorded successfully! Waiting for contract signatures to complete.');
            }

            onUpdate();
        } catch (err) {
            console.error('Error processing payment:', err);
            alert('Failed to process payment. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleResponseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (responseAction === 'rejected' && !feedbackText.trim()) {
            alert('Feedback is required when rejecting an application.');
            return;
        }

        setProcessing(true);
        try {
            const updatePayload: any = {
                status: responseAction,
                feedback: feedbackText.trim() || null
            };

            if (responseAction === 'accepted') {
                updatePayload.stage = 'processing';
            }

            const { error } = await supabase
                .from('applications')
                .update(updatePayload)
                .eq('id', application.id);

            if (error) throw error;

            setShowResponseModal(false);
            setFeedbackText('');

            // Switch to Contract & Payment tab when accepted
            if (responseAction === 'accepted') {
                setActiveTab(1);
                alert('Application accepted! Moving to Contract & Payment phase.');
            } else {
                alert('Application rejected.');
            }

            onUpdate();
        } catch (err) {
            console.error('Error updating application:', err);
            alert('Failed to update application. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleFinalize = async () => {
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('applications')
                .update({
                    stage: 'completed',
                    status: 'completed'
                })
                .eq('id', application.id);

            if (error) throw error;

            alert('Application completed successfully!');
            onUpdate();
        } catch (err) {
            console.error('Error finalizing application:', err);
            alert('Failed to finalize application. Please try again.');
        } finally {
            setProcessing(false);
        }
    };


    const hasLandlordSigned = localApp.contract_signed_landlord || false;
    const hasTenantSigned = localApp.contract_signed_tenant || false;
    const bothPartiesSigned = hasLandlordSigned && hasTenantSigned;
    const canFinalize = bothPartiesSigned && localApp.payment_status === 'paid';

    const getStageIndex = (stage: Application['stage']) => {
        return stage === 'application' ? 0 : stage === 'processing' ? 1 : 2;
    };

    const currentStageIndex = getStageIndex(localApp.stage);

    return (
        <>
            {/* Modal Overlay */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16
                }}
                onClick={onClose}
            >
                {/* Modal Content */}
                <div
                    style={{
                        width: '100%',
                        maxWidth: 900,
                        maxHeight: '90vh',
                        background: 'white',
                        borderRadius: 16,
                        border: '4px solid #212529',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Golden Top Decoration */}
                    <div style={{
                        height: 12,
                        background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)'
                    }}></div>

                    {/* Header */}
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '3px solid #212529',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#212529' }}>
                                    {application.propertyTitle}
                                </h2>
                                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>
                                    Application by {application.applicant}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    border: '3px solid #212529',
                                    background: 'white',
                                    fontSize: 20,
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'grid',
                                    placeItems: 'center'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Horizontal Stepper */}
                    <div style={{
                        padding: '16px 24px',
                        background: '#f8f9fa',
                        borderBottom: '3px solid #212529'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {[
                                { label: 'Application', index: 0 },
                                { label: 'Contract & Payment', index: 1 },
                                { label: 'Completed', index: 2 }
                            ].map((step, idx) => {
                                // Determine if this step is completed (finished and behind us)
                                // A step is only "completed" if it's strictly BEFORE the current stage
                                const isStepCompleted = step.index < currentStageIndex;

                                // Special case: Application tab shows as completed if accepted/rejected
                                const isApplicationCompleted = step.index === 0 &&
                                    (application.status === 'accepted' || application.status === 'rejected');

                                const finalIsCompleted = isStepCompleted || isApplicationCompleted;

                                // Determine if step is clickable
                                const isClickable = step.index === 0
                                    ? true  // Application tab is always clickable
                                    : step.index <= currentStageIndex;

                                // Is this the current active stage?
                                const isCurrentStage = step.index === currentStageIndex;

                                return (
                                    <React.Fragment key={step.index}>
                                        <button
                                            onClick={() => setActiveTab(step.index)}
                                            disabled={!isClickable}
                                            style={{
                                                flex: 1,
                                                padding: '12px 16px',
                                                borderRadius: 8,
                                                border: '3px solid #212529',
                                                // Priority: 
                                                // 1. If user clicked this tab -> Gold
                                                // 2. If this is current stage (but not clicked) -> White
                                                // 3. If step is completed -> Green
                                                // 4. Otherwise -> Grey (not reached yet)
                                                background: activeTab === step.index
                                                    ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                                                    : isCurrentStage
                                                        ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                                                        : finalIsCompleted
                                                            ? '#28a745'
                                                            : '#e9ecef',
                                                color: activeTab === step.index || finalIsCompleted || isCurrentStage
                                                    ? '#fff'
                                                    : '#6c757d',
                                                fontWeight: 800,
                                                fontSize: 13,
                                                cursor: isClickable ? 'pointer' : 'not-allowed',
                                                opacity: !isClickable ? 0.5 : 1,
                                                transition: 'all 0.3s',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <div style={{ fontSize: 18, marginBottom: 4 }}>
                                                {finalIsCompleted ? '✓' : step.index + 1}
                                            </div>
                                            {step.label}
                                        </button>
                                        {idx < 2 && (
                                            <div style={{
                                                width: 30,
                                                height: 4,
                                                background: finalIsCompleted ? '#28a745' : '#dee2e6',
                                                borderRadius: 2
                                            }}></div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: 24
                    }}>
                        {/* Tab 1: Application History */}
                        {activeTab === 0 && (
                            <div>
                                <h3 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 800 }}>📋 Application Details</h3>

                                {/* Applicant Info */}
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: 16,
                                    borderRadius: 8,
                                    border: '2px solid #dee2e6',
                                    marginBottom: 16
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Applicant</div>
                                            <div style={{ fontSize: 15, fontWeight: 700 }}>{application.applicant}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Student ID</div>
                                            <div style={{ fontSize: 15, fontWeight: 700 }}>{application.studentId}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Submitted</div>
                                            <div style={{ fontSize: 14 }}>
                                                {new Date(application.submitted).toLocaleString('en-MY', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Status</div>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: 6,
                                                background: application.status === 'accepted' ? '#28a745' : application.status === 'rejected' ? '#dc3545' : '#ffc107',
                                                color: 'white',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                textTransform: 'capitalize'
                                            }}>
                                                {application.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Message */}
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Application Statement</div>
                                    <div style={{
                                        background: '#f8f9fa',
                                        padding: 16,
                                        borderRadius: 8,
                                        border: '2px solid #dee2e6',
                                        fontSize: 14,
                                        lineHeight: 1.6
                                    }}>
                                        {application.message || 'No message provided.'}
                                    </div>
                                </div>

                                {/* Appointment Time */}
                                {application.appointmentTime && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🗓️ Preferred Viewing Time</div>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
                                            padding: 12,
                                            borderRadius: 8,
                                            border: '2px solid #d4af37',
                                            fontWeight: 600,
                                            color: '#856404',
                                            fontSize: 14
                                        }}>
                                            📅 {new Date(application.appointmentTime).toLocaleString('en-MY', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Landlord's Response */}
                                {application.feedback && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>💬 Landlord's Feedback</div>
                                        <div style={{
                                            background: application.status === 'accepted'
                                                ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
                                                : 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                                            padding: 16,
                                            borderRadius: 8,
                                            border: `2px solid ${application.status === 'accepted' ? '#28a745' : '#dc3545'}`,
                                            color: application.status === 'accepted' ? '#155724' : '#721c24',
                                            fontSize: 14,
                                            fontWeight: 500
                                        }}>
                                            {application.feedback}
                                        </div>
                                    </div>
                                )}

                                {/* Actions for Landlord */}
                                {isLandlord && application.status === 'pending' && (
                                    <div style={{ marginTop: 24 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>⚡ Actions</div>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <button
                                                onClick={() => { setResponseAction('accepted'); setShowResponseModal(true); }}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    background: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✓ Accept Application
                                            </button>
                                            <button
                                                onClick={() => { setResponseAction('rejected'); setShowResponseModal(true); }}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    background: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✗ Reject Application
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 2: Contract & Payment */}
                        {activeTab === 1 && (
                            <div>
                                <h3 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 800 }}>📝 Contract & Payment Processing</h3>

                                {/* Contract Section */}
                                <div style={{
                                    background: 'white',
                                    padding: 20,
                                    borderRadius: 12,
                                    border: '3px solid #212529',
                                    marginBottom: 20
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <div style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: application.contract_status === 'completed' ? '#28a745' : '#ffc107',
                                            color: 'white',
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontSize: 18,
                                            fontWeight: 800
                                        }}>
                                            {application.contract_status === 'completed' ? '✓' : '📄'}
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Contract Management</h4>
                                    </div>

                                    {/* Contract Status */}
                                    <div style={{
                                        background: '#f8f9fa',
                                        padding: 12,
                                        borderRadius: 8,
                                        marginBottom: 16,
                                        fontSize: 13
                                    }}>
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Signing Status:</strong>
                                        </div>
                                        <div>Landlord: {hasLandlordSigned ? '✅ Signed' : '⏳ Pending'}</div>
                                        <div>Tenant: {hasTenantSigned ? '✅ Signed' : '⏳ Pending'}</div>
                                    </div>

                                    {/* INITIAL UPLOAD SECTION */}
                                    {!application.contract_url && (
                                        <>
                                            {/* Landlord: Initial Contract Upload */}
                                            {isLandlord && (
                                                <div style={{ marginBottom: 16 }}>
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
                                                        padding: 12,
                                                        borderRadius: 8,
                                                        border: '2px solid #d4af37',
                                                        fontSize: 13,
                                                        color: '#856404',
                                                        marginBottom: 12,
                                                        fontWeight: 600
                                                    }}>
                                                        📋 First Step: Upload the draft contract for both parties to review and sign
                                                    </div>
                                                    <label style={{
                                                        display: 'block',
                                                        padding: '14px',
                                                        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                                                        color: 'white',
                                                        borderRadius: 8,
                                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                                        textAlign: 'center',
                                                        fontWeight: 700,
                                                        fontSize: 16,
                                                        opacity: uploading ? 0.6 : 1,
                                                        border: '3px solid #212529'
                                                    }}>
                                                        {uploading ? '⏳ Uploading...' : '📤 Upload Draft Contract (PDF)'}
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={handleContractInitialUpload}
                                                            disabled={uploading}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                    <p style={{ fontSize: 12, color: '#6c757d', margin: '8px 0 0', textAlign: 'center' }}>
                                                        Upload the initial contract document that will be signed by both parties
                                                    </p>
                                                </div>
                                            )}

                                            {/* Tenant: Waiting Message */}
                                            {isTenant && (
                                                <div style={{
                                                    padding: 16,
                                                    background: '#fff3cd',
                                                    border: '2px solid #ffc107',
                                                    borderRadius: 8,
                                                    fontSize: 14,
                                                    color: '#856404',
                                                    textAlign: 'center',
                                                    fontWeight: 600,
                                                    marginBottom: 16
                                                }}>
                                                    ⏳ Waiting for landlord to upload the contract document...
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* VIEW & SIGN SECTION (Only shown after contract exists) */}
                                    {application.contract_url && (
                                        <>
                                            {/* View Contract */}
                                            <a
                                                href={application.contract_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'block',
                                                    padding: '10px',
                                                    background: '#6c757d',
                                                    color: 'white',
                                                    borderRadius: 8,
                                                    textDecoration: 'none',
                                                    textAlign: 'center',
                                                    fontWeight: 600,
                                                    fontSize: 14,
                                                    marginBottom: 12
                                                }}
                                            >
                                                👁️ View Current Contract
                                            </a>

                                            {/* Upload Signed Contract */}
                                            {((isLandlord && !hasLandlordSigned) || (isTenant && !hasTenantSigned)) && (
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        padding: '12px',
                                                        background: 'linear-gradient(135deg, #007bff 0%, #0056be 100%)',
                                                        color: 'white',
                                                        borderRadius: 8,
                                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                                        textAlign: 'center',
                                                        fontWeight: 700,
                                                        fontSize: 15,
                                                        opacity: uploading ? 0.6 : 1
                                                    }}>
                                                        {uploading ? '⏳ Uploading...' : '✍️ Upload Signed PDF'}
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={handleContractSignUpload}
                                                            disabled={uploading}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                    <p style={{ fontSize: 12, color: '#6c757d', margin: '8px 0 0', textAlign: 'center' }}>
                                                        Upload the contract PDF after you've signed it
                                                    </p>
                                                </div>
                                            )}

                                            {/* Contract Fully Signed Message */}
                                            {application.contract_status === 'completed' && (
                                                <div style={{
                                                    padding: 12,
                                                    background: '#d4edda',
                                                    border: '2px solid #28a745',
                                                    borderRadius: 8,
                                                    color: '#155724',
                                                    textAlign: 'center',
                                                    fontWeight: 600,
                                                    fontSize: 14
                                                }}>
                                                    ✅ Contract Fully Signed
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Payment Section */}
                                <div style={{
                                    background: 'white',
                                    padding: 20,
                                    borderRadius: 12,
                                    border: '3px solid #212529'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <div style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: application.payment_status === 'paid' ? '#28a745' : '#ffc107',
                                            color: 'white',
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontSize: 18,
                                            fontWeight: 800
                                        }}>
                                            {application.payment_status === 'paid' ? '✓' : '💰'}
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Payment</h4>
                                    </div>

                                    {isTenant && application.payment_status === 'unpaid' && (
                                        <button
                                            onClick={handlePayment}
                                            disabled={processing}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontSize: 15,
                                                fontWeight: 700,
                                                cursor: processing ? 'not-allowed' : 'pointer',
                                                opacity: processing ? 0.6 : 1
                                            }}
                                        >
                                            {processing ? '⏳ Processing...' : '💰 Pay Rent Deposit'}
                                        </button>
                                    )}

                                    {application.payment_status === 'paid' && (
                                        <div style={{
                                            padding: 12,
                                            background: '#d4edda',
                                            border: '2px solid #28a745',
                                            borderRadius: 8,
                                            color: '#155724',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: 14
                                        }}>
                                            ✅ Payment Completed
                                        </div>
                                    )}

                                    {!isTenant && application.payment_status === 'unpaid' && (
                                        <div style={{
                                            padding: 12,
                                            background: '#fff3cd',
                                            border: '2px solid #ffc107',
                                            borderRadius: 8,
                                            color: '#856404',
                                            textAlign: 'center',
                                            fontSize: 13
                                        }}>
                                            ⏳ Waiting for tenant payment...
                                        </div>
                                    )}
                                </div>

                                {/* Finalize Button */}
                                {canFinalize && application.stage !== 'completed' && (
                                    <button
                                        onClick={handleFinalize}
                                        disabled={processing}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            marginTop: 20,
                                            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                                            color: '#212529',
                                            border: '3px solid #212529',
                                            borderRadius: 12,
                                            fontSize: 18,
                                            fontWeight: 800,
                                            cursor: processing ? 'not-allowed' : 'pointer',
                                            opacity: processing ? 0.6 : 1
                                        }}
                                    >
                                        {processing ? '⏳ Finalizing...' : '🎉 Finalize & Complete Application'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Tab 3: Completion */}
                        {activeTab === 2 && (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
                                <h3 style={{ margin: '0 0 16px', fontSize: 28, fontWeight: 800 }}>Application Completed!</h3>
                                <p style={{ fontSize: 16, color: '#6c757d', marginBottom: 32 }}>
                                    All steps have been successfully completed.
                                </p>

                                {/* Final Summary */}
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: 24,
                                    borderRadius: 12,
                                    border: '2px solid #dee2e6',
                                    textAlign: 'left'
                                }}>
                                    <h4 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Summary</h4>
                                    <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Property:</span>
                                            <strong>{application.propertyTitle}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Tenant:</span>
                                            <strong>{application.applicant}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Contract:</span>
                                            <strong style={{ color: '#28a745' }}>✓ Signed</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Payment:</span>
                                            <strong style={{ color: '#28a745' }}>✓ Paid</strong>
                                        </div>
                                    </div>

                                    {application.contract_url && (
                                        <a
                                            href={application.contract_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'block',
                                                marginTop: 20,
                                                padding: '12px',
                                                background: '#007bff',
                                                color: 'white',
                                                borderRadius: 8,
                                                textDecoration: 'none',
                                                textAlign: 'center',
                                                fontWeight: 600
                                            }}
                                        >
                                            📄 Download Final Contract
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Golden Bottom Decoration */}
                    <div style={{
                        height: 12,
                        background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)'
                    }}></div>
                </div>
            </div>

            {/* Response Modal (for Accept/Reject) */}
            {showResponseModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 500,
                        background: 'white',
                        borderRadius: 16,
                        border: '3px solid #212529',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: 10,
                            background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)'
                        }}></div>

                        <div style={{ padding: 24 }}>
                            <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>
                                {responseAction === 'accepted' ? '✓ Confirm Acceptance?' : '✗ Reject Application?'}
                            </h3>
                            <p style={{ color: '#6c757d', fontSize: 14, marginBottom: 20 }}>
                                Provide feedback to the tenant about your decision.
                            </p>

                            <form onSubmit={handleResponseSubmit}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                                        Feedback / Message {responseAction === 'rejected' && <span style={{ color: '#dc3545' }}>*</span>}
                                    </label>
                                    <textarea
                                        style={{
                                            width: '100%',
                                            padding: 10,
                                            borderRadius: 8,
                                            border: '2px solid #dee2e6',
                                            minHeight: 120,
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            fontSize: 14
                                        }}
                                        placeholder={responseAction === 'accepted'
                                            ? "E.g., Congratulations! Please proceed to contract signing..."
                                            : "Please explain the reason for rejection..."}
                                        value={feedbackText}
                                        onChange={e => setFeedbackText(e.target.value)}
                                        required={responseAction === 'rejected'}
                                    ></textarea>
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        style={{
                                            flex: 1,
                                            padding: 12,
                                            background: responseAction === 'accepted' ? '#28a745' : '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontSize: 15,
                                            fontWeight: 700,
                                            cursor: processing ? 'not-allowed' : 'pointer',
                                            opacity: processing ? 0.6 : 1
                                        }}
                                    >
                                        {processing ? '⏳ Sending...' : '✓ Confirm & Send'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowResponseModal(false)}
                                        disabled={processing}
                                        style={{
                                            padding: '12px 20px',
                                            background: '#f8f9fa',
                                            color: '#495057',
                                            border: '2px solid #dee2e6',
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            cursor: processing ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div style={{
                            height: 10,
                            background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)'
                        }}></div>
                    </div>
                </div>
            )}

            {/* Stripe Payment Modal */}
            {showPaymentModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 10001,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 500,
                        background: 'white',
                        borderRadius: 16,
                        border: '4px solid #212529',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: 12,
                            background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)'
                        }}></div>

                        <Elements stripe={stripePromise}>
                            <StripePaymentForm
                                amount={1000}
                                applicationId={application.id}
                                onSuccess={handlePaymentSuccess}
                                onCancel={() => setShowPaymentModal(false)}
                            />
                        </Elements>

                        <div style={{
                            height: 12,
                            background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)'
                        }}></div>
                    </div>
                </div>
            )}
        </>
    );
};
