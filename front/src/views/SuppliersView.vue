<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { suppliersApi } from '../api/resources';
</script>

<template>
  <ResourceManager
    title="Suppliers"
    :api="suppliersApi"
    id-key="supId"
    :columns="[
      { field: 'supId', header: 'ID' },
      { field: 'supName', header: 'Name' },
      { field: 'phone', header: 'Phone' },
      { field: 'address', header: 'Address' },
    ]"
    :fields="[
      { name: 'supName', label: 'Supplier name', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
    ]"
    :can-write="true"
  />
</template>
