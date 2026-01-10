import React, { useState } from 'react';
import { geocodeAddress, DEFAULT_COORDS, type GeocodeResult } from '../../utils/geocoding';
import { OSMMap } from '../Map/OSMMap';

export interface LocationInputProps {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lon: number) => void;
    address?: string;
}

/**
 * Location Input Component with Geocoding
 * 
 * Features:
 * - Manual lat/lon input fields
 * - 📍 Geocode button to convert address to coordinates
 * - Live map preview
 * - Fallback to default UKM location
 * 
 * Usage:
 * ```tsx
 * <LocationInput
 *   latitude={form.lat}
 *   longitude={form.lon}
 *   address={form.address}
 *   onLocationChange={(lat, lon) => setForm({ ...form, lat, lon })}
 * />
 * ```
 */
export const LocationInput: React.FC<LocationInputProps> = ({
    latitude,
    longitude,
    onLocationChange,
    address
}) => {
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeError, setGeocodeError] = useState<string | null>(null);

    const handleGeocode = async () => {
        if (!address || address.trim().length === 0) {
            setGeocodeError('Please enter an address first');
            return;
        }

        setGeocoding(true);
        setGeocodeError(null);

        try {
            const result: GeocodeResult | null = await geocodeAddress(address);

            if (result) {
                onLocationChange(result.lat, result.lon);
                alert(`Location found: ${result.displayName}`);
            } else {
                setGeocodeError('Location not found. Using default UKM location.');
                onLocationChange(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
            setGeocodeError('Geocoding failed. Please try again or enter coordinates manually.');
        } finally {
            setGeocoding(false);
        }
    };

    const displayLat = latitude || DEFAULT_COORDS.lat;
    const displayLon = longitude || DEFAULT_COORDS.lon;

    return (
        <div style={{ marginBottom: 20 }}>
            <label className="block mb-2 text-sm text-gray-600 font-semibold">
                📍 Property Location (Coordinates)
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 12 }}>
                <div>
                    <label className="block text-xs mb-1 text-gray-500">Latitude</label>
                    <input
                        type="number"
                        step="0.000001"
                        className="input-field w-full p-2 border rounded-lg"
                        placeholder="e.g. 2.9213"
                        value={latitude || ''}
                        onChange={e => onLocationChange(parseFloat(e.target.value) || 0, longitude)}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1 text-gray-500">Longitude</label>
                    <input
                        type="number"
                        step="0.000001"
                        className="input-field w-full p-2 border rounded-lg"
                        placeholder="e.g. 101.7781"
                        value={longitude || ''}
                        onChange={e => onLocationChange(latitude, parseFloat(e.target.value) || 0)}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1 text-gray-500" style={{ visibility: 'hidden' }}>Action</label>
                    <button
                        type="button"
                        onClick={handleGeocode}
                        disabled={geocoding || !address}
                        className="btn btn-primary"
                        style={{
                            padding: '8px 16px',
                            opacity: geocoding || !address ? 0.5 : 1,
                            cursor: geocoding || !address ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {geocoding ? '🔍 Searching...' : '🔍 Find Location'}
                    </button>
                </div>
            </div>

            {geocodeError && (
                <div style={{
                    padding: '8px 12px',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#856404',
                    marginBottom: '12px'
                }}>
                    ⚠️ {geocodeError}
                </div>
            )}

            {/* Map Preview */}
            <div style={{ marginTop: 12 }}>
                <div className="text-xs text-gray-500 mb-2">Map Preview:</div>
                <OSMMap
                    lat={displayLat}
                    lon={displayLon}
                    zoom={15}
                    height="200px"
                    marker={true}
                    popupText="Property Location"
                />
                <div style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: '#888',
                    textAlign: 'center'
                }}>
                    {latitude && longitude
                        ? `Showing coordinates: ${displayLat.toFixed(6)}, ${displayLon.toFixed(6)}`
                        : 'Using default location (UKM). Enter address and click "Find Location" to geocode.'}
                </div>
            </div>
        </div>
    );
};
