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
import {
  listReservations,
  createReservation,
  setDeposit,
  setStatus,
  type ReservationLineInput,
} from '../api/reservations';
import { booksApi, customersApi } from '../api/resources';

const toast = useToast();

const reservations = ref<any[]>([]);
const loading = ref(false);
const customers = ref<any[]>([]);
const books = ref<any[]>([]);

// Create dialog
const createVisible = ref(false);
const saving = ref(false);
const cusId = ref<number | null>(null);
const lines = ref<ReservationLineInput[]>([]);

// Deposit dialog
const depositVisible = ref(false);
const depositTarget = ref<any | null>(null);
const depositAmount = ref<number>(0);
const depositSaving = ref(false);

const customerOptions = computed(() =>
  customers.value.map((c) => ({ label: c.name, value: c.cusId })),
);
const bookOptions = computed(() =>
  books.value.map((b) => ({ label: `${b.title} (stock ${b.stock})`, value: b.bookId })),
);
const canSave = computed(
  () => cusId.value != null && lines.value.length > 0 && lines.value.every((l) => l.bookId && l.qty >= 1),
);

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'Unexpected error';
  return Array.isArray(m) ? m.join(', ') : String(m);
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}
function statusSeverity(s: string): string {
  return s === 'completed' ? 'success' : s === 'ready' ? 'info' : s === 'cancelled' ? 'danger' : 'warn';
}

async function load() {
  loading.value = true;
  try {
    reservations.value = await listReservations();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Load failed', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}

async function openNew() {
  cusId.value = null;
  lines.value = [{ bookId: 0, qty: 1 }];
  createVisible.value = true;
  if (!customers.value.length || !books.value.length) {
    [customers.value, books.value] = await Promise.all([customersApi.list(), booksApi.list()]);
  }
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
    await createReservation(cusId.value, lines.value);
    toast.add({ severity: 'success', summary: 'Reservation created', life: 2500 });
    createVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Save failed', detail: errorDetail(e), life: 4000 });
  } finally {
    saving.value = false;
  }
}

function openDeposit(row: any) {
  depositTarget.value = row;
  depositAmount.value = Number(row.deposit) || 0;
  depositVisible.value = true;
}
async function saveDeposit() {
  if (!depositTarget.value) return;
  depositSaving.value = true;
  try {
    await setDeposit(depositTarget.value.resId, depositAmount.value);
    toast.add({ severity: 'success', summary: 'Deposit recorded', life: 2500 });
    depositVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Deposit failed', detail: errorDetail(e), life: 4000 });
  } finally {
    depositSaving.value = false;
  }
}

async function advance(row: any, status: 'ready' | 'completed' | 'cancelled') {
  try {
    await setStatus(row.resId, status);
    toast.add({ severity: 'success', summary: `Marked ${status}`, life: 2500 });
    await load();
  } catch (e) {
    toast.add({ severity: 'warn', summary: 'Cannot update status', detail: errorDetail(e), life: 4500 });
  }
}

onMounted(load);
</script>

<template>
  <div>
    <div class="res-header">
      <h2 class="m-0">Reservations</h2>
      <span class="flex gap-2">
        <Button icon="pi pi-refresh" text rounded aria-label="Refresh" @click="load" />
        <Button label="New reservation" icon="pi pi-plus" size="small" @click="openNew" />
      </span>
    </div>

    <DataTable :value="reservations" :loading="loading" paginator :rows="10" stripedRows>
      <Column field="resId" header="#" sortable />
      <Column header="Customer"><template #body="{ data }">{{ data.customer?.name }}</template></Column>
      <Column header="Date"><template #body="{ data }">{{ fmtDate(data.resDate) }}</template></Column>
      <Column header="Status">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="statusSeverity(data.status)" />
          <Tag v-if="data.readyEligible" value="ready-eligible" severity="info" class="ml-1" />
        </template>
      </Column>
      <Column field="deposit" header="Deposit" />
      <Column field="total" header="Total" />
      <Column field="balance" header="Balance" />
      <Column header="Actions" :style="{ width: '20rem' }">
        <template #body="{ data }">
          <span class="flex gap-1 flex-wrap">
            <Button
              v-if="data.status === 'booked' || data.status === 'ready'"
              label="Deposit"
              icon="pi pi-wallet"
              size="small"
              text
              @click="openDeposit(data)"
            />
            <Button
              v-if="data.status === 'booked'"
              label="Ready"
              icon="pi pi-check-circle"
              size="small"
              :disabled="!data.readyEligible"
              @click="advance(data, 'ready')"
            />
            <Button
              v-if="data.status === 'ready'"
              label="Complete"
              icon="pi pi-flag"
              size="small"
              severity="success"
              @click="advance(data, 'completed')"
            />
            <Button
              v-if="data.status === 'booked' || data.status === 'ready'"
              label="Cancel"
              icon="pi pi-times"
              size="small"
              severity="danger"
              text
              @click="advance(data, 'cancelled')"
            />
          </span>
        </template>
      </Column>
    </DataTable>

    <!-- Create reservation -->
    <Dialog v-model:visible="createVisible" header="New Reservation" modal :style="{ width: '620px' }">
      <div class="flex flex-column gap-3 pt-2">
        <div class="flex flex-column gap-1">
          <label class="font-medium">Customer</label>
          <Select v-model="cusId" :options="customerOptions" optionLabel="label" optionValue="value" placeholder="Select customer…" />
        </div>
        <div>
          <div class="flex justify-content-between align-items-center mb-2">
            <span class="font-medium">Books</span>
            <Button label="Add line" icon="pi pi-plus" size="small" text @click="addLine" />
          </div>
          <table class="lines-table">
            <thead><tr><th>Book</th><th style="width: 90px">Qty</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(line, i) in lines" :key="i">
                <td><Select v-model="line.bookId" :options="bookOptions" optionLabel="label" optionValue="value" placeholder="Book…" fluid /></td>
                <td><InputNumber v-model="line.qty" :min="1" fluid /></td>
                <td><Button icon="pi pi-trash" text rounded severity="danger" :disabled="lines.length === 1" @click="removeLine(i)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="createVisible = false" />
        <Button label="Save" icon="pi pi-check" :loading="saving" :disabled="!canSave" @click="save" />
      </template>
    </Dialog>

    <!-- Record deposit -->
    <Dialog v-model:visible="depositVisible" header="Record Deposit" modal :style="{ width: '360px' }">
      <div class="flex flex-column gap-2 pt-2" v-if="depositTarget">
        <p class="m-0">Reservation #{{ depositTarget.resId }} — total {{ depositTarget.total }}</p>
        <label class="font-medium">Deposit amount</label>
        <InputNumber v-model="depositAmount" :min="0" :minFractionDigits="0" :maxFractionDigits="2" fluid />
      </div>
      <template #footer>
        <Button label="Cancel" text @click="depositVisible = false" />
        <Button label="Save" icon="pi pi-check" :loading="depositSaving" @click="saveDeposit" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.res-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
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
