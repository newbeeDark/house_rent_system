/**
 * Geocoding Utility
 * 
 * Uses Nominatim (OpenStreetMap's free geocoding service) to convert
 * addresses to latitude/longitude coordinates
 * 
 * API: https://nominatim.openstreetmap.org/
 * Rate Limit: Max 1 request per second (enforced by delay)
 * 
 * Usage:
 * ```typescript
 * const coords = await geocodeAddress('Universiti Kebangsaan Malaysia, Bangi');
 * // Returns: { lat: 2.9213, lon: 101.7781, displayName: '...' }
 * ```
 */

export interface GeocodeResult {
    lat: number;
    lon: number;
    displayName: string;
}

// Default coordinates for Bangi Gateway (fallback)
export const DEFAULT_COORDS = {
    lat: 2.9332,
    lon: 101.7648,
    displayName: 'Bangi Gateway, Bangi'
};

/**
 * Geocode an address to coordinates
 * 
 * @param address - Full address string to geocode
 * @returns Promise with lat/lon coordinates or null if failed
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!address || address.trim().length === 0) {
        return null;
    }

    try {
        // Add delay to respect rate limiting (1 request per second)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'UKM-House-Rent-System/1.0' // Required by Nominatim
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const result = data[0];
            return {
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                displayName: result.display_name
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Reverse geocode coordinates to address
 * 
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise with address string or null if failed
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `format=json&lat=${lat}&lon=${lon}`,
            {
                headers: {
                    'User-Agent': 'UKM-House-Rent-System/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Reverse geocoding failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.display_name || null;

    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}
