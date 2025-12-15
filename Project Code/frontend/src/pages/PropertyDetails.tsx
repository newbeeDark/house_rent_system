import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperty } from '../hooks/useProperties';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export const PropertyDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { property, loading, error } = useProperty(Number(id));
    const [activeSlide, setActiveSlide] = useState(0);
    const { user } = useAuth();
    const [fav, setFav] = useState(false);
    const [showReportSuccess, setShowReportSuccess] = useState(false);

    // Report Modal State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({
        targetRole: 'landlord',
        category: 'Fraud / Scam',
        description: ''
    });

    const handleReportClick = () => {
        if (!user) {
            alert("Please log in to report.");
            return;
        }
        setReportForm({
            ...reportForm,
            targetRole: property?.host?.type?.toLowerCase() || 'landlord'
        });
        setShowReportModal(true);
    };

    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowReportModal(false);
        // Simulate report success
        setShowReportSuccess(true);
        setTimeout(() => setShowReportSuccess(false), 5000);
    };

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

                                    <label style={labelStyle}>Complaint Target Role</label>
                                    <select
                                        style={inputStyle}
                                        value={reportForm.targetRole}
                                        onChange={e => setReportForm({ ...reportForm, targetRole: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="landlord">Landlord</option>
                                        <option value="agent">Agent</option>
                                    </select>

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
                                {property.address || property.area} · {property.beds} bed
                                {property.bathroom ? ` · ${property.bathroom} bath` : ''}
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
                                <div className="feature">{property.beds} Bed</div>
                                {property.bathroom && <div className="feature">{property.bathroom} Bath</div>}
                                {property.kitchen && <div className="feature">Kitchen</div>}
                                {property.furnished && property.furnished !== 'none' && <div className="feature">{property.furnished === 'full' ? 'Fully Furnished' : 'Partially Furnished'}</div>}
                                {(property.features || []).slice(0, 2).map(f => <div key={f} className="feature">{f}</div>)}
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
                            {(property.amenities || property.features || []).map(f => <div key={f} className="feature">{f}</div>)}
                        </div>
                    </div>

                    <div className="section">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {user?.role === 'student' && (
                                <Link to={`/apply/${property.id}`} className="btn btn-primary">Apply now</Link>
                            )}
                            <button className="btn btn-ghost">Message host</button>
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
