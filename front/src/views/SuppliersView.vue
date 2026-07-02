<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { suppliersApi } from '../api/resources';
</script>

<template>
  <ResourceManager
    title="ຜູ້ສະໜອງ"
    :api="suppliersApi"
    id-key="supId"
    :columns="[
      { field: 'supId', header: 'ລະຫັດ' },
      { field: 'supName', header: 'ຊື່' },
      { field: 'phone', header: 'ເບີໂທ' },
      { field: 'address', header: 'ທີ່ຢູ່' },
    ]"
    :fields="[
      { name: 'supName', label: 'ຊື່ຜູ້ສະໜອງ', type: 'text' },
      { name: 'phone', label: 'ເບີໂທ', type: 'text' },
      { name: 'address', label: 'ທີ່ຢູ່', type: 'text' },
    ]"
    :can-write="true"
  />
</template>
