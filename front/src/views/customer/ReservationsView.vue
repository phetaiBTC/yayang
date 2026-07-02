<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { getMyReservations, type MyReservation } from '../../api/customer';
import { STATUS_LABELS, statusLabel, statusSeverity, fmtDate, errorDetail } from './shared';

const toast = useToast();

const reservations = ref<MyReservation[]>([]);
const loadingRes = ref(false);

const resStatusFilter = ref<string | null>(null);
const resStatusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value }));
const filteredReservations = computed(() =>
  resStatusFilter.value
    ? reservations.value.filter((r) => r.status === resStatusFilter.value)
    : reservations.value,
);

async function loadReservations() {
  loadingRes.value = true;
  try {
    reservations.value = await getMyReservations();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ໂຫຼດການຈອງບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    loadingRes.value = false;
  }
}

onMounted(loadReservations);
</script>

<template>
  <div>
    <h2 class="mt-0">ການຈອງຂອງຂ້ອຍ</h2>

    <div class="filters">
      <Select
        v-model="resStatusFilter"
        :options="resStatusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="ທຸກສະຖານະ"
        showClear
      />
      <Button v-if="resStatusFilter" label="ລ້າງ" icon="pi pi-times" text size="small" @click="resStatusFilter = null" />
      <span class="result-count">{{ filteredReservations.length }} ລາຍການ</span>
    </div>

    <DataTable :value="filteredReservations" :loading="loadingRes" dataKey="resId" paginator :rows="10" stripedRows>
      <Column field="resId" header="ເລກທີ" sortable />
      <Column field="resDate" header="ວັນທີ" sortable>
        <template #body="{ data }">{{ fmtDate(data.resDate) }}</template>
      </Column>
      <Column field="status" header="ສະຖານະ" sortable>
        <template #body="{ data }">
          <Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" />
        </template>
      </Column>
      <Column field="lineCount" header="ລາຍການ" sortable />
      <Column field="total" header="ລວມ" sortable />
      <Column field="deposit" header="ເງິນມັດຈຳ" sortable />
      <Column field="balance" header="ຍອດຄ້າງ" sortable />
    </DataTable>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.result-count {
  color: var(--p-text-muted-color, #6b7280);
  font-size: 0.9rem;
  margin-left: auto;
}
</style>
