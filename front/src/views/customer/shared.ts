// Shared constants/helpers for the customer storefront pages.

export const SHOP_NAME = 'ຮ້ານຂາຍປຶ້ມ';

export const STATUS_LABELS: Record<string, string> = {
  booked: 'ຈອງແລ້ວ',
  ready: 'ພ້ອມຮັບ',
  completed: 'ສຳເລັດ',
  cancelled: 'ຍົກເລີກ',
};
export const PAYMENT_LABELS: Record<string, string> = { cash: 'ເງິນສົດ', transfer: 'ໂອນ', qr: 'QR' };

export const statusLabel = (s: string) => STATUS_LABELS[s] ?? s;
export const paymentLabel = (p: string) => PAYMENT_LABELS[p] ?? p;

export function statusSeverity(s: string): string {
  return s === 'completed' ? 'success' : s === 'ready' ? 'info' : s === 'cancelled' ? 'danger' : 'warn';
}

export function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'ເກີດຂໍ້ຜິດພາດ';
  return Array.isArray(m) ? m.join(', ') : String(m);
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleString();
