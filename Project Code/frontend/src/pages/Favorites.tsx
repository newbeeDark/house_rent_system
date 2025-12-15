import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';

interface FavoriteItem {
    id: number;
    title: string;
    price: number;
    location: string;
    type: string;
    beds: number;
    image: string;
    addedDate: string;
}

const MOCK_FAVORITES: FavoriteItem[] = [
    {
        id: 101,
        title: "Modern Studio near UKM Campus",
        price: 1200,
        location: "Vista Bangi, Jalan Reko",
        type: "Studio",
        beds: 1,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
        addedDate: "2025-12-10"
    },
    {
        id: 103,
        title: "Cozy 2-Bedroom Apartment",
        price: 1800,
        location: "Savanna Executive Suites",
        type: "Apartment",
        beds: 2,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
        addedDate: "2025-12-12"
    }
];

export const Favorites: React.FC = () => {
    return (
        <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
            <Navbar />

            <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>My Favorites</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Properties you've saved for later.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {MOCK_FAVORITES.length > 0 ? (
                        MOCK_FAVORITES.map(item => (
                            <Link to={`/property/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card" style={{
                                    background: '#fff',
                                    borderRadius: 12,
                                    padding: 12,
                                    display: 'flex',
                                    gap: 16,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                    transition: 'transform 0.2s',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ width: 120, height: 90, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>{item.type} • {item.beds} Beds</div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            📍 {item.location}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', paddingRight: 8 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>RM {item.price}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: 8 }}>/ month</div>
                                        <Link to={`/contract/${item.id}`} style={{
                                            display: 'inline-block',
                                            padding: '6px 12px',
                                            background: '#e0f7fa',
                                            color: '#006064',
                                            borderRadius: 6,
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textDecoration: 'none'
                                        }}>
                                            Draft Contract
                                        </Link>
                                    </div>

                                </div>
                            </Link>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                            No favorites added yet.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
