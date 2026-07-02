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
  books.value.map((b) => ({ label: `${b.title} (ສະຕັອກ ${b.stock})`, value: b.bookId })),
);
const canSave = computed(
  () => cusId.value != null && lines.value.length > 0 && lines.value.every((l) => l.bookId && l.qty >= 1),
);

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'ເກີດຂໍ້ຜິດພາດ';
  return Array.isArray(m) ? m.join(', ') : String(m);
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}
function statusSeverity(s: string): string {
  return s === 'completed' ? 'success' : s === 'ready' ? 'info' : s === 'cancelled' ? 'danger' : 'warn';
}
// Display-only Lao labels; the API status values (booked/ready/completed/cancelled) stay unchanged.
const STATUS_LABELS: Record<string, string> = {
  booked: 'ຈອງແລ້ວ',
  ready: 'ພ້ອມຮັບ',
  completed: 'ສຳເລັດ',
  cancelled: 'ຍົກເລີກ',
};
function statusLabel(s: string): string {
  return STATUS_LABELS[s] ?? s;
}

async function load() {
  loading.value = true;
  try {
    reservations.value = await listReservations();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ໂຫຼດບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
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
    toast.add({ severity: 'success', summary: 'ສ້າງການຈອງສຳເລັດ', life: 2500 });
    createVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ບັນທຶກບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
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
    toast.add({ severity: 'success', summary: 'ບັນທຶກເງິນມັດຈຳແລ້ວ', life: 2500 });
    depositVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ບັນທຶກເງິນມັດຈຳບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    depositSaving.value = false;
  }
}

async function advance(row: any, status: 'ready' | 'completed' | 'cancelled') {
  try {
    await setStatus(row.resId, status);
    toast.add({ severity: 'success', summary: `ປ່ຽນສະຖານະເປັນ ${statusLabel(status)}`, life: 2500 });
    await load();
  } catch (e) {
    toast.add({ severity: 'warn', summary: 'ປ່ຽນສະຖານະບໍ່ໄດ້', detail: errorDetail(e), life: 4500 });
  }
}

onMounted(load);
</script>

<template>
  <div>
    <div class="res-header">
      <h2 class="m-0">ການຈອງ</h2>
      <span class="flex gap-2">
        <Button icon="pi pi-refresh" text rounded aria-label="ໂຫຼດຄືນ" @click="load" />
        <Button label="ຈອງໃໝ່" icon="pi pi-plus" size="small" @click="openNew" />
      </span>
    </div>

    <DataTable :value="reservations" :loading="loading" paginator :rows="10" stripedRows scrollable scrollHeight="400px">
      <Column field="resId" header="ເລກທີ" sortable />
      <Column header="ລູກຄ້າ"><template #body="{ data }">{{ data.customer?.name }}</template></Column>
      <Column header="ວັນທີ"><template #body="{ data }"><span class="nowrap">{{ fmtDate(data.resDate) }}</span></template></Column>
      <Column header="ສະຖານະ">
        <template #body="{ data }">
          <Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" />
          <Tag v-if="data.readyEligible" value="ພ້ອມຮັບໄດ້" severity="info" class="ml-1" />
        </template>
      </Column>
      <Column field="deposit" header="ເງິນມັດຈຳ" />
      <Column field="total" header="ລວມ" />
      <Column field="balance" header="ຍອດຄ້າງ" />
      <Column header="ຈັດການ" :style="{ width: '20rem' }">
        <template #body="{ data }">
          <span class="flex gap-1 flex-wrap">
            <Button
              v-if="data.status === 'booked' || data.status === 'ready'"
              label="ເງິນມັດຈຳ"
              icon="pi pi-wallet"
              size="small"
              text
              @click="openDeposit(data)"
            />
            <Button
              v-if="data.status === 'booked'"
              label="ພ້ອມຮັບ"
              icon="pi pi-check-circle"
              size="small"
              :disabled="!data.readyEligible"
              @click="advance(data, 'ready')"
            />
            <Button
              v-if="data.status === 'ready'"
              label="ສຳເລັດ"
              icon="pi pi-flag"
              size="small"
              severity="success"
              @click="advance(data, 'completed')"
            />
            <Button
              v-if="data.status === 'booked' || data.status === 'ready'"
              label="ຍົກເລີກ"
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
    <Dialog v-model:visible="createVisible" header="ຈອງໃໝ່" modal :style="{ width: '620px' }">
      <div class="flex flex-column gap-3 pt-2">
        <div class="flex flex-column gap-1">
          <label class="font-medium">ລູກຄ້າ</label>
          <Select v-model="cusId" :options="customerOptions" optionLabel="label" optionValue="value" placeholder="ເລືອກລູກຄ້າ…" />
        </div>
        <div>
          <div class="flex justify-content-between align-items-center mb-2">
            <span class="font-medium">ປຶ້ມ</span>
            <Button label="ເພີ່ມລາຍການ" icon="pi pi-plus" size="small" text @click="addLine" />
          </div>
          <table class="lines-table">
            <thead><tr><th>ປຶ້ມ</th><th style="width: 90px">ຈຳນວນ</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(line, i) in lines" :key="i">
                <td><Select v-model="line.bookId" :options="bookOptions" optionLabel="label" optionValue="value" placeholder="ປຶ້ມ…" fluid /></td>
                <td><InputNumber v-model="line.qty" :min="1" fluid /></td>
                <td><Button icon="pi pi-trash" text rounded severity="danger" :disabled="lines.length === 1" @click="removeLine(i)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <Button label="ຍົກເລີກ" text @click="createVisible = false" />
        <Button label="ບັນທຶກ" icon="pi pi-check" :loading="saving" :disabled="!canSave" @click="save" />
      </template>
    </Dialog>

    <!-- Record deposit -->
    <Dialog v-model:visible="depositVisible" header="ບັນທຶກເງິນມັດຈຳ" modal :style="{ width: '360px' }">
      <div class="flex flex-column gap-2 pt-2" v-if="depositTarget">
        <p class="m-0">ການຈອງ #{{ depositTarget.resId }} — ລວມ {{ depositTarget.total }}</p>
        <label class="font-medium">ຈຳນວນເງິນມັດຈຳ</label>
        <InputNumber v-model="depositAmount" :min="0" :minFractionDigits="0" :maxFractionDigits="2" fluid />
      </div>
      <template #footer>
        <Button label="ຍົກເລີກ" text @click="depositVisible = false" />
        <Button label="ບັນທຶກ" icon="pi pi-check" :loading="depositSaving" @click="saveDeposit" />
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
/* Keep headers on one line and align cells to the top so tall action
   cells don't stretch the row awkwardly. */
:deep(.p-datatable-thead > tr > th) {
  white-space: nowrap;
}
:deep(.p-datatable-tbody > tr > td) {
  vertical-align: middle;
}
.nowrap {
  white-space: nowrap;
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
