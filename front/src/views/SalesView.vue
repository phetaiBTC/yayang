<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Tag from 'primevue/tag';
import { listSales, createSale, type PaymentMethod, type SaleLineInput } from '../api/sales';
import { booksApi, customersApi } from '../api/resources';

const toast = useToast();

const sales = ref<any[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const saving = ref(false);
const customers = ref<any[]>([]);
const books = ref<any[]>([]);
const cusId = ref<number | null>(null);
const paymentMethod = ref<PaymentMethod>('cash');
const lines = ref<SaleLineInput[]>([]);

const paymentOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'QR', value: 'qr' },
];

const customerOptions = computed(() =>
  customers.value.map((c) => ({ label: `${c.name}${c.phone ? ' — ' + c.phone : ''}`, value: c.cusId })),
);
const bookOptions = computed(() =>
  books.value.map((b) => ({ label: `${b.title} (stock ${b.stock})`, value: b.bookId })),
);

function bookOf(bookId: number) {
  return books.value.find((b) => b.bookId === bookId);
}
function lineMax(bookId: number): number {
  return bookOf(bookId)?.stock ?? 1;
}
function lineSubtotal(line: SaleLineInput): number {
  const b = bookOf(line.bookId);
  return b ? (line.qty || 0) * Number(b.price) : 0;
}
const orderTotal = computed(() => lines.value.reduce((sum, l) => sum + lineSubtotal(l), 0));

const canSave = computed(
  () =>
    cusId.value != null &&
    !!paymentMethod.value &&
    lines.value.length > 0 &&
    lines.value.every((l) => {
      const b = bookOf(l.bookId);
      return b && l.qty >= 1 && l.qty <= b.stock;
    }),
);

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'Unexpected error';
  return Array.isArray(m) ? m.join(', ') : String(m);
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}
function paymentSeverity(p: string): string {
  return p === 'cash' ? 'success' : p === 'qr' ? 'info' : 'warn';
}

async function load() {
  loading.value = true;
  try {
    sales.value = await listSales();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Load failed', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}

async function openNew() {
  cusId.value = null;
  paymentMethod.value = 'cash';
  lines.value = [{ bookId: 0, qty: 1 }];
  dialogVisible.value = true;
  [customers.value, books.value] = await Promise.all([customersApi.list(), booksApi.list()]);
}

function addLine() {
  lines.value.push({ bookId: 0, qty: 1 });
}
function removeLine(i: number) {
  lines.value.splice(i, 1);
}

async function save() {
  if (!canSave.value || cusId.value == null) return;
  saving.value = true;
  try {
    await createSale(cusId.value, paymentMethod.value, lines.value);
    toast.add({ severity: 'success', summary: 'Sale recorded — stock updated', life: 2800 });
    dialogVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Sale failed', detail: errorDetail(e), life: 4000 });
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <div class="sale-header">
      <h2 class="m-0">Sales</h2>
      <span class="flex gap-2">
        <Button icon="pi pi-refresh" text rounded aria-label="Refresh" @click="load" />
        <Button label="New sale" icon="pi pi-plus" size="small" @click="openNew" />
      </span>
    </div>

    <DataTable :value="sales" :loading="loading" paginator :rows="10" stripedRows>
      <Column field="saleId" header="Sale #" sortable />
      <Column header="Customer"><template #body="{ data }">{{ data.customer?.name }}</template></Column>
      <Column header="By"><template #body="{ data }">{{ data.employee?.username }}</template></Column>
      <Column header="Date"><template #body="{ data }">{{ fmtDate(data.saleDate) }}</template></Column>
      <Column header="Payment">
        <template #body="{ data }">
          <Tag :value="data.paymentMethod" :severity="paymentSeverity(data.paymentMethod)" />
        </template>
      </Column>
      <Column field="lineCount" header="Lines" />
      <Column field="total" header="Total" sortable />
    </DataTable>

    <Dialog v-model:visible="dialogVisible" header="New Sale" modal :style="{ width: '660px' }">
      <div class="flex flex-column gap-3 pt-2">
        <div class="grid-2">
          <div class="flex flex-column gap-1">
            <label class="font-medium">Customer</label>
            <Select v-model="cusId" :options="customerOptions" optionLabel="label" optionValue="value" placeholder="Select customer…" />
          </div>
          <div class="flex flex-column gap-1">
            <label class="font-medium">Payment method</label>
            <Select v-model="paymentMethod" :options="paymentOptions" optionLabel="label" optionValue="value" />
          </div>
        </div>

        <div>
          <div class="flex justify-content-between align-items-center mb-2">
            <span class="font-medium">Lines</span>
            <Button label="Add line" icon="pi pi-plus" size="small" text @click="addLine" />
          </div>
          <table class="lines-table">
            <thead>
              <tr><th>Book</th><th style="width: 90px">Qty</th><th style="width: 110px">Subtotal</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="(line, i) in lines" :key="i">
                <td>
                  <Select v-model="line.bookId" :options="bookOptions" optionLabel="label" optionValue="value" placeholder="Book…" fluid />
                </td>
                <td><InputNumber v-model="line.qty" :min="1" :max="lineMax(line.bookId)" fluid /></td>
                <td>{{ lineSubtotal(line).toFixed(2) }}</td>
                <td>
                  <Button icon="pi pi-trash" text rounded severity="danger" :disabled="lines.length === 1" @click="removeLine(i)" />
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-right mt-2"><strong>Total: {{ orderTotal.toFixed(2) }}</strong></div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text @click="dialogVisible = false" />
        <Button label="Confirm sale" icon="pi pi-check" :loading="saving" :disabled="!canSave" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.sale-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.lines-table {
  width: 100%;
  border-collapse: collapse;
}
.lines-table th {
  text-align: left;
  font-weight: 600;
  padding: 0.25rem 0.5rem 0.25rem 0;
}
.lines-table td {
  padding: 0.25rem 0.5rem 0.25rem 0;
  vertical-align: middle;
}
</style>
