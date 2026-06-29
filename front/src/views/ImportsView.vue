<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import { listImports, createImport, type ImportLineInput } from '../api/imports';
import { listPurchaseOrders, getPurchaseOrder } from '../api/purchase-orders';

interface EditableLine {
  bookId: number;
  title: string;
  ordered: number;
  qty: number;
}

const toast = useToast();

const imports = ref<any[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const saving = ref(false);
const pendingPOs = ref<any[]>([]);
const selectedPoId = ref<number | null>(null);
const lines = ref<EditableLine[]>([]);
const loadingLines = ref(false);

const poOptions = computed(() =>
  pendingPOs.value.map((p) => ({
    label: `PO #${p.poId} — ${p.supplier?.supName ?? ''} (${p.lineCount} lines)`,
    value: p.poId,
  })),
);
const canSave = computed(
  () => selectedPoId.value != null && lines.value.length > 0 && lines.value.every((l) => l.qty >= 1),
);

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'Unexpected error';
  return Array.isArray(m) ? m.join(', ') : String(m);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    imports.value = await listImports();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Load failed', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}

async function openNew() {
  selectedPoId.value = null;
  lines.value = [];
  dialogVisible.value = true;
  try {
    const all = await listPurchaseOrders();
    pendingPOs.value = all.filter((p) => p.status === 'pending');
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Could not load POs', detail: errorDetail(e), life: 4000 });
  }
}

// When a PO is chosen, pull its lines and pre-fill received = ordered.
watch(selectedPoId, async (poId) => {
  lines.value = [];
  if (poId == null) return;
  loadingLines.value = true;
  try {
    const po = await getPurchaseOrder(poId);
    lines.value = po.details.map((d: any) => ({
      bookId: d.book.bookId,
      title: d.book.title,
      ordered: d.qty,
      qty: d.qty,
    }));
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Could not load PO lines', detail: errorDetail(e), life: 4000 });
  } finally {
    loadingLines.value = false;
  }
});

async function save() {
  if (!canSave.value || selectedPoId.value == null) return;
  saving.value = true;
  try {
    const payload: ImportLineInput[] = lines.value.map((l) => ({ bookId: l.bookId, qty: l.qty }));
    await createImport(selectedPoId.value, payload);
    toast.add({ severity: 'success', summary: 'Import recorded — stock updated', life: 2800 });
    dialogVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Import failed', detail: errorDetail(e), life: 4000 });
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <div class="imp-header">
      <h2 class="m-0">Imports</h2>
      <span class="flex gap-2">
        <Button icon="pi pi-refresh" text rounded aria-label="Refresh" @click="load" />
        <Button label="New import" icon="pi pi-plus" size="small" @click="openNew" />
      </span>
    </div>

    <DataTable :value="imports" :loading="loading" paginator :rows="10" stripedRows>
      <Column field="importId" header="Import #" sortable />
      <Column header="PO #"><template #body="{ data }">{{ data.order?.poId }}</template></Column>
      <Column header="Supplier"><template #body="{ data }">{{ data.order?.supplier?.supName }}</template></Column>
      <Column header="By"><template #body="{ data }">{{ data.employee?.username }}</template></Column>
      <Column header="Date"><template #body="{ data }">{{ fmtDate(data.importDate) }}</template></Column>
      <Column field="lineCount" header="Lines" />
      <Column field="totalQty" header="Total qty" />
    </DataTable>

    <Dialog v-model:visible="dialogVisible" header="New Import (receive PO)" modal :style="{ width: '620px' }">
      <div class="flex flex-column gap-3 pt-2">
        <div class="flex flex-column gap-1">
          <label class="font-medium">Pending purchase order</label>
          <Select
            v-model="selectedPoId"
            :options="poOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select a pending PO…"
          />
          <Message v-if="!pendingPOs.length" severity="info" class="mt-2">
            No pending purchase orders to import.
          </Message>
        </div>

        <div v-if="lines.length">
          <span class="font-medium">Received quantities</span>
          <table class="lines-table mt-2">
            <thead>
              <tr><th>Book</th><th style="width: 110px">Ordered</th><th style="width: 130px">Received</th></tr>
            </thead>
            <tbody>
              <tr v-for="line in lines" :key="line.bookId">
                <td>{{ line.title }}</td>
                <td>{{ line.ordered }}</td>
                <td><InputNumber v-model="line.qty" :min="1" fluid /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="selectedPoId && loadingLines" class="text-color-secondary">Loading lines…</div>
      </div>

      <template #footer>
        <Button label="Cancel" text @click="dialogVisible = false" />
        <Button label="Confirm import" icon="pi pi-check" :loading="saving" :disabled="!canSave" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.imp-header {
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
  padding: 0.35rem 0.5rem 0.35rem 0;
  vertical-align: middle;
}
</style>
