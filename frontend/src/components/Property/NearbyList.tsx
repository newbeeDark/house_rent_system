import React from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '../../types';

export const NearbyList: React.FC<{ properties: Property[], userLocation?: { lat: number, lon: number } | null }> = ({ properties, userLocation }) => {
    // Recommendation Logic:
    // 1. Filter out invalid properties if any
    // 2. Sort:
    //    - If userLocation is enabled: Sort by Distance (Ascending)
    //    - Default: Sort by Views (Descending)
    // 3. Limit to 5 items

    const sorted = [...properties].sort((a, b) => {
        if (userLocation) {
            // Sort by distance (nearest first)
            const distA = a.distance || 99999;
            const distB = b.distance || 99999;
            return distA - distB;
        } else {
            // Sort by views (highest first)
            const viewsA = a.stats?.views || 0;
            const viewsB = b.stats?.views || 0;
            return viewsB - viewsA;
        }
    });

    const top = sorted.slice(0, 5);

    return (
        <div className="nearby-list" aria-live="polite">
            {top.map(p => {
                const dist = p.distance !== undefined ? (p.distance < 1 ? (p.distance * 1000).toFixed(0) + ' m' : p.distance.toFixed(2) + ' km') : '';
                return (
                    <Link key={p.id} to={`/property/${p.id}`} className="mini" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '6px', background: p.distance && p.distance <= 1.2 ? 'var(--accent)' : '#bfc9d9', marginRight: '10px' }}></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>{p.title}</div>
                            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{dist ? `${dist} · ` : ''}RM {p.price}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-2)' }}>RM {p.price}</div>
                    </Link>
                );
            })}
        </div>
    );
};
