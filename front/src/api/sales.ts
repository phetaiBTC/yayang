import { api } from './client';

export interface SaleLineInput {
  bookId: number;
  qty: number;
}

export type PaymentMethod = 'cash' | 'transfer' | 'qr';

export async function listSales(): Promise<any[]> {
  return (await api.get('/sales')).data.data;
}

export async function getSale(id: number): Promise<any> {
  return (await api.get(`/sales/${id}`)).data.data;
}

export async function createSale(
  cusId: number,
  paymentMethod: PaymentMethod,
  lines: SaleLineInput[],
): Promise<any> {
  return (await api.post('/sales', { cusId, paymentMethod, lines })).data.data;
}
