import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Layout/Navbar';

// Reuse mock data from Favorites (in a real app this would come from an API)
const MOCK_PROPERTIES: Record<string, { title: string; address: string; price: number; type: string; beds: number; landlord: string }> = {
    '101': {
        title: "Modern Studio near UKM Campus",
        address: "Unit A-12-05, Vista Bangi, Jalan Reko, 43600 Bangi, Selangor",
        price: 1200,
        type: "Studio",
        beds: 1,
        landlord: "Mr. Ahmad Razali"
    },
    '103': {
        title: "Cozy 2-Bedroom Apartment",
        address: "Unit B-05-02, Savanna Executive Suites, Southville City, 43800 Dengkil, Selangor",
        price: 1800,
        type: "Apartment",
        beds: 2,
        landlord: "Ms. Sarah Chen"
    }
};

export const ContractReport: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [date] = useState(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
    const [refNo] = useState(`CNT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${new Date().getFullYear()}`);

    const property = id ? MOCK_PROPERTIES[id] : null;

    if (!user) {
        return (
            <div className="page" style={{ padding: 40, textAlign: 'center' }}>
                <p>Please log in to view contracts.</p>
                <button onClick={() => navigate('/login')} className="btn btn-primary">Log In</button>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="page" style={{ padding: 80, textAlign: 'center' }}>
                <Navbar />
                <h2>Contract Not Found</h2>
                <p>The property details could not be loaded.</p>
                <button onClick={() => navigate('/favorites')} className="btn btn-ghost">Back to Favorites</button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="contract-page" style={{ background: '#525659', minHeight: '100vh', padding: '40px 0' }}>
            <div className="no-print">
                <Navbar />
            </div>

            <main className="paper-document">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40, borderBottom: '2px solid #000', paddingBottom: 20 }}>
                    <h1 style={{ fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10 }}>Residential Tenancy Agreement</h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555' }}>
                        <span>Reference No: <strong>{refNo}</strong></span>
                        <span>Date: <strong>{date}</strong></span>
                    </div>
                </div>

                {/* Parties */}
                <section className="section">
                    <h3 className="section-title">1. The Parties</h3>
                    <p>This Tenancy Agreement is made on <strong>{date}</strong> between:</p>

                    <div className="party-box">
                        <div className="party-role">Landlord</div>
                        <div className="party-name">{property.landlord}</div>
                        <div className="party-details">("The Landlord")</div>
                    </div>

                    <div style={{ textAlign: 'center', margin: '10px 0', fontStyle: 'italic' }}>- AND -</div>

                    <div className="party-box">
                        <div className="party-role">Tenant</div>
                        <div className="party-name">{user.name}</div>
                        <div className="party-details">Passport/IC: {user.id ? `${user.id.substring(0, 6)}-XX-XXXX` : 'A199XXX'}</div>
                        <div className="party-details">("The Tenant")</div>
                    </div>
                </section>

                {/* Property Details */}
                <section className="section">
                    <h3 className="section-title">2. Although Property</h3>
                    <p>The Landlord agrees to let and the Tenant agrees to take the property situated at:</p>
                    <div style={{ background: '#f9f9f9', padding: '15px', border: '1px solid #ddd', margin: '10px 0' }}>
                        <strong>{property.address}</strong>
                        <br />
                        <span style={{ fontSize: '13px', color: '#666' }}>({property.title})</span>
                    </div>
                    <p>Together with the fixtures and fittings therein.</p>
                </section>

                {/* Terms */}
                <section className="section">
                    <h3 className="section-title">3. Key Terms</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: 8, borderBottom: '1px solid #eee', width: '40%', color: '#666' }}>Monthly Rental</td>
                                <td style={{ padding: 8, borderBottom: '1px solid #eee', fontWeight: 'bold' }}>RM {property.price.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 8, borderBottom: '1px solid #eee', color: '#666' }}>Security Deposit</td>
                                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>RM {(property.price * 2).toFixed(2)} (2 Months)</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 8, borderBottom: '1px solid #eee', color: '#666' }}>Utility Deposit</td>
                                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>RM {(property.price * 0.5).toFixed(2)} (0.5 Month)</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 8, borderBottom: '1px solid #eee', color: '#666' }}>Tenancy Period</td>
                                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>12 Months</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Signatures */}
                <section className="section" style={{ marginTop: 60 }}>
                    <h3 className="section-title">4. Signatures</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 40 }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: 10 }}>
                            <div style={{ marginBottom: 40, height: 40, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px', border: '1px dashed #ccc' }}>
                                (Signed Digitally)
                            </div>
                            <div style={{ fontWeight: 'bold' }}>{property.landlord}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Landlord</div>
                        </div>

                        <div style={{ borderTop: '1px solid #000', paddingTop: 10 }}>
                            <div style={{ marginBottom: 40, height: 40, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px', border: '1px dashed #ccc' }}>
                                (Signed Digitally)
                            </div>
                            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Tenant</div>
                        </div>
                    </div>
                </section>

                <div style={{ marginTop: 60, textAlign: 'center', fontSize: '10px', color: '#999', borderTop: '1px solid #eee', paddingTop: 20 }}>
                    This is a computer-generated document. No physical signature is required if validated digitally via UKM Rented System.
                    <br />GUID: {Math.random().toString(36).substring(7)}
                </div>
            </main>

            {/* Action Bar */}
            <div className="no-print" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'white',
                padding: '16px',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'center',
                gap: 16
            }}>
                <button onClick={() => navigate(-1)} className="btn btn-ghost">Close</button>
                <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🖨️</span> Generate Report (PDF)
                </button>
            </div>

            <style>{`
                .paper-document {
                    width: 210mm;
                    min-height: 297mm;
                    padding: 20mm;
                    margin: 0 auto;
                    background: white;
                    box-shadow: 0 0 20px rgba(0,0,0,0.3);
                    font-family: "Times New Roman", serif;
                    color: #333;
                    box-sizing: border-box;
                }
                .section { margin-bottom: 24px; }
                .section-title { 
                    font-size: 14px; 
                    text-transform: uppercase; 
                    border-bottom: 1px solid #ddd; 
                    padding-bottom: 4px; 
                    margin-bottom: 12px;
                    color: #000;
                }
                .party-box { padding: 10px; background: #fff; }
                .party-role { font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; }
                .party-name { font-size: 16px; font-weight: bold; margin: 4px 0; }
                .party-details { font-size: 13px; color: #555; }
                
                @media print {
                    .no-print { display: none !important; }
                    .contract-page { background: white !important; padding: 0 !important; }
                    .paper-document { 
                        width: 100%; 
                        box-shadow: none; 
                        margin: 0; 
                        padding: 0;
                    }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};
