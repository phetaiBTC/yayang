import { api } from './client';

export interface CrudApi<T = any> {
  list(): Promise<T[]>;
  create(payload: Record<string, any>): Promise<T>;
  update(id: number, payload: Record<string, any>): Promise<T>;
  remove(id: number): Promise<void>;
}

/** Build a typed CRUD client for a `/api/<resource>` endpoint. */
export function createCrudApi<T = any>(resource: string): CrudApi<T> {
  return {
    async list() {
      return (await api.get(`/${resource}`)).data.data;
    },
    async create(payload) {
      return (await api.post(`/${resource}`, payload)).data.data;
    },
    async update(id, payload) {
      return (await api.patch(`/${resource}/${id}`, payload)).data.data;
    },
    async remove(id) {
      await api.delete(`/${resource}/${id}`);
    },
  };
}

export const employeesApi = createCrudApi('employees');
export const categoriesApi = createCrudApi('categories');
export const bookTypesApi = createCrudApi('book-types');
export const booksApi = createCrudApi('books');
export const customersApi = createCrudApi('customers');
export const suppliersApi = createCrudApi('suppliers');
