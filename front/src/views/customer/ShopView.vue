<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import DataView from 'primevue/dataview';
import SelectButton from 'primevue/selectbutton';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import {
  getCatalog,
  createMyReservation,
  createMyPurchase,
  type CatalogBook,
  type PaymentMethod,
} from '../../api/customer';
import { errorDetail } from './shared';

const toast = useToast();

const books = ref<CatalogBook[]>([]);
const loadingBooks = ref(false);
const checkingOut = ref(false);
const qty = reactive<Record<number, number>>({});

const layout = ref<'list' | 'grid'>('grid');
const layoutOptions = ['grid', 'list'];

// Catalog filters (client-side).
const search = ref('');
const categoryFilter = ref<string | null>(null);
const inStockOnly = ref(false);
const categoryOptions = computed(() => {
  const names = [...new Set(books.value.map((b) => b.category?.catName).filter(Boolean))] as string[];
  return names.sort().map((n) => ({ label: n, value: n }));
});
const filteredBooks = computed(() => {
  const q = search.value.trim().toLowerCase();
  return books.value.filter((b) => {
    if (q && !b.title.toLowerCase().includes(q)) return false;
    if (categoryFilter.value && b.category?.catName !== categoryFilter.value) return false;
    if (inStockOnly.value && b.stock < 1) return false;
    return true;
  });
});
function clearFilters() {
  search.value = '';
  categoryFilter.value = null;
  inStockOnly.value = false;
}

async function loadBooks() {
  loadingBooks.value = true;
  try {
    books.value = await getCatalog();
    books.value.forEach((b) => {
      if (!(b.bookId in qty)) qty[b.bookId] = 1;
    });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ໂຫຼດລາຍການປຶ້ມບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    loadingBooks.value = false;
  }
}

// --- Cart / checkout ---
interface CartLine {
  bookId: number;
  title: string;
  price: number;
  qty: number;
  stock: number;
}
const cart = ref<CartLine[]>([]);
const paymentMethod = ref<PaymentMethod>('cash');
const paymentOptions = [
  { label: 'ເງິນສົດ', value: 'cash' },
  { label: 'ໂອນ', value: 'transfer' },
  { label: 'QR', value: 'qr' },
];
const cartTotal = computed(() => cart.value.reduce((s, l) => s + l.qty * l.price, 0));

function addToCart(book: CatalogBook) {
  const want = qty[book.bookId] || 1;
  const line = cart.value.find((l) => l.bookId === book.bookId);
  if (line) line.qty = Math.min(line.qty + want, book.stock);
  else
    cart.value.push({
      bookId: book.bookId,
      title: book.title,
      price: Number(book.price),
      qty: Math.min(want, book.stock),
      stock: book.stock,
    });
  toast.add({ severity: 'info', summary: 'ເພີ່ມເຂົ້າກະຕ່າແລ້ວ', life: 1500 });
}
function removeFromCart(bookId: number) {
  cart.value = cart.value.filter((l) => l.bookId !== bookId);
}
async function checkout() {
  if (!cart.value.length) return;
  checkingOut.value = true;
  try {
    await createMyPurchase(paymentMethod.value, cart.value.map((l) => ({ bookId: l.bookId, qty: l.qty })));
    toast.add({ severity: 'success', summary: 'ຊື້ສຳເລັດ', life: 2800 });
    cart.value = [];
    await loadBooks(); // refresh stock
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ຊື້ບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    checkingOut.value = false;
  }
}

// --- Reservation (requires a deposit) ---
const DEPOSIT_RATE = 0.5;
const reserveVisible = ref(false);
const reserveBook = ref<CatalogBook | null>(null);
const reserveQty = ref(1);
const depositAmount = ref(0);
const savingReserve = ref(false);
const reserveTotal = computed(() => reserveQty.value * Number(reserveBook.value?.price ?? 0));

function openReserve(book: CatalogBook) {
  reserveBook.value = book;
  reserveQty.value = qty[book.bookId] || 1;
  depositAmount.value = Number((reserveQty.value * Number(book.price) * DEPOSIT_RATE).toFixed(2));
  reserveVisible.value = true;
}
watch(reserveTotal, (total) => {
  if (depositAmount.value > total) depositAmount.value = total;
  if (depositAmount.value <= 0) depositAmount.value = Number((total * DEPOSIT_RATE).toFixed(2));
});
async function confirmReserve() {
  const book = reserveBook.value;
  if (!book) return;
  if (depositAmount.value <= 0 || depositAmount.value > reserveTotal.value) {
    toast.add({ severity: 'warn', summary: 'ກະລຸນາໃສ່ເງິນມັດຈຳໃຫ້ຖືກຕ້ອງ', life: 3000 });
    return;
  }
  savingReserve.value = true;
  try {
    await createMyReservation([{ bookId: book.bookId, qty: reserveQty.value }], depositAmount.value);
    toast.add({ severity: 'success', summary: 'ຈອງສຳເລັດ — ຈ່າຍເງິນມັດຈຳແລ້ວ', life: 2800 });
    reserveVisible.value = false;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ຈອງບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    savingReserve.value = false;
  }
}

onMounted(loadBooks);
</script>

<template>
  <div>
    <div class="books-header">
      <h2 class="m-0">ລາຍການປຶ້ມ</h2>
      <SelectButton v-model="layout" :options="layoutOptions" :allowEmpty="false" aria-label="layout">
        <template #option="{ option }">
          <i :class="option === 'list' ? 'pi pi-bars' : 'pi pi-th-large'" />
        </template>
      </SelectButton>
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
      <Button
        :label="inStockOnly ? 'ສະເພາະທີ່ມີສະຕັອກ' : 'ສະແດງທັງໝົດ'"
        :icon="inStockOnly ? 'pi pi-check-square' : 'pi pi-stop'"
        severity="secondary"
        outlined
        size="small"
        @click="inStockOnly = !inStockOnly"
      />
      <Button v-if="search || categoryFilter || inStockOnly" label="ລ້າງ" icon="pi pi-times" text size="small" @click="clearFilters" />
      <span class="result-count">{{ filteredBooks.length }} ລາຍການ</span>
    </div>

    <DataView :value="filteredBooks" :layout="layout" :loading="loadingBooks" paginator :rows="12" dataKey="bookId">
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
            <div class="buy">
              <InputNumber v-model="qty[b.bookId]" :min="1" :max="b.stock || 1" :disabled="b.stock < 1" showButtons buttonLayout="horizontal" :inputStyle="{ width: '2.5rem' }" />
              <Button label="ຊື້" icon="pi pi-shopping-cart" size="small" :disabled="b.stock < 1" @click="addToCart(b)" />
              <Button label="ຈອງ" icon="pi pi-bookmark" size="small" severity="secondary" :disabled="b.stock < 1" @click="openReserve(b)" />
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
            <div class="price">{{ b.price }} ກີບ</div>
            <div class="buy">
              <InputNumber v-model="qty[b.bookId]" :min="1" :max="b.stock || 1" :disabled="b.stock < 1" showButtons buttonLayout="horizontal" :inputStyle="{ width: '2.5rem' }" />
            </div>
            <div class="actions">
              <Button label="ຊື້" icon="pi pi-shopping-cart" size="small" :disabled="b.stock < 1" @click="addToCart(b)" />
              <Button label="ຈອງ" icon="pi pi-bookmark" size="small" severity="secondary" :disabled="b.stock < 1" @click="openReserve(b)" />
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="empty">{{ loadingBooks ? 'ກຳລັງໂຫຼດ…' : 'ບໍ່ມີຂໍ້ມູນ' }}</div>
      </template>
    </DataView>

    <Card v-if="cart.length" class="cart-card">
      <template #title>ກະຕ່າສິນຄ້າ</template>
      <template #content>
        <table class="cart-table">
          <thead>
            <tr><th>ປຶ້ມ</th><th style="width: 110px">ຈຳນວນ</th><th style="width: 120px">ລວມຍ່ອຍ</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="l in cart" :key="l.bookId">
              <td>{{ l.title }}</td>
              <td><InputNumber v-model="l.qty" :min="1" :max="l.stock" showButtons buttonLayout="horizontal" :inputStyle="{ width: '3rem' }" /></td>
              <td>{{ (l.qty * l.price).toFixed(2) }}</td>
              <td><Button icon="pi pi-trash" text rounded severity="danger" @click="removeFromCart(l.bookId)" /></td>
            </tr>
          </tbody>
        </table>
        <div class="cart-footer">
          <div class="flex align-items-center gap-2">
            <span>ວິທີຊຳລະ:</span>
            <Select v-model="paymentMethod" :options="paymentOptions" optionLabel="label" optionValue="value" />
          </div>
          <strong>ລວມ: {{ cartTotal.toFixed(2) }}</strong>
          <Button label="ຊຳລະເງິນ" icon="pi pi-check" :loading="checkingOut" @click="checkout" />
        </div>
      </template>
    </Card>

    <Dialog v-model:visible="reserveVisible" modal header="ຈອງປຶ້ມ" :style="{ width: '380px' }">
      <div v-if="reserveBook" class="flex flex-column gap-3 pt-2">
        <div class="font-medium">{{ reserveBook.title }}</div>
        <div class="flex align-items-center justify-content-between">
          <label>ຈຳນວນ</label>
          <InputNumber v-model="reserveQty" :min="1" :max="reserveBook.stock" showButtons buttonLayout="horizontal" :inputStyle="{ width: '3rem' }" />
        </div>
        <div class="flex align-items-center justify-content-between">
          <span>ລວມທັງໝົດ</span>
          <strong>{{ reserveTotal.toFixed(2) }}</strong>
        </div>
        <div class="flex flex-column gap-1">
          <label class="font-medium">ເງິນມັດຈຳ (ຕ້ອງຈ່າຍ)</label>
          <InputNumber v-model="depositAmount" :min="0" :max="reserveTotal" :minFractionDigits="0" :maxFractionDigits="2" fluid />
          <small class="text-color-secondary">ແນະນຳ {{ (DEPOSIT_RATE * 100).toFixed(0) }}% ຂອງລວມ · ຍອດຄ້າງຈ່າຍຕອນຮັບປຶ້ມ</small>
        </div>
      </div>
      <template #footer>
        <Button label="ຍົກເລີກ" text @click="reserveVisible = false" />
        <Button
          label="ຢືນຢັນ & ຈ່າຍມັດຈຳ"
          icon="pi pi-check"
          :loading="savingReserve"
          :disabled="depositAmount <= 0 || depositAmount > reserveTotal"
          @click="confirmReserve"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.books-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
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

.title { font-weight: 600; color: var(--text-h); }
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
.list { display: flex; flex-direction: column; }
.list-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid var(--p-content-border-color, #e5e7eb);
}
.list-row .info { flex: 1 1 auto; min-width: 0; }
.list-row .buy { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
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
.card .title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card .buy { display: flex; justify-content: center; }
.card .actions { display: flex; gap: 0.5rem; margin-top: auto; }
.card .actions :deep(.p-button) { flex: 1 1 0; }

.empty { padding: 2rem; text-align: center; color: var(--p-text-muted-color, #6b7280); }

.cart-card { margin: 1rem 0; }
.cart-table { width: 100%; border-collapse: collapse; }
.cart-table th { text-align: left; font-weight: 600; padding: 0.25rem 0.5rem 0.25rem 0; }
.cart-table td { padding: 0.35rem 0.5rem 0.35rem 0; vertical-align: middle; }
.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
</style>
