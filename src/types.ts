export type Role = 'member' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  goal: string | null;
  createdAt: string;
}

export interface Program {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  intensity: string;
  duration: string;
  price: string;
  coaches: string;
}

export interface Session {
  id: number;
  program_id: number;
  program_name: string;
  program_slug: string;
  program_tagline: string;
  title: string;
  coach: string;
  day_label: string;
  session_date: string;
  start_time: string;
  duration_mins: number;
  location: string;
  capacity: number;
  spots_remaining: number;
}

export interface Booking {
  id: number;
  status: string;
  notes: string | null;
  created_at: string;
  title: string;
  coach: string;
  day_label: string;
  session_date: string;
  start_time: string;
  location: string;
  program_name: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  goal: string;
  message: string | null;
  status: string;
  created_at: string;
}

export interface AdminOverview {
  metrics: {
    members: number;
    leads: number;
    bookings: number;
    sessions: number;
  };
  recentLeads: Array<Pick<Lead, 'id' | 'name' | 'email' | 'goal' | 'status' | 'created_at'>>;
  recentBookings: Array<{
    id: number;
    member_name: string;
    program_name: string;
    title: string;
    start_time: string;
    day_label: string;
  }>;
}

export interface AdminBooking {
  id: number;
  status: string;
  notes: string | null;
  created_at: string;
  member_name: string;
  member_email: string;
  program_name: string;
  title: string;
  day_label: string;
  start_time: string;
  location: string;
}
