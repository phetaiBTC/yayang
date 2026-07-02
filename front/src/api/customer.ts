import { api } from './client';

export interface CatalogBook {
  bookId: number;
  title: string;
  price: string;
  stock: number;
  image?: string | null;
  category?: { catName: string } | null;
  bookType?: { typeName: string } | null;
}

export interface MyReservation {
  resId: number;
  resDate: string;
  status: string;
  deposit: string;
  total: string;
  balance: string;
  lineCount?: number;
}

export interface ReserveLine {
  bookId: number;
  qty: number;
}

export type PaymentMethod = 'cash' | 'transfer' | 'qr';

export interface MyPurchase {
  saleId: number;
  saleDate: string;
  total: string;
  paymentMethod: string;
  lineCount?: number;
}

export async function getCatalog(): Promise<CatalogBook[]> {
  return (await api.get('/customer/books')).data.data;
}

export async function getMyReservations(): Promise<MyReservation[]> {
  return (await api.get('/customer/reservations')).data.data;
}

export async function createMyReservation(
  lines: ReserveLine[],
  deposit: number,
): Promise<MyReservation> {
  return (await api.post('/customer/reservations', { lines, deposit })).data.data;
}

export async function getMyPurchases(): Promise<MyPurchase[]> {
  return (await api.get('/customer/sales')).data.data;
}

export interface ReceiptLine {
  qty: number;
  price: string;
  book?: { title: string } | null;
}
export interface SaleReceipt {
  saleId: number;
  saleDate: string;
  total: string;
  paymentMethod: string;
  customer?: { name: string } | null;
  details: ReceiptLine[];
}

export async function getReceipt(saleId: number): Promise<SaleReceipt> {
  return (await api.get(`/customer/sales/${saleId}`)).data.data;
}

export async function createMyPurchase(
  paymentMethod: PaymentMethod,
  lines: ReserveLine[],
): Promise<MyPurchase> {
  return (await api.post('/customer/sales', { paymentMethod, lines })).data.data;
}
