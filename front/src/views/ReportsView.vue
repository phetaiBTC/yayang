<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Chart from 'primevue/chart';
import {
  reportRegistration,
  reportPurchaseOrders,
  reportImports,
  reportSales,
  reportReservations,
  reportBestSellers,
} from '../api/reports';

interface ColDef {
  field: string;
  header: string;
  kind?: 'date';
}
interface ReportDef {
  label: string;
  columns: ColDef[];
  chart?: boolean;
  fetch: (from?: string, to?: string) => Promise<any>;
}

const toast = useToast();

const REPORTS: Record<string, ReportDef> = {
  registration: {
    label: 'ການລົງທະບຽນ',
    columns: [
      { field: 'cusId', header: 'ລະຫັດ' },
      { field: 'name', header: 'ຊື່' },
      { field: 'phone', header: 'ເບີໂທ' },
      { field: 'otpVerified', header: 'ຢືນຢັນ OTP' },
      { field: 'createdAt', header: 'ລົງທະບຽນເມື່ອ', kind: 'date' },
    ],
    fetch: reportRegistration,
  },
  'purchase-orders': {
    label: 'ໃບສັ່ງຊື້',
    columns: [
      { field: 'poId', header: 'ເລກທີ' },
      { field: 'supplier.supName', header: 'ຜູ້ສະໜອງ' },
      { field: 'orderDate', header: 'ວັນທີ', kind: 'date' },
      { field: 'status', header: 'ສະຖານະ' },
      { field: 'lineCount', header: 'ລາຍການ' },
      { field: 'totalCost', header: 'ມູນຄ່າລວມ' },
    ],
    fetch: reportPurchaseOrders,
  },
  imports: {
    label: 'ການນຳເຂົ້າ',
    columns: [
      { field: 'importId', header: 'ເລກທີ' },
      { field: 'order.poId', header: 'ໃບສັ່ງຊື້' },
      { field: 'importDate', header: 'ວັນທີ', kind: 'date' },
      { field: 'lineCount', header: 'ລາຍການ' },
      { field: 'totalQty', header: 'ຈຳນວນລວມ' },
    ],
    fetch: reportImports,
  },
  sales: {
    label: 'ການຂາຍ',
    columns: [
      { field: 'saleId', header: 'ເລກທີ' },
      { field: 'customer.name', header: 'ລູກຄ້າ' },
      { field: 'saleDate', header: 'ວັນທີ', kind: 'date' },
      { field: 'paymentMethod', header: 'ການຊຳລະ' },
      { field: 'lineCount', header: 'ລາຍການ' },
      { field: 'total', header: 'ລວມ' },
    ],
    fetch: reportSales,
  },
  reservations: {
    label: 'ການຈອງ',
    columns: [
      { field: 'resId', header: 'ເລກທີ' },
      { field: 'customer.name', header: 'ລູກຄ້າ' },
      { field: 'resDate', header: 'ວັນທີ', kind: 'date' },
      { field: 'status', header: 'ສະຖານະ' },
      { field: 'deposit', header: 'ເງິນມັດຈຳ' },
      { field: 'total', header: 'ລວມ' },
      { field: 'balance', header: 'ຍອດຄ້າງ' },
    ],
    fetch: reportReservations,
  },
  'best-sellers': {
    label: 'ຂາຍດີທີ່ສຸດ',
    chart: true,
    columns: [
      { field: 'title', header: 'ປຶ້ມ' },
      { field: 'totalQty', header: 'ຈຳນວນທີ່ຂາຍ' },
      { field: 'totalRevenue', header: 'ລາຍຮັບ' },
    ],
    fetch: reportBestSellers,
  },
};

const reportOptions = Object.entries(REPORTS).map(([value, r]) => ({ label: r.label, value }));

const selected = ref<string>('sales');
const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);
const rows = ref<any[]>([]);
const summary = ref<Record<string, any>>({});
const loading = ref(false);

const def = computed(() => REPORTS[selected.value]);
const summaryText = computed(() =>
  Object.entries(summary.value)
    .map(([k, v]) => `${k}: ${v}`)
    .join('  ·  '),
);
const chartData = computed(() => ({
  labels: rows.value.map((r) => r.title),
  datasets: [{ label: 'ຈຳນວນທີ່ຂາຍ', data: rows.value.map((r) => r.totalQty), backgroundColor: '#42A5F5' }],
}));
const chartOptions = { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };

function toYmd(d: Date | null): string | undefined {
  if (!d) return undefined;
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function resolve(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
function fmtDate(iso: string): string {
  return iso ? new Date(iso).toLocaleString() : '';
}
function cell(data: any, col: ColDef): string {
  const v = resolve(data, col.field);
  return col.kind === 'date' ? fmtDate(v) : v == null ? '' : String(v);
}

async function run() {
  loading.value = true;
  try {
    const data = await def.value.fetch(toYmd(fromDate.value), toYmd(toDate.value));
    if (Array.isArray(data)) {
      rows.value = data;
      const totalQty = data.reduce((s: number, r: any) => s + r.totalQty, 0);
      summary.value = { 'ຈຳນວນປຶ້ມ': data.length, 'ຈຳນວນທີ່ຂາຍລວມ': totalQty };
    } else {
      rows.value = data.rows;
      summary.value = data.summary;
    }
  } catch (e: any) {
    const m = e?.response?.data?.message ?? e?.message ?? 'ເກີດຂໍ້ຜິດພາດ';
    toast.add({ severity: 'error', summary: 'ດຶງລາຍງານບໍ່ສຳເລັດ', detail: Array.isArray(m) ? m.join(', ') : m, life: 4000 });
  } finally {
    loading.value = false;
  }
}

onMounted(run);
</script>

<template>
  <div>
    <h2 class="mt-0">ລາຍງານ</h2>

    <div class="filters">
      <Select v-model="selected" :options="reportOptions" optionLabel="label" optionValue="value" @change="run" />
      <DatePicker v-model="fromDate" dateFormat="yy-mm-dd" placeholder="ຈາກວັນທີ" showButtonBar />
      <DatePicker v-model="toDate" dateFormat="yy-mm-dd" placeholder="ຫາວັນທີ" showButtonBar />
      <Button label="ສະແດງ" icon="pi pi-search" :loading="loading" @click="run" />
    </div>

    <p v-if="summaryText" class="summary">{{ summaryText }}</p>

    <Chart
      v-if="def.chart && rows.length"
      type="bar"
      :data="chartData"
      :options="chartOptions"
      class="chart"
    />

    <DataTable :value="rows" :loading="loading" paginator :rows="10" stripedRows class="mt-3">
      <Column v-for="col in def.columns" :key="col.field" :header="col.header">
        <template #body="{ data }">{{ cell(data, col) }}</template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.summary {
  font-weight: 600;
  margin: 0 0 0.5rem;
}
.chart {
  max-height: 320px;
  margin-bottom: 1rem;
}
</style>
