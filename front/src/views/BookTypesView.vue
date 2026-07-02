<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { bookTypesApi } from '../api/resources';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>

<template>
  <ResourceManager
    title="ປະເພດປຶ້ມ"
    :api="bookTypesApi"
    id-key="typeId"
    :columns="[
      { field: 'typeId', header: 'ລະຫັດ' },
      { field: 'typeName', header: 'ຊື່' },
    ]"
    :fields="[{ name: 'typeName', label: 'ຊື່ປະເພດ', type: 'text' }]"
    :can-write="auth.isAdmin"
  />
</template>
