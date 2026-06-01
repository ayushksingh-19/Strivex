import type { AdminBooking, AdminOverview, Booking, Lead, Program, Session, User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T & { message?: string }) : ({} as T);

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'message' in data && data.message
        ? String(data.message)
        : 'Request failed.';
    throw new Error(message);
  }

  return data;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  return parseResponse<T>(response);
}

export const api = {
  health: () => apiRequest<{ ok: boolean; app: string }>('/api/health'),
  programs: () => apiRequest<Program[]>('/api/programs'),
  sessions: () => apiRequest<Session[]>('/api/sessions'),
  submitLead: (payload: { name: string; email: string; phone: string; goal: string; message: string }) =>
    apiRequest<{ id: number; message: string }>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: { name: string; email: string; password: string; goal: string }) =>
    apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: (token: string) => apiRequest<User>('/api/auth/me', { token }),
  myBookings: (token: string) => apiRequest<Booking[]>('/api/bookings/me', { token }),
  bookSession: (token: string, payload: { sessionId: number; notes: string }) =>
    apiRequest<{ id: number; message: string }>('/api/bookings', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  cancelBooking: (token: string, bookingId: number) =>
    apiRequest<{ message: string }>(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
      token,
    }),
  adminOverview: (token: string) => apiRequest<AdminOverview>('/api/admin/overview', { token }),
  adminLeads: (token: string) => apiRequest<Lead[]>('/api/admin/leads', { token }),
  adminUsers: (token: string) => apiRequest<User[]>('/api/admin/users', { token }),
  adminBookings: (token: string) => apiRequest<AdminBooking[]>('/api/admin/bookings', { token }),
  createSession: (
    token: string,
    payload: {
      programId: number;
      title: string;
      coach: string;
      sessionDate: string;
      startTime: string;
      durationMins: number;
      location: string;
      capacity: number;
    }
  ) =>
    apiRequest<{ id: number; message: string }>('/api/admin/sessions', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
};
