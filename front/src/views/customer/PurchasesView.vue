<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import { getMyPurchases, getReceipt, type MyPurchase, type SaleReceipt } from '../../api/customer';
import { SHOP_NAME, paymentLabel, fmtDate, errorDetail } from './shared';

const toast = useToast();

const purchases = ref<MyPurchase[]>([]);
const loadingBuy = ref(false);

async function loadPurchases() {
  loadingBuy.value = true;
  try {
    purchases.value = await getMyPurchases();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ໂຫຼດປະຫວັດການຊື້ບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    loadingBuy.value = false;
  }
}

// --- Receipt / bill ---
const receiptVisible = ref(false);
const receipt = ref<SaleReceipt | null>(null);
const loadingReceipt = ref(false);
const receiptTotal = computed(() =>
  (receipt.value?.details ?? []).reduce((s, l) => s + l.qty * Number(l.price), 0),
);

async function openReceipt(saleId: number) {
  loadingReceipt.value = true;
  receiptVisible.value = true;
  receipt.value = null;
  try {
    receipt.value = await getReceipt(saleId);
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ໂຫຼດໃບບິນບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
    receiptVisible.value = false;
  } finally {
    loadingReceipt.value = false;
  }
}

function printReceipt() {
  const r = receipt.value;
  if (!r) return;
  const rows = r.details
    .map(
      (l) =>
        `<tr><td>${l.book?.title ?? ''}</td><td class="c">${l.qty}</td>` +
        `<td class="r">${Number(l.price).toFixed(2)}</td>` +
        `<td class="r">${(l.qty * Number(l.price)).toFixed(2)}</td></tr>`,
    )
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>ໃບບິນ #${r.saleId}</title>
    <style>
      body{font-family:'Noto Sans Lao','Phetsarath OT',sans-serif;padding:24px;color:#111}
      h1{font-size:18px;margin:0 0 4px}
      .muted{color:#666;font-size:13px}
      table{width:100%;border-collapse:collapse;margin-top:16px;font-size:14px}
      th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:left}
      .c{text-align:center}.r{text-align:right}
      tfoot td{font-weight:700;border-top:2px solid #333;border-bottom:none}
    </style></head><body>
    <h1>${SHOP_NAME}</h1>
    <div class="muted">ໃບບິນການຊື້ / Receipt</div>
    <div class="muted">ເລກທີ: ${r.saleId} · ${new Date(r.saleDate).toLocaleString()}</div>
    <div class="muted">ລູກຄ້າ: ${r.customer?.name ?? ''} · ການຊຳລະ: ${paymentLabel(r.paymentMethod)}</div>
    <table>
      <thead><tr><th>ປຶ້ມ</th><th class="c">ຈຳນວນ</th><th class="r">ລາຄາ</th><th class="r">ລວມຍ່ອຍ</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="3" class="r">ລວມທັງໝົດ</td><td class="r">${receiptTotal.value.toFixed(2)}</td></tr></tfoot>
    </table>
    <p class="muted" style="margin-top:24px">ຂອບໃຈທີ່ໃຊ້ບໍລິການ 🙏</p>
    </body></html>`;
  const w = window.open('', '_blank', 'width=420,height=640');
  if (!w) {
    toast.add({ severity: 'warn', summary: 'ບໍ່ສາມາດເປີດໜ້າຕ່າງພິມ (ຖືກບລັອກ popup)', life: 4000 });
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

onMounted(loadPurchases);
</script>

<template>
  <div>
    <h2 class="mt-0">ປະຫວັດການຊື້</h2>
    <DataTable :value="purchases" :loading="loadingBuy" dataKey="saleId" paginator :rows="10" stripedRows>
      <Column field="saleId" header="ເລກທີ" sortable />
      <Column field="saleDate" header="ວັນທີ" sortable>
        <template #body="{ data }">{{ fmtDate(data.saleDate) }}</template>
      </Column>
      <Column field="paymentMethod" header="ການຊຳລະ" sortable>
        <template #body="{ data }">{{ paymentLabel(data.paymentMethod) }}</template>
      </Column>
      <Column field="lineCount" header="ລາຍການ" sortable />
      <Column field="total" header="ລວມ" sortable />
      <Column header="ໃບບິນ" :style="{ width: '8rem' }">
        <template #body="{ data }">
          <Button label="ໃບບິນ" icon="pi pi-receipt" size="small" text @click="openReceipt(data.saleId)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="receiptVisible" modal header="ໃບບິນການຊື້" :style="{ width: '420px' }">
      <div v-if="loadingReceipt" class="text-color-secondary">ກຳລັງໂຫຼດ…</div>
      <div v-else-if="receipt" class="receipt">
        <div class="receipt-shop">{{ SHOP_NAME }}</div>
        <div class="receipt-meta">ເລກທີ: {{ receipt.saleId }} · {{ fmtDate(receipt.saleDate) }}</div>
        <div class="receipt-meta">ລູກຄ້າ: {{ receipt.customer?.name }} · ການຊຳລະ: {{ paymentLabel(receipt.paymentMethod) }}</div>
        <table class="receipt-table">
          <thead>
            <tr><th>ປຶ້ມ</th><th class="c">ຈຳນວນ</th><th class="r">ລາຄາ</th><th class="r">ລວມຍ່ອຍ</th></tr>
          </thead>
          <tbody>
            <tr v-for="(l, i) in receipt.details" :key="i">
              <td>{{ l.book?.title }}</td>
              <td class="c">{{ l.qty }}</td>
              <td class="r">{{ Number(l.price).toFixed(2) }}</td>
              <td class="r">{{ (l.qty * Number(l.price)).toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td colspan="3" class="r">ລວມທັງໝົດ</td><td class="r">{{ receiptTotal.toFixed(2) }}</td></tr>
          </tfoot>
        </table>
      </div>
      <template #footer>
        <Button label="ປິດ" text @click="receiptVisible = false" />
        <Button label="ພິມ" icon="pi pi-print" :disabled="!receipt" @click="printReceipt" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.receipt-shop {
  font-weight: 700;
  font-size: 1.1rem;
}
.receipt-meta {
  color: var(--p-text-muted-color, #6b7280);
  font-size: 0.85rem;
}
.receipt-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}
.receipt-table th,
.receipt-table td {
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid var(--p-content-border-color, #e5e7eb);
  text-align: left;
}
.receipt-table .c { text-align: center; }
.receipt-table .r { text-align: right; }
.receipt-table tfoot td {
  font-weight: 700;
  border-top: 2px solid var(--p-content-border-color, #333);
  border-bottom: none;
}
</style>
