
// --- Property & Real Estate Types ---

export interface Property {
    id: string | number;
    title?: string;         // Used in Analytics
    address: string;
    city?: string;          // Used in Listings
    area?: string;          // Used in Analytics (e.g., "Kajang")
    
    // Financials
    price: number;          // "rent" in listings, "price" in analytics
    
    // Specs
    type: string;           // "category" in analytics, "type" in listings
    size_sqm?: number;
    beds: number;
    bathrooms: number;
    
    // Status & Meta
    status: 'active' | 'Occupied' | 'Vacant' | 'Maintenance' | string;
    furnished?: 'full' | 'half' | 'none';
    amenities?: string[];
    image?: string;         // URL for listing card
    
    // Metrics (Analytics specific)
    views_count?: number;
    applications_count?: number;
    latitude?: number;
    longitude?: number;
}

// --- Tenant Types ---

export interface Tenant {
    id: number | string;
    name: string;
    email: string;
    propertyId: number | string | null;
    leaseEnd: string;
    status: 'Good Standing' | 'Late Payment' | 'Past Tenant' | string;
}

export interface AdminUser {
    id: string;
    role: string;
    full_name: string;
    email?: string; // Supabase auth email might need to be fetched separately or if stored in users table
    phone: string | null;
    is_verified: boolean;
    student_id?: string | null;
    agency_name?: string | null;
    agency_license?: string | null;
    landlord_licenceid?: string | null;
    applications?: {
        status: string;
        stage: string;
        contract_status: string;
        updated_at: string;
        properties: {
            title: string;
        } | null;
    }[];
}

// --- Maintenance Types ---

export interface MaintenanceRequest {
    id: string;
    property: string; // Address or Name
    issue: string;
    priority: 'Low' | 'Medium' | 'High' | 'Emergency';
    status: 'Open' | 'In Progress' | 'Pending' | 'Resolved';
    date: string;
}

// --- Dashboard & Chart Types ---

export interface DashboardStat {
    title: string;
    value: string | number;
    trend: string;
    trendUp: boolean;
}

export interface RevenueData {
    period: 'year' | 'month' | 'week';
    labels: string[];
    values: number[];
}

export interface ActivityLog {
    id: number;
    text: string;
    sub: string;
    time: string;
    type: 'payment' | 'alert' | 'success' | 'info';
}
