<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { bookTypesApi } from '../api/resources';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>

<template>
  <ResourceManager
    title="Book Types"
    :api="bookTypesApi"
    id-key="typeId"
    :columns="[
      { field: 'typeId', header: 'ID' },
      { field: 'typeName', header: 'Name' },
    ]"
    :fields="[{ name: 'typeName', label: 'Type name', type: 'text' }]"
    :can-write="auth.isAdmin"
  />
</template>
