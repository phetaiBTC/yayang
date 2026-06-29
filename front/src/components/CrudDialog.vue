<script setup lang="ts">
import { reactive, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Password from 'primevue/password';
import Select from 'primevue/select';
import Button from 'primevue/button';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'select';
  options?: { label: string; value: any }[];
  hint?: string;
}

const props = defineProps<{
  visible: boolean;
  title: string;
  fields: FieldDef[];
  modelValue: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', value: Record<string, any>): void;
}>();

const form = reactive<Record<string, any>>({});

// Reset the form from the incoming model each time the dialog opens.
watch(
  () => props.visible,
  (open) => {
    if (open) {
      Object.keys(form).forEach((k) => delete form[k]);
      Object.assign(form, props.modelValue);
    }
  },
);

function save() {
  // Drop empty/undefined values so optional fields (e.g. unchanged password)
  // are omitted rather than sent as empty strings.
  const clean = Object.fromEntries(
    Object.entries(form).filter(([, v]) => v !== '' && v !== null && v !== undefined),
  );
  emit('save', clean);
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="title"
    modal
    :style="{ width: '440px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-3 pt-2">
      <div v-for="f in fields" :key="f.name" class="flex flex-column gap-1">
        <label :for="f.name" class="font-medium">{{ f.label }}</label>
        <InputText v-if="f.type === 'text'" :id="f.name" v-model="form[f.name]" />
        <Password
          v-else-if="f.type === 'password'"
          :id="f.name"
          v-model="form[f.name]"
          :feedback="false"
          toggleMask
          fluid
        />
        <InputNumber
          v-else-if="f.type === 'number'"
          :id="f.name"
          v-model="form[f.name]"
          :minFractionDigits="0"
          :maxFractionDigits="2"
          fluid
        />
        <Select
          v-else-if="f.type === 'select'"
          :id="f.name"
          v-model="form[f.name]"
          :options="f.options"
          optionLabel="label"
          optionValue="value"
          placeholder="Select…"
        />
        <small v-if="f.hint" class="text-color-secondary">{{ f.hint }}</small>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" text @click="emit('update:visible', false)" />
      <Button label="Save" icon="pi pi-check" @click="save" />
    </template>
  </Dialog>
</template>
