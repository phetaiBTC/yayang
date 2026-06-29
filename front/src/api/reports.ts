import { api } from './client';

function rangeParams(from?: string, to?: string) {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;
  return { params };
}

export type ListReport = { rows: any[]; summary: Record<string, any> };

export async function reportRegistration(from?: string, to?: string): Promise<ListReport> {
  return (await api.get('/reports/registration', rangeParams(from, to))).data.data;
}
export async function reportPurchaseOrders(from?: string, to?: string): Promise<ListReport> {
  return (await api.get('/reports/purchase-orders', rangeParams(from, to))).data.data;
}
export async function reportImports(from?: string, to?: string): Promise<ListReport> {
  return (await api.get('/reports/imports', rangeParams(from, to))).data.data;
}
export async function reportSales(from?: string, to?: string): Promise<ListReport> {
  return (await api.get('/reports/sales', rangeParams(from, to))).data.data;
}
export async function reportReservations(from?: string, to?: string): Promise<ListReport> {
  return (await api.get('/reports/reservations', rangeParams(from, to))).data.data;
}
export async function reportBestSellers(from?: string, to?: string): Promise<any[]> {
  return (await api.get('/reports/best-sellers', rangeParams(from, to))).data.data;
}
