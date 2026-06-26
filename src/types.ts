export type ServiceCategory = 'plumber' | 'electrician' | 'painter' | 'cleaner';

export type MoroccoCity = 'Casablanca' | 'Rabat';

export interface Review {
  id: string;
  authorName: string;
  authorCity: string;
  rating: number;
  text: string;
  date: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: ServiceCategory;
  city: MoroccoCity;
  rate: number; // in MAD (Moroccan Dirham)
  rateUnit: 'hour' | 'job';
  phone: string;
  experienceYears: number;
  bio: string;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  isVerified: boolean;
  completedJobs: number;
  skills: string[];
  isWorkProgramParticipant?: boolean;
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerCategory: ServiceCategory;
  providerCity: MoroccoCity;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  bookingDate: string;
  bookingTime: string;
  jobDescription: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPriceEstimate: number;
  createdAt: string;
  hasReviewed?: boolean;
  clientId?: string;
}

export interface ProviderApplication {
  id: string;
  name: string;
  category: ServiceCategory;
  city: MoroccoCity;
  rate: number;
  rateUnit: 'hour' | 'job';
  phone: string;
  experienceYears: number;
  bio: string;
  skills: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}
