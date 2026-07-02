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
import { listPurchaseOrders, createPurchaseOrder, type PoLineInput } from '../api/purchase-orders';
import { booksApi, suppliersApi } from '../api/resources';

const toast = useToast();

const orders = ref<any[]>([]);
const loading = ref(false);
const suppliers = ref<any[]>([]);
const books = ref<any[]>([]);

const dialogVisible = ref(false);
const saving = ref(false);
const supId = ref<number | null>(null);
const lines = ref<PoLineInput[]>([]);

const supplierOptions = computed(() =>
  suppliers.value.map((s) => ({ label: s.supName, value: s.supId })),
);
const bookOptions = computed(() => books.value.map((b) => ({ label: b.title, value: b.bookId })));
const orderTotal = computed(() =>
  lines.value.reduce((sum, l) => sum + (l.qty || 0) * (l.costPrice || 0), 0),
);
const canSave = computed(
  () =>
    supId.value != null &&
    lines.value.length > 0 &&
    lines.value.every((l) => l.bookId && l.qty >= 1 && l.costPrice >= 0),
);

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'ເກີດຂໍ້ຜິດພາດ';
  return Array.isArray(m) ? m.join(', ') : String(m);
}

// Display-only Lao labels; the API status values (pending/received) stay unchanged.
const STATUS_LABELS: Record<string, string> = { pending: 'ລໍຖ້າ', received: 'ຮັບແລ້ວ' };
function statusLabel(s: string): string {
  return STATUS_LABELS[s] ?? s;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    orders.value = await listPurchaseOrders();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ໂຫຼດບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}

async function openNew() {
  supId.value = null;
  lines.value = [{ bookId: 0, qty: 1, costPrice: 0 }];
  dialogVisible.value = true;
  if (!suppliers.value.length || !books.value.length) {
    [suppliers.value, books.value] = await Promise.all([suppliersApi.list(), booksApi.list()]);
  }
}

function addLine() {
  lines.value.push({ bookId: 0, qty: 1, costPrice: 0 });
}
function removeLine(i: number) {
  lines.value.splice(i, 1);
}

async function save() {
  if (!canSave.value || supId.value == null) return;
  saving.value = true;
  try {
    await createPurchaseOrder(supId.value, lines.value);
    toast.add({ severity: 'success', summary: 'ສ້າງໃບສັ່ງຊື້ສຳເລັດ', life: 2500 });
    dialogVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ບັນທຶກບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <div class="po-header">
      <h2 class="m-0">ໃບສັ່ງຊື້</h2>
      <span class="flex gap-2">
        <Button icon="pi pi-refresh" text rounded aria-label="ໂຫຼດຄືນ" @click="load" />
        <Button label="ສ້າງໃບສັ່ງຊື້" icon="pi pi-plus" size="small" @click="openNew" />
      </span>
    </div>

    <DataTable :value="orders" :loading="loading" paginator :rows="10" stripedRows>
      <Column field="poId" header="ເລກທີ" sortable />
      <Column field="supplier.supName" header="ຜູ້ສະໜອງ" sortable />
      <Column header="ສັ່ງໂດຍ">
        <template #body="{ data }">{{ data.employee?.username }}</template>
      </Column>
      <Column header="ວັນທີ">
        <template #body="{ data }">{{ fmtDate(data.orderDate) }}</template>
      </Column>
      <Column field="lineCount" header="ລາຍການ" />
      <Column header="ມູນຄ່າລວມ">
        <template #body="{ data }">{{ data.totalCost }}</template>
      </Column>
      <Column header="ສະຖານະ">
        <template #body="{ data }">
          <Tag
            :value="statusLabel(data.status)"
            :severity="data.status === 'received' ? 'success' : 'warn'"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialogVisible" header="ສ້າງໃບສັ່ງຊື້ໃໝ່" modal :style="{ width: '640px' }">
      <div class="flex flex-column gap-3 pt-2">
        <div class="flex flex-column gap-1">
          <label class="font-medium">ຜູ້ສະໜອງ</label>
          <Select
            v-model="supId"
            :options="supplierOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="ເລືອກຜູ້ສະໜອງ…"
          />
        </div>

        <div>
          <div class="flex justify-content-between align-items-center mb-2">
            <span class="font-medium">ລາຍການ</span>
            <Button label="ເພີ່ມລາຍການ" icon="pi pi-plus" size="small" text @click="addLine" />
          </div>

          <table class="lines-table">
            <thead>
              <tr><th>ປຶ້ມ</th><th style="width: 90px">ຈຳນວນ</th><th style="width: 120px">ຕົ້ນທຶນ</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="(line, i) in lines" :key="i">
                <td>
                  <Select
                    v-model="line.bookId"
                    :options="bookOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="ປຶ້ມ…"
                    fluid
                  />
                </td>
                <td><InputNumber v-model="line.qty" :min="1" fluid /></td>
                <td><InputNumber v-model="line.costPrice" :min="0" :minFractionDigits="0" :maxFractionDigits="2" fluid /></td>
                <td>
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    :disabled="lines.length === 1"
                    @click="removeLine(i)"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div class="text-right mt-2"><strong>ລວມ: {{ orderTotal }}</strong></div>
        </div>
      </div>

      <template #footer>
        <Button label="ຍົກເລີກ" text @click="dialogVisible = false" />
        <Button label="ບັນທຶກ" icon="pi pi-check" :loading="saving" :disabled="!canSave" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.po-header {
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
  vertical-align: top;
}
</style>
