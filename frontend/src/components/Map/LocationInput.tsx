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
 * 位置输入组件（带地理编码）
 * 
 * Features:
 * - Manual lat/lon input fields 手动经纬度输入
 * - 📍 Find Location button: uses entered coords OR geocodes address
 *   查找位置按钮：优先使用输入的坐标，否则根据地址查找
 * - Live map preview 实时地图预览
 * - Fallback to default UKM location 默认UKM位置
 */
export const LocationInput: React.FC<LocationInputProps> = ({
    latitude,
    longitude,
    onLocationChange,
    address
}) => {
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeError, setGeocodeError] = useState<string | null>(null);

    /**
     * 查找位置处理函数
     * Find Location handler
     * 
     * 优先级：
     * 1. 如果已输入有效坐标，直接使用这些坐标
     * 2. 否则，根据地址进行地理编码
     * 3. 如果都失败，使用默认坐标
     */
    const handleFindLocation = async () => {
        setGeocodeError(null);

        // 1. 如果已输入有效坐标（非0），直接使用
        // If valid coordinates are entered (non-zero), use them directly
        if (latitude && longitude && latitude !== 0 && longitude !== 0) {
            // 坐标已经设置，只需要触发地图更新
            // Coordinates already set, just trigger map update
            onLocationChange(latitude, longitude);
            return;
        }

        // 2. 如果没有坐标但有地址，尝试地理编码
        // If no coordinates but has address, try geocoding
        if (!address || address.trim().length === 0) {
            setGeocodeError('Please enter coordinates or an address first');
            return;
        }

        setGeocoding(true);

        try {
            const result: GeocodeResult | null = await geocodeAddress(address);

            if (result) {
                onLocationChange(result.lat, result.lon);
            } else {
                setGeocodeError('Location not found. Using default UKM location.');
                onLocationChange(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
            setGeocodeError('Geocoding failed. Please enter coordinates manually.');
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
                        onClick={handleFindLocation}
                        disabled={geocoding}
                        className="btn btn-primary"
                        style={{
                            padding: '8px 16px',
                            opacity: geocoding ? 0.5 : 1,
                            cursor: geocoding ? 'not-allowed' : 'pointer',
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
