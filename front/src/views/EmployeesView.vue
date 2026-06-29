<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { employeesApi } from '../api/resources';
import type { FieldDef } from '../components/CrudDialog.vue';

const fields: FieldDef[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'username', label: 'Username', type: 'text' },
  { name: 'password', label: 'Password', type: 'password', hint: 'Min 6 chars. Leave blank when editing to keep current.' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Staff', value: 'staff' },
    ],
  },
];

// Never pre-fill the password when editing.
function toForm(row: any) {
  return { name: row.name, phone: row.phone, username: row.username, role: row.role };
}
</script>

<template>
  <ResourceManager
    title="Employees"
    :api="employeesApi"
    id-key="empId"
    :columns="[
      { field: 'empId', header: 'ID' },
      { field: 'name', header: 'Name' },
      { field: 'username', header: 'Username' },
      { field: 'phone', header: 'Phone' },
      { field: 'role', header: 'Role' },
    ]"
    :fields="fields"
    :to-form="toForm"
    :can-write="true"
  />
</template>
