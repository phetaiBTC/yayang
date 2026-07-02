<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { categoriesApi } from '../api/resources';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>

<template>
  <ResourceManager
    title="ໝວດໝູ່"
    :api="categoriesApi"
    id-key="catId"
    :columns="[
      { field: 'catId', header: 'ລະຫັດ' },
      { field: 'catName', header: 'ຊື່' },
    ]"
    :fields="[{ name: 'catName', label: 'ຊື່ໝວດໝູ່', type: 'text' }]"
    :can-write="auth.isAdmin"
  />
</template>
