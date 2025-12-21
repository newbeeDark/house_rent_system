import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { PropertyService } from '../services/property.service';
import type { Property } from '../types';

export const Favorites: React.FC = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const data = await PropertyService.getFavorites(user.id);
                setFavorites(data);
            } catch (error) {
                console.error('Failed to fetch favorites', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    if (!user) {
        return (
            <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
                <Navbar />
                <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
                    <p>Please log in to view your favorites.</p>
                    <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 10, padding: '8px 16px', background: '#007bff', color: '#fff', borderRadius: 4, textDecoration: 'none' }}>Log In</Link>
                </main>
            </div>
        );
    }

    return (
        <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
            <Navbar />

            <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>My Favorites</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Properties you've saved for later.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {favorites.length > 0 ? (
                            favorites.map(item => (
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
                                            <img src={item.img || '/placeholder-house.jpg'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                                                {item.propertyType || 'Property'} • {item.beds} Beds
                                            </div>
                                            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                📍 {item.address || item.area}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', paddingRight: 8 }}>
                                            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>RM {item.price}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: 8 }}>/ month</div>
                                            <Link to={`/property/${item.id}`} style={{
                                                display: 'inline-block',
                                                padding: '6px 12px',
                                                background: '#e0f7fa',
                                                color: '#006064',
                                                borderRadius: 6,
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                textDecoration: 'none'
                                            }} onClick={(e) => e.stopPropagation()}>
                                                View Property
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
                )}
            </main>
        </div>
    );
};
