import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface OSMMapProps {
    lat: number;
    lon: number;
    zoom?: number;
    height?: string;
    marker?: boolean;
    popupText?: string;
    className?: string;
}

/**
 * Reusable OpenStreetMap Component
 * 
 * Features:
 * - OpenStreetMap tiles via Leaflet
 * - Optional marker with popup
 * - Customizable height and zoom
 * - Responsive design
 * 
 * Usage:
 * ```tsx
 * <OSMMap 
 *   lat={2.9213} 
 *   lon={101.7781}
 *   zoom={15}
 *   marker={true}
 *   popupText="Property Location"
 *   height="400px"
 * />
 * ```
 */
export const OSMMap: React.FC<OSMMapProps> = ({
    lat,
    lon,
    zoom = 15,
    height = '300px',
    marker = true,
    popupText,
    className = ''
}) => {
    const position: [number, number] = [lat, lon];

    return (
        <div className={className} style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer
                center={position}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {marker && (
                    <Marker position={position}>
                        {popupText && <Popup>{popupText}</Popup>}
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};
