<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { customersApi } from '../api/resources';
</script>

<template>
  <ResourceManager
    title="ລູກຄ້າ"
    :api="customersApi"
    id-key="cusId"
    :columns="[
      { field: 'cusId', header: 'ລະຫັດ' },
      { field: 'name', header: 'ຊື່' },
      { field: 'phone', header: 'ເບີໂທ' },
      { field: 'otpVerified', header: 'ຢືນຢັນ OTP' },
    ]"
    :fields="[
      { name: 'name', label: 'ຊື່', type: 'text' },
      { name: 'phone', label: 'ເບີໂທ', type: 'text' },
    ]"
    :can-write="true"
  />
</template>
