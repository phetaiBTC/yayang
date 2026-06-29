<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { categoriesApi } from '../api/resources';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>

<template>
  <ResourceManager
    title="Categories"
    :api="categoriesApi"
    id-key="catId"
    :columns="[
      { field: 'catId', header: 'ID' },
      { field: 'catName', header: 'Name' },
    ]"
    :fields="[{ name: 'catName', label: 'Category name', type: 'text' }]"
    :can-write="auth.isAdmin"
  />
</template>
