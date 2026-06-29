import { api } from './client';

export interface PoLineInput {
  bookId: number;
  qty: number;
  costPrice: number;
}

export async function listPurchaseOrders(): Promise<any[]> {
  return (await api.get('/purchase-orders')).data.data;
}

export async function getPurchaseOrder(id: number): Promise<any> {
  return (await api.get(`/purchase-orders/${id}`)).data.data;
}

export async function createPurchaseOrder(supId: number, lines: PoLineInput[]): Promise<any> {
  return (await api.post('/purchase-orders', { supId, lines })).data.data;
}
