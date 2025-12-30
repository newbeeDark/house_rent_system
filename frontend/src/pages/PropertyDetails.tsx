import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperty } from '../hooks/useProperties';
import { PropertyService } from '../services/property.service';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

const formatFeature = (f: string) => {
    if (f.toLowerCase() === 'aircon') return 'AirConditioner';
    return f;
};

export const PropertyDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth(); // Moved hook to top level

    // ✅ 修正：直接使用字符串 id，并处理 undefined 情况
    const { property, loading, error } = useProperty(id || '');

    // Increment view count (Session based: 1 count per session per property)
    React.useEffect(() => {
        if (id) {
            const sessionKey = `viewed_properties_session`;
            let viewedList: string[] = [];
            try {
                const stored = sessionStorage.getItem(sessionKey);
                if (stored) viewedList = JSON.parse(stored);
            } catch (e) {
                console.error("Session storage parse error", e);
            }

            if (!viewedList.includes(id)) {
                // 1. Call existing service (Legacy/UI update)
                PropertyService.incrementViews(id);

                // 2. Insert into Supabase Analytics Log
                // We use 'then' to avoid making this useEffect async
                supabase.from('property_views_log').insert({
                    property_id: id,
                    viewer_id: user?.id || null
                }).then(({ error }) => {
                    if (error) {
                        console.error("Analytics: Failed to log view", error);
                    } else {
                        // Optional: console.log("Analytics: View logged");
                    }
                });

                viewedList.push(id);
                sessionStorage.setItem(sessionKey, JSON.stringify(viewedList));
            }
        }
    }, [id, user?.id]); // Re-run if ID changes. user?.id ensures we have latest user state if it loads quickly.

    const [activeSlide, setActiveSlide] = useState(0);
    // const { user } = useAuth(); // Removed duplicate call
    const [fav, setFav] = useState(false);
    const [showReportSuccess, setShowReportSuccess] = useState(false);
    const [existingApplication, setExistingApplication] = useState<any>(null);
    const [checkingApplication, setCheckingApplication] = useState(true);

    // Report Modal State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({
        name: '',
        category: 'Fraud / Scam',
        description: ''
    });

    // Rental Apply Modal State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyForm, setApplyForm] = useState({
        message: '',
        appointmentTime: ''
    });
    const [submittingApplication, setSubmittingApplication] = useState(false);

    const handleReportClick = () => {
        if (!user) {
            alert("Please log in to report.");
            return;
        }
        setReportForm({
            name: '',
            category: 'Fraud / Scam',
            description: ''
        });
        setShowReportModal(true);
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !property) return;

        try {
            // Insert into complaints table - trigger will handle notifications
            const { error: insertError } = await supabase
                .from('complaints')
                .insert({
                    reporter_id: user.id,
                    target_type: 'property',
                    target_id: property.id,
                    category: reportForm.category,
                    description: reportForm.description
                });

            if (insertError) throw insertError;

            setShowReportModal(false);
            setShowReportSuccess(true);
            setTimeout(() => setShowReportSuccess(false), 5000);
        } catch (err) {
            console.error('Report error:', err);
            alert('Failed to submit report.');
        }
    };

    const handleApplyClick = () => {
        if (!user) {
            alert("Please log in to apply.");
            return;
        }
        setApplyForm({ message: '', appointmentTime: '' });
        setShowApplyModal(true);
    };

    const handleApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !property) return;

        setSubmittingApplication(true);
        try {
            const { error } = await supabase.from('applications').insert({
                property_id: property.id,
                applicant_id: user.id,
                property_owner_id: property.ownerId,
                message: applyForm.message,
                appointment_at: applyForm.appointmentTime || null,
                status: 'pending',
                documents: []
            });

            if (error) throw error;

            setShowApplyModal(false);
            alert('Application submitted successfully!');
            setApplyForm({ message: '', appointmentTime: '' });
        } catch (err) {
            console.error('Error submitting application:', err);
            alert('Failed to submit application. Please try again.');
        } finally {
            setSubmittingApplication(false);
        }
    };

    React.useEffect(() => {
        const checkApplication = async () => {
            if (!user || !id) {
                setCheckingApplication(false);
                return;
            }
            const { data } = await supabase
                .from('applications')
                .select('*')
                .eq('property_id', id)
                .eq('applicant_id', user.id)
                .in('status', ['pending', 'accepted'])
                .in('stage', ['application', 'processing'])
                .maybeSingle();
            setExistingApplication(data);
            setCheckingApplication(false);
        };
        checkApplication();
    }, [user, id]);

    if (loading) return <Layout><div className="page">Loading...</div></Layout>;
    if (error || !property) return <Layout><div className="page">Property not found</div></Layout>;

    // Carousel images
    const images = property.images && property.images.length > 0 ? property.images : [property.img];

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid rgba(10,20,40,.1)',
        marginBottom: '12px',
        boxSizing: 'border-box',
        fontSize: '14px' // Consistent with complaint.html typical default
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '13px',
        color: '#6a7480',
        display: 'block',
        marginBottom: '4px'
    };

    return (
        <Layout>
            <main className="layout" role="main">
                {/* Report Notification */}
                {showReportSuccess && (
                    <div style={{
                        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                        background: '#4caf50', color: 'white', padding: '12px 24px', borderRadius: '8px',
                        zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                        Report submitted successfully. System notified.
                    </div>
                )}

                {/* Report Modal */}
                {showReportModal && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
                    }}>
                        <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'white', padding: '24px', borderRadius: '14px' }}>
                            <h2 style={{ margin: '0 0 16px', fontSize: '20px' }}>Submit a Complaint</h2>

                            <form onSubmit={handleReportSubmit}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>Your Role</label>
                                    <input
                                        style={{ ...inputStyle, background: '#f5f5f5', color: '#888' }}
                                        value={user?.role || 'Guest'}
                                        disabled
                                    />

                                    <label style={labelStyle}>Name *</label>
                                    <input
                                        style={inputStyle}
                                        value={reportForm.name}
                                        onChange={e => setReportForm({ ...reportForm, name: e.target.value })}
                                        required
                                        placeholder="Enter your name"
                                    />

                                    <label style={labelStyle}>Complaint Target</label>
                                    <input
                                        style={{ ...inputStyle, background: '#f5f5f5', color: '#888' }}
                                        value="Property"
                                        disabled
                                    />

                                    <label style={labelStyle}>Complaint Category</label>
                                    <select
                                        style={inputStyle}
                                        required
                                        value={reportForm.category}
                                        onChange={e => setReportForm({ ...reportForm, category: e.target.value })}
                                    >
                                        <option>Fraud / Scam</option>
                                        <option>False Information</option>
                                        <option>Unresponsive</option>
                                        <option>Harassment</option>
                                        <option>Other</option>
                                    </select>

                                    <label style={labelStyle}>Description</label>
                                    <textarea
                                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                        rows={5}
                                        placeholder="Describe the issue in detail..."
                                        required
                                        value={reportForm.description}
                                        onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px 14px' }}>Submit Complaint</button>
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{ flex: 1, padding: '10px 14px', background: '#f1f1f1', color: '#333' }}
                                        onClick={() => setShowReportModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )

                }

                {/* Rental Apply Modal */}
                {showApplyModal && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
                    }}>
                        <div className="card" style={{
                            width: '100%', maxWidth: '550px', background: 'white',
                            borderRadius: '16px', overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            border: '3px solid #212529'
                        }}>
                            {/* Golden decorative top pattern */}
                            <div style={{
                                height: '12px',
                                background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)',
                                boxShadow: '0 2px 4px rgba(212,175,55,0.3)'
                            }}></div>

                            <div style={{ padding: '32px 24px 24px' }}>
                                <h2 style={{
                                    margin: '0 0 8px',
                                    fontSize: '26px',
                                    fontWeight: 800,
                                    color: '#212529',
                                    textAlign: 'center'
                                }}>🏠 Rental Apply</h2>
                                <p style={{
                                    textAlign: 'center',
                                    color: '#6c757d',
                                    fontSize: '14px',
                                    marginBottom: '24px'
                                }}>Submit your application for this property</p>

                                <form onSubmit={handleApplySubmit}>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={labelStyle}>Name</label>
                                        <input
                                            style={{ ...inputStyle, background: '#f8f9fa', color: '#495057', fontWeight: 600 }}
                                            value={user?.name || 'Not provided'}
                                            disabled
                                        />
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={labelStyle}>Identity / Student ID</label>
                                        <input
                                            style={{ ...inputStyle, background: '#f8f9fa', color: '#495057', fontWeight: 600 }}
                                            value={user?.email || 'Not provided'}
                                            disabled
                                        />
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ ...labelStyle, fontWeight: 600 }}>Application Statement *</label>
                                        <textarea
                                            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                                            rows={5}
                                            placeholder="Tell the landlord why you're a great tenant and any special requirements..."
                                            required
                                            value={applyForm.message}
                                            onChange={e => setApplyForm({ ...applyForm, message: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ ...labelStyle, fontWeight: 600 }}>Preferred Appointment Time</label>
                                        <input
                                            type="datetime-local"
                                            style={{ ...inputStyle, cursor: 'pointer' }}
                                            value={applyForm.appointmentTime}
                                            onChange={e => setApplyForm({ ...applyForm, appointmentTime: e.target.value })}
                                        />
                                        <p style={{ fontSize: '12px', color: '#adb5bd', marginTop: '4px', marginBottom: 0 }}>
                                            💡 Optional: Schedule a viewing appointment
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{
                                                flex: 1,
                                                padding: '14px',
                                                fontSize: '16px',
                                                fontWeight: 700,
                                                background: 'linear-gradient(135deg, #212529 0%, #495057 100%)',
                                                border: '3px solid #212529'
                                            }}
                                            disabled={submittingApplication}
                                        >
                                            {submittingApplication ? '⏳ Submitting...' : '✓ Submit Application'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn"
                                            style={{
                                                padding: '14px 20px',
                                                background: '#f8f9fa',
                                                color: '#495057',
                                                border: '3px solid #dee2e6',
                                                fontWeight: 600
                                            }}
                                            onClick={() => setShowApplyModal(false)}
                                            disabled={submittingApplication}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Golden decorative bottom pattern */}
                            <div style={{
                                height: '12px',
                                background: 'repeating-linear-gradient(90deg, #d4af37 0px, #f4d03f 10px, #d4af37 20px)',
                                boxShadow: '0 -2px 4px rgba(212,175,55,0.3)'
                            }}></div>
                        </div>
                    </div>
                )}


                {/* Left: Main Content */}
                <section className="card" aria-labelledby="propTitle">
                    <div className="carousel" id="carousel">
                        <button className="share-btn" title="Share" onClick={() => navigator.clipboard.writeText(window.location.href)}>🔗</button>
                        <button
                            className="fav-btn"
                            title="Add to favourites"
                            onClick={() => setFav(!fav)}
                            style={{ color: fav ? 'red' : 'inherit' }}
                        >
                            {fav ? '♥' : '♡'}
                        </button>

                        <div style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}>
                            <img src={images[activeSlide]} alt={`Slide ${activeSlide + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div className="dots">
                            {images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={clsx('dot', idx === activeSlide && 'active')}
                                    onClick={() => setActiveSlide(idx)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="meta-row">
                        <div>
                            <div className="title" id="pTitle">{property.title}</div>
                            <div className="tiny">
                                {property.address || property.area} · {property.beds} bedroom
                                {property.bathroom ? ` · ${property.bathroom} bathroom` : ''}
                                {property.propertySize ? ` · ${property.propertySize} m²` : ''}
                                {property.rating ? ` · Rating ${property.rating}` : ''}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="price">RM {property.price} / month</div>
                            <div className="tiny">Deposit: RM {property.deposit || property.price}</div>
                        </div>
                    </div>

                    <div className="section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 700 }}>Overview</div>
                            <div className="tags">
                                <div className="feature">{property.beds} Bedroom</div>
                                {property.bathroom && <div className="feature">{property.bathroom} Bathroom</div>}
                                {property.kitchen && <div className="feature">Kitchen</div>}
                                {property.furnished && property.furnished !== 'none' && <div className="feature">{property.furnished === 'full' ? 'Fully Furnished' : 'Partially Furnished'}</div>}
                                {(property.features || []).slice(0, 2).map(f => <div key={f} className="feature">{formatFeature(f)}</div>)}
                            </div>
                        </div>
                        <div className="notes">{property.desc}</div>
                    </div>

                    <div className="section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 700 }}>Amenities</div>
                            <div className="tiny">Listed features</div>
                        </div>
                        <div className="features">
                            {(property.amenities || property.features || []).map(f => <div key={f} className="feature">{formatFeature(f)}</div>)}
                        </div>
                    </div>

                    <div className="section">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {user?.role === 'student' && !checkingApplication && (
                                existingApplication ? (
                                    <Link to="/applications" className="btn btn-primary">📄 View Application Status</Link>
                                ) : (
                                    <button onClick={handleApplyClick} className="btn btn-primary">🏠 Rental Apply</button>
                                )
                            )}
                            {(user?.role === 'landlord' || user?.role === 'agent') && user?.id === property.ownerId && (
                                <Link to="/create-listing" state={{ mode: 'edit', property }} className="btn btn-primary">Edit Property</Link>
                            )}
                            <button className="btn btn-ghost" style={{ color: '#d32f2f' }} onClick={handleReportClick}>Report</button>
                        </div>
                    </div>

                    <div className="section">
                        <div style={{ fontWeight: 700 }}>Images</div>
                        <div className="thumbs">
                            {images.map((src, idx) => (
                                <img key={idx} src={src} alt="thumb" onClick={() => setActiveSlide(idx)} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Right: Host / Details */}
                <aside className="card" aria-labelledby="hostTitle">
                    <h3>Host information</h3>
                    {property.host && (
                        <div style={{ marginTop: '8px' }} className="host-card">
                            <div className="host-avatar">
                                {property.host.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="host-info">
                                <div style={{ fontWeight: 800 }}>{property.host.name}</div>
                                <div className="tiny">{property.host.type} · {property.host.contact}</div>
                            </div>
                        </div>
                    )}
                </aside>
            </main>
        </Layout>
    );
};
