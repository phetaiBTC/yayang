<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

export interface ColumnDef {
  field: string;
  header: string;
}

defineProps<{
  title: string;
  columns: ColumnDef[];
  rows: any[];
  loading?: boolean;
  canWrite?: boolean;
}>();

const emit = defineEmits<{
  (e: 'new'): void;
  (e: 'edit', row: any): void;
  (e: 'delete', row: any): void;
  (e: 'refresh'): void;
}>();
</script>

<template>
  <div>
    <div class="crud-header">
      <h2 class="m-0">{{ title }}</h2>
      <span class="flex gap-2">
        <Button icon="pi pi-refresh" text rounded aria-label="ໂຫຼດຄືນ" @click="emit('refresh')" />
        <Button
          v-if="canWrite"
          label="ເພີ່ມ"
          icon="pi pi-plus"
          size="small"
          @click="emit('new')"
        />
      </span>
    </div>

    <DataTable
      :value="rows"
      :loading="loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50]"
      stripedRows
      dataKey="0"
      responsiveLayout="scroll"
    >
      <Column v-for="c in columns" :key="c.field" :field="c.field" :header="c.header" sortable />
      <Column v-if="canWrite" header="ຈັດການ" :style="{ width: '8rem' }">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text rounded aria-label="ແກ້ໄຂ" @click="emit('edit', data)" />
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            aria-label="ລຶບ"
            @click="emit('delete', data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.crud-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
</style>
