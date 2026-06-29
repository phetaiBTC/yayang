import { api } from './client';

export interface ReservationLineInput {
  bookId: number;
  qty: number;
}

export type ReservationStatus = 'booked' | 'ready' | 'completed' | 'cancelled';

export async function listReservations(): Promise<any[]> {
  return (await api.get('/reservations')).data.data;
}

export async function getReservation(id: number): Promise<any> {
  return (await api.get(`/reservations/${id}`)).data.data;
}

export async function createReservation(cusId: number, lines: ReservationLineInput[]): Promise<any> {
  return (await api.post('/reservations', { cusId, lines })).data.data;
}

export async function setDeposit(id: number, deposit: number): Promise<any> {
  return (await api.post(`/reservations/${id}/deposit`, { deposit })).data.data;
}

export async function setStatus(id: number, status: Exclude<ReservationStatus, 'booked'>): Promise<any> {
  return (await api.patch(`/reservations/${id}/status`, { status })).data.data;
}
