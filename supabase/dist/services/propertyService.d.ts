import { z } from 'zod';
declare const propertySchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    area: z.ZodNumber;
    rooms: z.ZodNumber;
    bedrooms: z.ZodNumber;
    bathrooms: z.ZodNumber;
    address: z.ZodString;
    city: z.ZodString;
    district: z.ZodString;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    facilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
    images: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
declare const updatePropertySchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    area: z.ZodOptional<z.ZodNumber>;
    rooms: z.ZodOptional<z.ZodNumber>;
    bedrooms: z.ZodOptional<z.ZodNumber>;
    bathrooms: z.ZodOptional<z.ZodNumber>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    longitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    facilities: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    images: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const searchSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    city: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    price_min: z.ZodOptional<z.ZodNumber>;
    price_max: z.ZodOptional<z.ZodNumber>;
    area_min: z.ZodOptional<z.ZodNumber>;
    area_max: z.ZodOptional<z.ZodNumber>;
    rooms: z.ZodOptional<z.ZodNumber>;
    bedrooms: z.ZodOptional<z.ZodNumber>;
    bathrooms: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare class PropertyService {
    searchProperties(filters: z.infer<typeof searchSchema>): Promise<{
        properties: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getPropertyById(id: string): Promise<any>;
    createProperty(landlordId: string, data: z.infer<typeof propertySchema>): Promise<any>;
    updateProperty(propertyId: string, landlordId: string, updates: z.infer<typeof updatePropertySchema>): Promise<any>;
    deleteProperty(propertyId: string, landlordId: string): Promise<{
        message: string;
    }>;
    getUserProperties(landlordId: string): Promise<any[]>;
    toggleFavorite(userId: string, propertyId: string): Promise<{
        favorited: boolean;
    }>;
    getUserFavorites(userId: string): Promise<any[][]>;
}
export declare const propertyService: PropertyService;
export {};
//# sourceMappingURL=propertyService.d.ts.map