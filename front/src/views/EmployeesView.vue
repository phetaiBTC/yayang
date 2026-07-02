<script setup lang="ts">
import ResourceManager from '../components/ResourceManager.vue';
import { employeesApi } from '../api/resources';
import type { FieldDef } from '../components/CrudDialog.vue';

const fields: FieldDef[] = [
  { name: 'name', label: 'ຊື່', type: 'text' },
  { name: 'phone', label: 'ເບີໂທ', type: 'text' },
  { name: 'username', label: 'ຊື່ຜູ້ໃຊ້', type: 'text' },
  { name: 'password', label: 'ລະຫັດຜ່ານ', type: 'password', hint: 'ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ. ປະໄວ້ຫວ່າງເມື່ອແກ້ໄຂເພື່ອຮັກສາລະຫັດເດີມ.' },
  {
    name: 'role',
    label: 'ສິດ',
    type: 'select',
    options: [
      { label: 'ຜູ້ດູແລ', value: 'admin' },
      { label: 'ພະນັກງານ', value: 'staff' },
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
    title="ພະນັກງານ"
    :api="employeesApi"
    id-key="empId"
    :columns="[
      { field: 'empId', header: 'ລະຫັດ' },
      { field: 'name', header: 'ຊື່' },
      { field: 'username', header: 'ຊື່ຜູ້ໃຊ້' },
      { field: 'phone', header: 'ເບີໂທ' },
      { field: 'role', header: 'ສິດ' },
    ]"
    :fields="fields"
    :to-form="toForm"
    :can-write="true"
  />
</template>
