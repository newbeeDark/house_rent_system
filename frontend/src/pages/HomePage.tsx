import React, { useEffect, useState } from 'react';
import { useProperties } from '../hooks/useProperties';
import { PropertyCard } from '../components/Property/PropertyCard';
import { NearbyList } from '../components/Property/NearbyList';
import { Layout } from '../components/Layout/Layout';
import type { Property } from '../types';
import { haversineKm } from '../utils/geo';

export const HomePage: React.FC = () => {
    const { properties: baseProperties, loading } = useProperties();
    const [sortedProperties, setSortedProperties] = useState<Property[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [jumpPage, setJumpPage] = useState('');
    const ITEMS_PER_PAGE = 10;

    // Filter States
    const [simpleSearch, setSimpleSearch] = useState('');
    const [priceRange, setPriceRange] = useState('all');

    const [advFilters, setAdvFilters] = useState({
        title: '',
        address: '',
        minPrice: '',
        maxPrice: '',
        beds: '',
        bathroom: '',
        kitchen: 'any',
        minArea: '',
        propertyType: 'any',
        furnished: 'any',
        availableFrom: '',
        amenities: [] as string[]
    });

    const AMENITIES = ["Wi-Fi", "Parking", "AirCon", "Pool", "Gym", "Security", "Washing machine", "Hot water"];

    useEffect(() => {
        if (loading) return;
        let filtered = [...baseProperties];

        if (!showAdvanced) {
            // Simple Search
            if (simpleSearch) {
                const q = simpleSearch.toLowerCase();
                filtered = filtered.filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    p.area.toLowerCase().includes(q) ||
                    (p.address && p.address.toLowerCase().includes(q))
                );
            }
            if (priceRange !== 'all') {
                if (priceRange === 'low') filtered = filtered.filter(p => p.price < 500);
                if (priceRange === 'mid') filtered = filtered.filter(p => p.price >= 500 && p.price <= 1000);
                if (priceRange === 'high') filtered = filtered.filter(p => p.price > 1000);
            }
        } else {
            // Advanced Search
            if (advFilters.title) filtered = filtered.filter(p => p.title.toLowerCase().includes(advFilters.title.toLowerCase()));
            if (advFilters.address) filtered = filtered.filter(p => (p.address || p.area).toLowerCase().includes(advFilters.address.toLowerCase()));

            if (advFilters.minPrice) filtered = filtered.filter(p => p.price >= Number(advFilters.minPrice));
            if (advFilters.maxPrice) filtered = filtered.filter(p => p.price <= Number(advFilters.maxPrice));

            if (advFilters.beds) filtered = filtered.filter(p => p.beds === Number(advFilters.beds));
            if (advFilters.bathroom) filtered = filtered.filter(p => p.bathroom === Number(advFilters.bathroom));

            if (advFilters.kitchen !== 'any') {
                const needKitchen = advFilters.kitchen === 'yes';
                filtered = filtered.filter(p => !!p.kitchen === needKitchen);
            }

            if (advFilters.minArea) filtered = filtered.filter(p => (p.propertySize || 0) >= Number(advFilters.minArea));

            if (advFilters.propertyType !== 'any') filtered = filtered.filter(p => p.propertyType === advFilters.propertyType);

            if (advFilters.furnished !== 'any') filtered = filtered.filter(p => p.furnished === advFilters.furnished);

            if (advFilters.availableFrom) filtered = filtered.filter(p => !p.availableFrom || p.availableFrom >= advFilters.availableFrom);

            if (advFilters.amenities.length > 0) {
                filtered = filtered.filter(p => {
                    const pAmenities = (p.amenities || p.features || []);
                    return advFilters.amenities.every(a => pAmenities.includes(a));
                });
            }
        }

        // Sorting
        if (userLocation) {
            filtered = filtered.map(p => {
                if (p.lat && p.lon) {
                    return { ...p, distance: haversineKm(userLocation.lat, userLocation.lon, p.lat, p.lon) };
                }
                return p;
            });
            filtered.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        } else {
            filtered.sort((a, b) => a.price - b.price);
        }

        setSortedProperties(filtered);
        setCurrentPage(1);
    }, [baseProperties, loading, userLocation, showAdvanced, simpleSearch, priceRange, advFilters]);

    const toggleAmenity = (a: string) => {
        setAdvFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a]
        }));
    };

    // Pagination Logic
    const totalPages = Math.ceil(sortedProperties.length / ITEMS_PER_PAGE);
    const currentProperties = sortedProperties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getPageNumbers = () => {
        const maxButtons = 7;
        let startPage = Math.max(1, currentPage - 3);
        let endPage = Math.min(totalPages, currentPage + 3);

        if (endPage - startPage + 1 < maxButtons) {
            if (currentPage < totalPages / 2) {
                endPage = Math.min(totalPages, startPage + maxButtons - 1);
            } else {
                startPage = Math.max(1, endPage - maxButtons + 1);
            }
        }
        
        startPage = Math.max(1, startPage);
        endPage = Math.min(totalPages, endPage);

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const handleJump = () => {
        const p = parseInt(jumpPage);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
            setCurrentPage(p);
            setJumpPage('');
        }
    };

    return (
        <Layout>
            <section className="hero" style={{ marginTop: '8px', display: 'block' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '18px', margin: 0 }}>Find your home</h2>
                        <button className="btn btn-ghost" onClick={() => setShowAdvanced(!showAdvanced)}>
                            {showAdvanced ? 'Simple Search' : 'Advanced Search'}
                        </button>
                    </div>

                    {!showAdvanced ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                className="input-field"
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                placeholder="Search area, landmark, title..."
                                value={simpleSearch}
                                onChange={e => setSimpleSearch(e.target.value)}
                            />
                            <select
                                style={{ padding: '0 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                value={priceRange}
                                onChange={e => setPriceRange(e.target.value)}
                            >
                                <option value="all">All Prices</option>
                                <option value="low">&lt; RM 500</option>
                                <option value="mid">RM 500 - 1000</option>
                                <option value="high">&gt; RM 1000</option>
                            </select>
                            <button
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(p => {
                                            setUserLocation({ lat: p.coords.latitude, lon: p.coords.longitude });
                                        });
                                    }
                                }}
                                className="btn btn-ghost"
                            >
                                📍 {userLocation ? 'On' : 'Locate'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                            <input placeholder="Title keyword" value={advFilters.title} onChange={e => setAdvFilters({ ...advFilters, title: e.target.value })} className="search-input" />
                            <input placeholder="Address / Area" value={advFilters.address} onChange={e => setAdvFilters({ ...advFilters, address: e.target.value })} className="search-input" />

                            <div style={{ display: 'flex', gap: 4 }}>
                                <input type="number" placeholder="Min Price" value={advFilters.minPrice} onChange={e => setAdvFilters({ ...advFilters, minPrice: e.target.value })} className="search-input" />
                                <input type="number" placeholder="Max" value={advFilters.maxPrice} onChange={e => setAdvFilters({ ...advFilters, maxPrice: e.target.value })} className="search-input" />
                            </div>

                            <div style={{ display: 'flex', gap: 4 }}>
                                <input type="number" placeholder="Beds" value={advFilters.beds} onChange={e => setAdvFilters({ ...advFilters, beds: e.target.value })} className="search-input" />
                                <input type="number" placeholder="Baths" value={advFilters.bathroom} onChange={e => setAdvFilters({ ...advFilters, bathroom: e.target.value })} className="search-input" />
                            </div>

                            <input type="number" placeholder="Min Size (m²)" value={advFilters.minArea} onChange={e => setAdvFilters({ ...advFilters, minArea: e.target.value })} className="search-input" />

                            <select value={advFilters.kitchen} onChange={e => setAdvFilters({ ...advFilters, kitchen: e.target.value })} className="search-input">
                                <option value="any">Kitchen: Any</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>

                            <select value={advFilters.propertyType} onChange={e => setAdvFilters({ ...advFilters, propertyType: e.target.value })} className="search-input">
                                <option value="any">Type: Any</option>
                                {["Studio", "Apartment", "Condo", "Terrace", "Bungalow", "Room"].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>

                            <select value={advFilters.furnished} onChange={e => setAdvFilters({ ...advFilters, furnished: e.target.value })} className="search-input">
                                <option value="any">Furnishing: Any</option>
                                <option value="full">Full</option>
                                <option value="half">Partial</option>
                                <option value="none">None</option>
                            </select>

                            <input
                                type="date"
                                title="Available From"
                                value={advFilters.availableFrom}
                                onChange={e => setAdvFilters({ ...advFilters, availableFrom: e.target.value })}
                                className="search-input"
                            />

                            <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Amenities</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {AMENITIES.map(a => (
                                        <button
                                            key={a}
                                            onClick={() => toggleAmenity(a)}
                                            style={{
                                                fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                                background: advFilters.amenities.includes(a) ? '#e0f7fa' : '#f5f5f5',
                                                color: advFilters.amenities.includes(a) ? '#006064' : '#666'
                                            }}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <main className="main" role="main">
                <section>
                    <div id="listings" className="listings" aria-live="polite" style={{ marginTop: '12px' }}>
                        {loading && <div>Loading...</div>}
                        {!loading && sortedProperties.length === 0 && <div style={{ padding: 20 }}>No properties found.</div>}
                        {currentProperties.map((p, idx) => (
                            <PropertyCard key={p.id} property={p} delay={idx * 70} />
                        ))}
                    </div>

                    {!loading && sortedProperties.length > 0 && (
                        <div className="pagination-container">
                            <div className="pagination-pages">
                                {getPageNumbers().map(p => (
                                    <button 
                                        key={p} 
                                        onClick={() => setCurrentPage(p)} 
                                        className={`page-btn ${p === currentPage ? 'active' : ''}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <div className="pagination-jump">
                                <input 
                                    type="number" 
                                    value={jumpPage} 
                                    onChange={(e) => setJumpPage(e.target.value)} 
                                    placeholder="Page"
                                    className="jump-input"
                                />
                                <button onClick={handleJump} className="jump-btn">Jump to</button>
                            </div>
                        </div>
                    )}
                </section>

                <aside className="sidebar in-view">
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>Nearby</div>
                    <div className="map-placeholder" style={{ height: 200, background: '#eee', borderRadius: 8 }}>
                        <iframe
                            title="Map"
                            src="https://maps.google.com/maps?width=100%&height=300&hl=en&q=University%20Kebangsaan%20Malaysia&ie=UTF8&t=&z=14&iwloc=B&output=embed"
                            style={{ width: '100%', height: '100%', border: 0, borderRadius: 8 }}
                            loading="lazy"
                        />
                    </div>
                    <NearbyList properties={sortedProperties} userLocation={userLocation} />
                </aside>
            </main>
            <style>{`
                .search-input {
                    padding: 8px;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    font-size: 13px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .pagination-container {
                    margin-top: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .pagination-pages {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .page-btn {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #666;
                    transition: all 0.2s;
                }
                .page-btn:hover {
                    background: #f5f5f5;
                    border-color: #ccc;
                }
                .page-btn.active {
                    background: #2563eb;
                    color: white;
                    border-color: #2563eb;
                }
                .pagination-jump {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .jump-input {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    width: 60px;
                    text-align: center;
                }
                .jump-btn {
                    padding: 8px 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #475569;
                    transition: all 0.2s;
                }
                .jump-btn:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                    color: #334155;
                }
            `}</style>
        </Layout>
    );
};
