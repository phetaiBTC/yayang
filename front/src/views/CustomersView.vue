<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { customersApi } from '../api/resources';
</script>

<template>
  <ResourceManager
    title="Customers"
    :api="customersApi"
    id-key="cusId"
    :columns="[
      { field: 'cusId', header: 'ID' },
      { field: 'name', header: 'Name' },
      { field: 'phone', header: 'Phone' },
      { field: 'otpVerified', header: 'OTP Verified' },
    ]"
    :fields="[
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
    ]"
    :can-write="true"
  />
</template>
