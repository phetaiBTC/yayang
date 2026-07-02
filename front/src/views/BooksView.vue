<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import DataView from 'primevue/dataview';
import SelectButton from 'primevue/selectbutton';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import CrudDialog, { type FieldDef } from '../components/CrudDialog.vue';
import { booksApi, categoriesApi, bookTypesApi } from '../api/resources';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const toast = useToast();
const confirm = useConfirm();

const books = ref<any[]>([]);
const loading = ref(false);
const layout = ref<'list' | 'grid'>('grid');
const layoutOptions = ['grid', 'list'];

// Filters (client-side).
const search = ref('');
const categoryFilter = ref<string | null>(null);
const typeFilter = ref<string | null>(null);
const inStockOnly = ref(false);
const categoryOptions = computed(() => {
  const names = [...new Set(books.value.map((b) => b.category?.catName).filter(Boolean))] as string[];
  return names.sort().map((n) => ({ label: n, value: n }));
});
const typeOptions = computed(() => {
  const names = [...new Set(books.value.map((b) => b.bookType?.typeName).filter(Boolean))] as string[];
  return names.sort().map((n) => ({ label: n, value: n }));
});
const filteredBooks = computed(() => {
  const q = search.value.trim().toLowerCase();
  return books.value.filter((b) => {
    if (q && !b.title.toLowerCase().includes(q)) return false;
    if (categoryFilter.value && b.category?.catName !== categoryFilter.value) return false;
    if (typeFilter.value && b.bookType?.typeName !== typeFilter.value) return false;
    if (inStockOnly.value && b.stock < 1) return false;
    return true;
  });
});
const hasFilters = computed(
  () => !!search.value || !!categoryFilter.value || !!typeFilter.value || inStockOnly.value,
);
function clearFilters() {
  search.value = '';
  categoryFilter.value = null;
  typeFilter.value = null;
  inStockOnly.value = false;
}

const fields = ref<FieldDef[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const editing = ref<any | null>(null);
const formModel = ref<Record<string, any>>({});

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'ເກີດຂໍ້ຜິດພາດ';
  return Array.isArray(m) ? m.join(', ') : String(m);
}

async function load() {
  loading.value = true;
  try {
    books.value = await booksApi.list();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ໂຫຼດບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}

// Flatten populated relations into the flat DTO shape the API expects.
function toForm(row: any) {
  return {
    title: row.title,
    price: Number(row.price),
    catId: row.category?.catId,
    typeId: row.bookType?.typeId,
    image: row.image,
  };
}

function openNew() {
  editing.value = null;
  formModel.value = {};
  dialogTitle.value = 'ເພີ່ມປຶ້ມ';
  dialogVisible.value = true;
}
function openEdit(row: any) {
  editing.value = row;
  formModel.value = toForm(row);
  dialogTitle.value = 'ແກ້ໄຂປຶ້ມ';
  dialogVisible.value = true;
}

async function save(payload: Record<string, any>) {
  try {
    if (editing.value) await booksApi.update(editing.value.bookId, payload);
    else await booksApi.create(payload);
    toast.add({ severity: 'success', summary: 'ບັນທຶກແລ້ວ', life: 2500 });
    dialogVisible.value = false;
    await load();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ບັນທຶກບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  }
}

function confirmDelete(row: any) {
  confirm.require({
    message: `ຕ້ອງການລຶບປຶ້ມ "${row.title}" ນີ້ບໍ່?`,
    header: 'ຢືນຢັນການລຶບ',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'ຍົກເລີກ', severity: 'secondary', text: true },
    acceptProps: { label: 'ລຶບ', severity: 'danger' },
    accept: async () => {
      try {
        await booksApi.remove(row.bookId);
        toast.add({ severity: 'success', summary: 'ລຶບແລ້ວ', life: 2500 });
        await load();
      } catch (e) {
        toast.add({ severity: 'warn', summary: 'ລຶບບໍ່ໄດ້', detail: errorDetail(e), life: 4500 });
      }
    },
  });
}

onMounted(async () => {
  const [cats, types] = await Promise.all([categoriesApi.list(), bookTypesApi.list()]);
  fields.value = [
    { name: 'title', label: 'ຊື່ປຶ້ມ', type: 'text' },
    { name: 'price', label: 'ລາຄາ', type: 'number' },
    { name: 'catId', label: 'ໝວດໝູ່', type: 'select', options: cats.map((c: any) => ({ label: c.catName, value: c.catId })) },
    { name: 'typeId', label: 'ປະເພດປຶ້ມ', type: 'select', options: types.map((t: any) => ({ label: t.typeName, value: t.typeId })) },
    { name: 'image', label: 'URL ຮູບໜ້າປົກ', type: 'text', hint: 'ວາງລິ້ງຮູບ (https://…)' },
  ];
  await load();
});
</script>

<template>
  <div>
    <div class="books-header">
      <h2 class="m-0">ປຶ້ມ</h2>
      <span class="flex gap-2 align-items-center">
        <SelectButton v-model="layout" :options="layoutOptions" :allowEmpty="false" aria-labelledby="layout">
          <template #option="{ option }">
            <i :class="option === 'list' ? 'pi pi-bars' : 'pi pi-th-large'" />
          </template>
        </SelectButton>
        <Button icon="pi pi-refresh" text rounded aria-label="ໂຫຼດຄືນ" @click="load" />
        <Button v-if="auth.isAdmin" label="ເພີ່ມ" icon="pi pi-plus" size="small" @click="openNew" />
      </span>
    </div>

    <div class="filters">
      <InputText v-model="search" placeholder="ຄົ້ນຫາຊື່ປຶ້ມ…" />
      <Select
        v-model="categoryFilter"
        :options="categoryOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="ທຸກໝວດໝູ່"
        showClear
      />
      <Select
        v-model="typeFilter"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="ທຸກປະເພດ"
        showClear
      />
      <Button
        :label="inStockOnly ? 'ສະເພາະທີ່ມີສະຕັອກ' : 'ສະແດງທັງໝົດ'"
        :icon="inStockOnly ? 'pi pi-check-square' : 'pi pi-stop'"
        severity="secondary"
        outlined
        size="small"
        @click="inStockOnly = !inStockOnly"
      />
      <Button v-if="hasFilters" label="ລ້າງ" icon="pi pi-times" text size="small" @click="clearFilters" />
      <span class="result-count">{{ filteredBooks.length }} ລາຍການ</span>
    </div>

    <DataView :value="filteredBooks" :layout="layout" paginator :rows="12">
      <!-- List layout -->
      <template #list="{ items }">
        <div class="list">
          <div v-for="b in (items as any[])" :key="b.bookId" class="list-row">
            <div class="cover sm">
              <img v-if="b.image" :src="b.image" :alt="b.title" />
              <i v-else class="pi pi-book" />
            </div>
            <div class="info">
              <div class="title">{{ b.title }}</div>
              <div class="meta">
                <Tag :value="b.category?.catName" severity="secondary" />
                <Tag :value="b.bookType?.typeName" severity="secondary" />
                <span class="stock" :class="{ out: b.stock < 1 }">ສະຕັອກ: {{ b.stock }}</span>
              </div>
            </div>
            <div class="price">{{ b.price }} ກີບ</div>
            <div v-if="auth.isAdmin" class="actions">
              <Button icon="pi pi-pencil" text rounded aria-label="ແກ້ໄຂ" @click="openEdit(b)" />
              <Button icon="pi pi-trash" text rounded severity="danger" aria-label="ລຶບ" @click="confirmDelete(b)" />
            </div>
          </div>
        </div>
      </template>

      <!-- Grid layout -->
      <template #grid="{ items }">
        <div class="grid">
          <div v-for="b in (items as any[])" :key="b.bookId" class="card">
            <div class="cover">
              <img v-if="b.image" :src="b.image" :alt="b.title" />
              <i v-else class="pi pi-book" />
            </div>
            <div class="title" :title="b.title">{{ b.title }}</div>
            <div class="meta">
              <Tag :value="b.category?.catName" severity="secondary" />
              <span class="stock" :class="{ out: b.stock < 1 }">ສະຕັອກ {{ b.stock }}</span>
            </div>
            <div class="card-foot">
              <span class="price">{{ b.price }} ກີບ</span>
              <span v-if="auth.isAdmin" class="actions">
                <Button icon="pi pi-pencil" text rounded aria-label="ແກ້ໄຂ" @click="openEdit(b)" />
                <Button icon="pi pi-trash" text rounded severity="danger" aria-label="ລຶບ" @click="confirmDelete(b)" />
              </span>
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="empty">{{ loading ? 'ກຳລັງໂຫຼດ…' : 'ບໍ່ມີຂໍ້ມູນ' }}</div>
      </template>
    </DataView>

    <CrudDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :fields="fields"
      :model-value="formModel"
      @save="save"
    />
  </div>
</template>

<style scoped>
.books-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}
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

.cover {
  display: grid;
  place-items: center;
  background: var(--p-content-hover-background, #f1f5f4);
  border-radius: 10px;
  color: var(--p-primary-color, #63a80f);
  overflow: hidden;
}
.cover i { font-size: 1.8rem; }
.cover img { width: 100%; height: 100%; object-fit: cover; }
.cover.sm { width: 2.75rem; height: 2.75rem; flex: 0 0 auto; }
.cover.sm i { font-size: 1.1rem; }

.title {
  font-weight: 600;
  color: var(--text-h);
}
.meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.35rem;
  font-size: 0.85rem;
}
.stock { color: var(--p-text-muted-color, #6b7280); }
.stock.out { color: #ef4444; font-weight: 600; }
.price { font-weight: 700; color: var(--text-h); white-space: nowrap; }

/* List */
.list {
  display: flex;
  flex-direction: column;
}
.list-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid var(--p-content-border-color, #e5e7eb);
}
.list-row .info { flex: 1 1 auto; min-width: 0; }
.list-row .actions { display: flex; }

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 0.25rem;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--p-content-border-color, #e5e7eb);
  border-radius: 12px;
  background: var(--p-content-background, #fff);
}
.card .cover { height: 180px; }
.card .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.empty {
  padding: 2rem;
  text-align: center;
  color: var(--p-text-muted-color, #6b7280);
}
</style>
