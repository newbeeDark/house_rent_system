import { useState } from 'react';
import type { LocationState } from '../types';

export const useLocation = () => {
    const [location, setLocation] = useState<LocationState | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestLocation = async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const newLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setLocation(newLoc);

            try {
                const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${newLoc.lat}&lon=${newLoc.lon}&format=jsonv2`);
                if (resp.ok) {
                    const data = await resp.json();
                    setAddress(data.display_name || 'Address detected');
                } else {
                    setAddress('Unknown location');
                }
            } catch (e) {
                console.warn('Reverse geocode failed', e);
                setAddress('Nearby (Address unavailable)');
            }

        } catch (err: any) {
            setError(err.message || 'Failed to retrieve location');
        } finally {
            setLoading(false);
        }
    };

    return { location, address, loading, error, requestLocation };
};
