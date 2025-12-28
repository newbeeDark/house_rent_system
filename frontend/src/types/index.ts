export type Role = 'guest' | 'student' | 'landlord' | 'agent' | 'admin' | 'host';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  terms_accepted_at?: string | null;
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
  id: string;
  ownerId?: string;
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
  id: string;
  propertyId: string;
  propertyTitle: string;
  applicant: string;
  studentId: string;
  submitted: string;
  status: 'pending' | 'accepted' | 'rejected' | 'awaiting_payment' | 'completed' | 'cancelled';
  message?: string;
  files: { name: string; type: string; url: string }[];
  appointmentTime?: string | null;
  feedback?: string | null;
  applicantId: string;
  propertyOwnerId: string;
  stage: 'application' | 'processing' | 'completed';
  contract_url?: string | null;
  contract_status: 'pending' | 'uploaded' | 'signed_by_tenant' | 'signed_by_landlord' | 'completed';
  contract_signed_landlord?: boolean;
  contract_signed_tenant?: boolean;
  payment_status: 'unpaid' | 'paid';
}

export interface Payment {
  id: string;
  application_id: string;
  payer_id: string;
  amount: number;
  currency: string;
  created_at: string;
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
