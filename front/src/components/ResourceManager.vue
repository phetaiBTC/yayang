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
  const msg = e?.response?.data?.message ?? e?.message ?? 'ເກີດຂໍ້ຜິດພາດ';
  return Array.isArray(msg) ? msg.join(', ') : String(msg);
}

async function load() {
  loading.value = true;
  try {
    rows.value = await props.api.list();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ໂຫຼດບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}

function openNew() {
  editing.value = null;
  formModel.value = {};
  dialogTitle.value = `ເພີ່ມ${props.title}`;
  dialogVisible.value = true;
}

// Keep only the editable fields so the id key and populated relations aren't
// sent back on update (the API whitelist rejects unknown props like `catId`).
function pickFields(row: any): Record<string, any> {
  return Object.fromEntries(props.fields.map((f) => [f.name, row[f.name]]));
}

function openEdit(row: any) {
  editing.value = row;
  formModel.value = props.toForm ? props.toForm(row) : pickFields(row);
  dialogTitle.value = `ແກ້ໄຂ${props.title}`;
  dialogVisible.value = true;
}

async function save(payload: Record<string, any>) {
  try {
    if (editing.value) {
      await props.api.update(editing.value[props.idKey], payload);
    } else {
      await props.api.create(payload);
    }
    toast.add({ severity: 'success', summary: 'ບັນທຶກແລ້ວ', life: 2500 });
    dialogVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ບັນທຶກບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  }
}

function confirmDelete(row: any) {
  confirm.require({
    message: `ຕ້ອງການລຶບ${props.title}ນີ້ບໍ່?`,
    header: 'ຢືນຢັນການລຶບ',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'ຍົກເລີກ', severity: 'secondary', text: true },
    acceptProps: { label: 'ລຶບ', severity: 'danger' },
    accept: async () => {
      try {
        await props.api.remove(row[props.idKey]);
        toast.add({ severity: 'success', summary: 'ລຶບແລ້ວ', life: 2500 });
        await load();
      } catch (e) {
        // Surfaces business-rule blocks (e.g. category/book-type in use → 409).
        toast.add({ severity: 'warn', summary: 'ລຶບບໍ່ໄດ້', detail: errorDetail(e), life: 4500 });
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
