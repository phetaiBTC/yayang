<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import CrudTable, { type ColumnDef } from './CrudTable.vue';
import CrudDialog, { type FieldDef } from './CrudDialog.vue';
import type { CrudApi } from '../api/resources';

const props = defineProps<{
  title: string;
  api: CrudApi;
  idKey: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  canWrite?: boolean;
  /** Map a row to the form model when editing (e.g. flatten relations). */
  toForm?: (row: any) => Record<string, any>;
}>();

const rows = ref<any[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const editing = ref<any | null>(null);
const formModel = ref<Record<string, any>>({});

const toast = useToast();
const confirm = useConfirm();

function errorDetail(e: any): string {
  const msg = e?.response?.data?.message ?? e?.message ?? 'Unexpected error';
  return Array.isArray(msg) ? msg.join(', ') : String(msg);
}

async function load() {
  loading.value = true;
  try {
    rows.value = await props.api.list();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Load failed', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}

function openNew() {
  editing.value = null;
  formModel.value = {};
  dialogTitle.value = `New ${props.title}`;
  dialogVisible.value = true;
}

function openEdit(row: any) {
  editing.value = row;
  formModel.value = props.toForm ? props.toForm(row) : { ...row };
  dialogTitle.value = `Edit ${props.title}`;
  dialogVisible.value = true;
}

async function save(payload: Record<string, any>) {
  try {
    if (editing.value) {
      await props.api.update(editing.value[props.idKey], payload);
    } else {
      await props.api.create(payload);
    }
    toast.add({ severity: 'success', summary: 'Saved', life: 2500 });
    dialogVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Save failed', detail: errorDetail(e), life: 4000 });
  }
}

function confirmDelete(row: any) {
  confirm.require({
    message: `Delete this ${props.title.toLowerCase().replace(/s$/, '')}?`,
    header: 'Confirm delete',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Cancel', severity: 'secondary', text: true },
    acceptProps: { label: 'Delete', severity: 'danger' },
    accept: async () => {
      try {
        await props.api.remove(row[props.idKey]);
        toast.add({ severity: 'success', summary: 'Deleted', life: 2500 });
        await load();
      } catch (e) {
        // Surfaces business-rule blocks (e.g. category/book-type in use → 409).
        toast.add({ severity: 'warn', summary: 'Cannot delete', detail: errorDetail(e), life: 4500 });
      }
    },
  });
}

onMounted(load);
defineExpose({ reload: load });
</script>

<template>
  <CrudTable
    :title="title"
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :can-write="canWrite"
    @new="openNew"
    @edit="openEdit"
    @delete="confirmDelete"
    @refresh="load"
  />
  <CrudDialog
    v-model:visible="dialogVisible"
    :title="dialogTitle"
    :fields="fields"
    :model-value="formModel"
    @save="save"
  />
</template>
