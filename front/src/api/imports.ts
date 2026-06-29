import { api } from './client';

export interface ImportLineInput {
  bookId: number;
  qty: number;
}

export async function listImports(): Promise<any[]> {
  return (await api.get('/imports')).data.data;
}

export async function getImport(id: number): Promise<any> {
  return (await api.get(`/imports/${id}`)).data.data;
}

export async function createImport(poId: number, lines: ImportLineInput[]): Promise<any> {
  return (await api.post('/imports', { poId, lines })).data.data;
}
