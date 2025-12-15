import { useState, useEffect } from 'react';
import type { Property } from '../types';
import { PropertyService } from '../services/property.service';

export const useProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProps = async () => {
            try {
                setLoading(true);
                const data = await PropertyService.getAll();
                setProperties(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch properties');
            } finally {
                setLoading(false);
            }
        };
        fetchProps();
    }, []);

    return { properties, loading, error };
};

export const useProperty = (id: number) => {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchProp = async () => {
            try {
                setLoading(true);
                const data = await PropertyService.getById(id);
                setProperty(data || null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch property');
            } finally {
                setLoading(false);
            }
        };
        fetchProp();
    }, [id]);

    return { property, loading, error };
};
