import React from 'react';
import type { Property } from '../../types';

export const NearbyList: React.FC<{ properties: Property[] }> = ({ properties }) => {
    const top = properties.slice(0, 4);

    return (
        <div className="nearby-list" aria-live="polite">
            {top.map(p => {
                const dist = p.distance !== undefined ? (p.distance < 1 ? (p.distance * 1000).toFixed(0) + ' m' : p.distance.toFixed(2) + ' km') : '';
                return (
                    <div key={p.id} className="mini">
                        <div style={{ width: '12px', height: '12px', borderRadius: '6px', background: p.distance && p.distance <= 1.2 ? 'var(--accent)' : '#bfc9d9' }}></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>{p.title}</div>
                            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{dist ? `${dist} · ` : ''}RM {p.price}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-2)' }}>RM {p.price}</div>
                    </div>
                );
            })}
        </div>
    );
};
