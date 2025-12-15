import type { Property } from '../types';

const MOCK_PROPERTIES: Property[] = [
    {
        id: 1, title: "Studio near UKM - 5 min", lat: 2.9245, lon: 101.7750, price: 450, beds: 1, area: "Bangi", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60", rating: 4.6,
        deposit: 450, desc: "Cozy studio suitable for UKM students. Close to campus and public transport. Shared kitchen. No pets allowed.",
        features: ["Wi-Fi", "Furnished", "Washing machine", "Study desk", "Hot water"],
        rules: ["Quiet hours after 11 PM", "No smoking", "Keep common areas clean", "Guests allowed with notice"],
        images: [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=60",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=60",
            "https://images.unsplash.com/photo-1600585153762-2a4f0f7e5931?auto=format&fit=crop&w=1200&q=60"
        ],
        host: { type: "Agent", name: "BlueHome Agency", contact: "bluehome@example.com", since: "2024" },
        stats: { views: 124, applications: 3 },
        address: "Jalan Reko, Bangi", bathroom: 1, kitchen: true, propertySize: 450, propertyType: "Studio", furnished: "full", availableFrom: "2024-01-01", amenities: ["Wi-Fi", "Washing machine", "Hot water"]
    },
    { id: 2, title: "Cozy 1BR, close to bus stop", lat: 2.9305, lon: 101.7802, price: 600, beds: 1, area: "Taman UKM", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60", rating: 4.4, address: "Taman UKM, Bangi", bathroom: 1, kitchen: true, propertySize: 600, propertyType: "Apartment", furnished: "half", availableFrom: "2024-02-01", amenities: ["Parking", "AirCon"] },
    { id: 3, title: "Shared room (female-friendly)", lat: 2.9408, lon: 101.7722, price: 350, beds: 1, area: "Bangi Baru", img: "https://images.unsplash.com/photo-1598928506311-87e0ffb13243?auto=format&fit=crop&w=800&q=60", rating: 4.1, address: "Bangi Baru, Seksyen 3", bathroom: 2, kitchen: true, propertySize: 1200, propertyType: "Terrace", furnished: "full", availableFrom: "2024-01-15", amenities: ["Wi-Fi", "Security"] },
    { id: 4, title: "2BR apartment — quiet neighbourhood", lat: 2.9198, lon: 101.7729, price: 1200, beds: 2, area: "Seksyen 3", img: "https://images.unsplash.com/photo-1600585153762-2a4f0f7e5931?auto=format&fit=crop&w=800&q=60", rating: 4.8, address: "Seksyen 3, Bangi", bathroom: 2, kitchen: true, propertySize: 900, propertyType: "Apartment", furnished: "half", availableFrom: "2024-03-01", amenities: ["Pool", "Gym", "Parking"] },
    { id: 5, title: "Budget room with study desk", lat: 2.9271, lon: 101.7805, price: 400, beds: 1, area: "Near UKM Gate", img: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=60", rating: 4.0, address: "Near UKM Gate 1", bathroom: 1, kitchen: false, propertySize: 150, propertyType: "Room", furnished: "full", availableFrom: "2024-01-01", amenities: ["Wi-Fi"] },
    { id: 6, title: "Luxury condo 10min drive", lat: 2.9550, lon: 101.7850, price: 2200, beds: 3, area: "Kajang", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60", rating: 4.9, address: "Jalan Reko, Kajang", bathroom: 2, kitchen: true, propertySize: 1500, propertyType: "Condo", furnished: "full", availableFrom: "2024-05-01", amenities: ["Pool", "Gym", "Security"] },
    // VistaLand Test Property
    {
        id: 99,
        title: "VistaLand",
        address: "123 Vista Way, Vista City, 43600",
        area: "Vista Area",
        price: 2500,
        beds: 4,
        bathroom: 3,
        kitchen: true,
        propertySize: 2500,
        propertyType: "Bungalow",
        furnished: "full",
        availableFrom: "2025-01-01",
        amenities: ["Wi-Fi", "Pool", "Gym", "Parking", "Security", "AirCon", "Washing machine", "Hot water"],
        img: "/broken-image-test.jpg", // Broken link as requested
        rating: 5.0,
        deposit: 5000,
        desc: "A magnificent property with all amenities included. Perfect for testing.",
        features: ["Wi-Fi", "Pool", "Gym", "Parking", "Security", "AirCon"],
        rules: ["No smoking", "No pets"],
        host: { type: "Landlord", name: "Vista Owner", contact: "vista@example.com", since: "2025" },
        stats: { views: 0, applications: 0 }
    }
];

export const PropertyService = {
    getAll: async (): Promise<Property[]> => {
        // Simulate API delay
        return new Promise(resolve => setTimeout(() => resolve([...MOCK_PROPERTIES]), 400));
    },

    getById: async (id: number): Promise<Property | undefined> => {
        return new Promise(resolve => setTimeout(() => {
            const p = MOCK_PROPERTIES.find(p => p.id === id);
            // If getting by ID, populate defaults if missing (for the other mock items)
            if (p && !p.images) {
                resolve({
                    ...p,
                    images: [p.img],
                    features: p.features || ["Wi-Fi", "Furnished"],
                    rules: p.rules || ["Standard rules apply"],
                    host: p.host || { type: "Landlord", name: "Landlord " + p.id, contact: "user" + p.id + "@example.com", since: "2023" },
                    stats: p.stats || { views: 50, applications: 1 },
                    deposit: p.deposit || p.price
                });
            } else {
                resolve(p);
            }
        }, 300));
    }
};
