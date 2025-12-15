import React from 'react';
import { useLocation } from '../../hooks/useLocation';

export const SearchPanel: React.FC = () => {
    const { address, loading, requestLocation } = useLocation();

    return (
        <div className="search-panel in-view" role="search" aria-label="Search rentals">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input id="q" type="text" placeholder="Search by area, landmark, or keyword" aria-label="Search" />
                <select id="filter" aria-label="Price filter">
                    <option value="all">All prices</option>
                    <option value="low">Under RM 500</option>
                    <option value="mid">RM 500 - RM 1000</option>
                    <option value="high">Over RM 1000</option>
                </select>
                <button
                    onClick={requestLocation}
                    className="btn btn-ghost"
                    title="Use my location"
                    disabled={loading}
                >
                    {loading ? 'Locating...' : 'Use my location'}
                </button>
            </div>

            {(address) && (
                <div className="location-bar" style={{ display: 'flex' }}>
                    <div className="loc-chip">📍 Nearby</div>
                    <div className="addr">{address}</div>
                    <button className="btn btn-ghost" title="Refresh address" style={{ marginLeft: 'auto' }}>
                        Refresh
                    </button>
                </div>
            )}

            <div className="small-hint">System will prioritize nearby listings if you allow location access.</div>
        </div>
    );
};
