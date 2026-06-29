<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ResourceManager from '../components/ResourceManager.vue';
import { booksApi, categoriesApi, bookTypesApi } from '../api/resources';
import type { FieldDef } from '../components/CrudDialog.vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const fields = ref<FieldDef[]>([]);

// Build the form's category/type dropdowns from live lookup data.
onMounted(async () => {
  const [cats, types] = await Promise.all([categoriesApi.list(), bookTypesApi.list()]);
  fields.value = [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'price', label: 'Price', type: 'number' },
    {
      name: 'catId',
      label: 'Category',
      type: 'select',
      options: cats.map((c: any) => ({ label: c.catName, value: c.catId })),
    },
    {
      name: 'typeId',
      label: 'Book Type',
      type: 'select',
      options: types.map((t: any) => ({ label: t.typeName, value: t.typeId })),
    },
  ];
});

// Flatten populated relations into the flat DTO shape the API expects.
function toForm(row: any) {
  return {
    title: row.title,
    price: Number(row.price),
    catId: row.category?.catId,
    typeId: row.bookType?.typeId,
  };
}
</script>

<template>
  <ResourceManager
    title="Books"
    :api="booksApi"
    id-key="bookId"
    :columns="[
      { field: 'bookId', header: 'ID' },
      { field: 'title', header: 'Title' },
      { field: 'category.catName', header: 'Category' },
      { field: 'bookType.typeName', header: 'Type' },
      { field: 'price', header: 'Price' },
      { field: 'stock', header: 'Stock' },
    ]"
    :fields="fields"
    :to-form="toForm"
    :can-write="auth.isAdmin"
  />
</template>
