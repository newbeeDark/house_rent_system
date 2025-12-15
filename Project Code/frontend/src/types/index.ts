export type Role = 'guest' | 'student' | 'landlord' | 'agent' | 'admin' | 'host';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface HostInfo {
  type: string;
  name: string;
  contact: string;
  since: string;
}

export interface PropertyStats {
  views: number;
  applications: number;
}

export interface Property {
  id: number;
  title: string;
  area: string;
  address?: string;
  price: number;
  beds: number;
  bathroom?: number;
  kitchen?: boolean;
  propertySize?: number;
  propertyType?: string;
  furnished?: 'half' | 'full' | 'none';
  availableFrom?: string;
  amenities?: string[];
  rating?: number;
  img: string;
  images?: string[];
  lat?: number;
  lon?: number;
  distance?: number;
  deposit?: number;
  desc?: string;
  features?: string[];
  rules?: string[];
  host?: HostInfo;
  stats?: PropertyStats;
}

export interface LocationState {
  lat: number;
  lon: number;
}

export interface Application {
  id: number;
  propertyId: number;
  propertyTitle: string;
  applicant: string;
  studentId: string;
  submitted: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  files: { name: string; type: string; url: string }[];
}

export interface ListingDraft {
  title: string;
  price: number;
  beds: number;
  bathroom?: number;
  area: string;
  address: string;
  description: string;
  photos: string[];
  kitchen?: boolean;
  propertySize?: number;
  propertyType?: string;
  furnished?: 'half' | 'full' | 'none';
  availableFrom?: string;
  amenities?: string[];
}
