<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../stores/auth';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {
  reportSales,
  reportReservations,
  reportPurchaseOrders,
  reportRegistration,
  reportBestSellers,
} from '../api/reports';

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const recentSales = ref<any[]>([]);
const bestSellers = ref<any[]>([]);
const stats = ref({
  revenue: '0',
  saleCount: 0,
  reservationCount: 0,
  customerCount: 0,
  poCount: 0,
  poCost: '0',
});

function money(v: string | number): string {
  const n = Number(v) || 0;
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ກີບ';
}

const cards = computed(() => [
  { label: 'ລາຍຮັບການຂາຍ', value: money(stats.value.revenue), icon: 'pi pi-dollar', color: '#22c55e', to: '/reports' },
  { label: 'ຈຳນວນການຂາຍ', value: String(stats.value.saleCount), icon: 'pi pi-shopping-cart', color: '#3b82f6', to: '/sales' },
  { label: 'ການຈອງ', value: String(stats.value.reservationCount), icon: 'pi pi-bookmark', color: '#a855f7', to: '/reservations' },
  { label: 'ລູກຄ້າ', value: String(stats.value.customerCount), icon: 'pi pi-users', color: '#f59e0b', to: '/customers' },
  { label: 'ໃບສັ່ງຊື້', value: String(stats.value.poCount), icon: 'pi pi-file', color: '#06b6d4', to: '/purchase-orders' },
  { label: 'ມູນຄ່າສັ່ງຊື້', value: money(stats.value.poCost), icon: 'pi pi-wallet', color: '#ef4444', to: '/purchase-orders' },
]);

const chartData = computed(() => ({
  labels: bestSellers.value.map((r) => r.title),
  datasets: [
    {
      label: 'ຈຳນວນທີ່ຂາຍ',
      data: bestSellers.value.map((r) => r.totalQty),
      backgroundColor: '#42A5F5',
      borderRadius: 6,
    },
  ],
}));
const chartOptions = {
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  maintainAspectRatio: false,
};

function fmtDate(iso: string): string {
  return iso ? new Date(iso).toLocaleDateString() : '';
}

async function load() {
  loading.value = true;
  try {
    const [sales, reservations, pos, regs, best] = await Promise.all([
      reportSales(),
      reportReservations(),
      reportPurchaseOrders(),
      reportRegistration(),
      reportBestSellers(),
    ]);
    stats.value = {
      revenue: sales.summary.totalRevenue ?? '0',
      saleCount: sales.summary.count ?? 0,
      reservationCount: reservations.summary.count ?? 0,
      customerCount: regs.summary.count ?? 0,
      poCount: pos.summary.count ?? 0,
      poCost: pos.summary.totalCost ?? '0',
    };
    recentSales.value = sales.rows.slice(0, 5);
    bestSellers.value = best.slice(0, 8);
  } catch (e: any) {
    const m = e?.response?.data?.message ?? e?.message ?? 'ເກີດຂໍ້ຜິດພາດ';
    toast.add({ severity: 'error', summary: 'ດຶງຂໍ້ມູນບໍ່ສຳເລັດ', detail: Array.isArray(m) ? m.join(', ') : m, life: 4000 });
  } finally {
    loading.value = false;
  }
}

const tiles = [
  { label: 'ປຶ້ມ', icon: 'pi pi-book', to: '/books' },
  { label: 'ການສັ່ງຊື້', icon: 'pi pi-shopping-cart', to: '/purchase-orders' },
  { label: 'ການນຳເຂົ້າ', icon: 'pi pi-download', to: '/imports' },
  { label: 'ການຂາຍ', icon: 'pi pi-dollar', to: '/sales' },
  { label: 'ການຈອງ', icon: 'pi pi-bookmark', to: '/reservations' },
  { label: 'ລາຍງານ', icon: 'pi pi-chart-bar', to: '/reports' },
  { label: 'ໝວດໝູ່', icon: 'pi pi-tags', to: '/categories' },
  { label: 'ປະເພດປຶ້ມ', icon: 'pi pi-list', to: '/book-types' },
  { label: 'ລູກຄ້າ', icon: 'pi pi-user', to: '/customers' },
  { label: 'ຜູ້ສະໜອງ', icon: 'pi pi-truck', to: '/suppliers' },
];

onMounted(load);
</script>

<template>
  <section>
    <h1>ລະບົບຈັດການຮ້ານຂາຍປຶ້ມ</h1>
    <p>ຍິນດີຕ້ອນຮັບ, <strong>{{ auth.user?.username }}</strong> ({{ auth.user?.role }}).</p>

    <div class="stats">
      <Card v-for="c in cards" :key="c.label" class="stat" @click="router.push(c.to)">
        <template #content>
          <div class="stat-body">
            <div class="stat-icon" :style="{ background: c.color }">
              <i :class="c.icon" />
            </div>
            <div>
              <div class="stat-value">{{ loading ? '…' : c.value }}</div>
              <div class="stat-label">{{ c.label }}</div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="grid-2">
      <Card>
        <template #title>ປຶ້ມຂາຍດີທີ່ສຸດ</template>
        <template #content>
          <Chart
            v-if="bestSellers.length"
            type="bar"
            :data="chartData"
            :options="chartOptions"
            class="chart"
          />
          <p v-else class="empty">{{ loading ? 'ກຳລັງໂຫຼດ…' : 'ຍັງບໍ່ມີຂໍ້ມູນການຂາຍ' }}</p>
        </template>
      </Card>

      <Card>
        <template #title>ການຂາຍລ່າສຸດ</template>
        <template #content>
          <DataTable :value="recentSales" :loading="loading" size="small">
            <Column field="saleId" header="ເລກທີ" />
            <Column field="customer.name" header="ລູກຄ້າ">
              <template #body="{ data }">{{ data.customer?.name ?? '-' }}</template>
            </Column>
            <Column header="ວັນທີ">
              <template #body="{ data }">{{ fmtDate(data.saleDate) }}</template>
            </Column>
            <Column header="ລວມ">
              <template #body="{ data }">{{ money(data.total) }}</template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <h2 class="section-title">ທາງລັດ</h2>
    <div class="tiles">
      <Card v-for="t in tiles" :key="t.to" class="tile" @click="router.push(t.to)">
        <template #content>
          <i :class="t.icon" style="font-size: 1.6rem" />
          <div class="tile-label">{{ t.label }}</div>
        </template>
      </Card>
      <Card v-if="auth.isAdmin" class="tile" @click="router.push('/employees')">
        <template #content>
          <i class="pi pi-users" style="font-size: 1.6rem" />
          <div class="tile-label">ພະນັກງານ</div>
        </template>
      </Card>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}
.stat {
  cursor: pointer;
  transition: transform 0.1s ease;
}
.stat:hover {
  transform: translateY(-2px);
}
.stat-body {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 1.4rem;
  flex: 0 0 auto;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-h);
}
.stat-label {
  color: var(--text);
  font-size: 0.9rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 900px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
.chart {
  height: 300px;
}
.empty {
  color: var(--text);
  padding: 2rem 0;
  text-align: center;
}

.section-title {
  margin-top: 1rem;
}
.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.tile {
  cursor: pointer;
  text-align: center;
  transition: transform 0.1s ease;
}
.tile:hover {
  transform: translateY(-2px);
}
.tile-label {
  margin-top: 0.5rem;
  font-weight: 600;
}
</style>
