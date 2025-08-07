<template>
  <q-item clickable v-ripple :to="link" exact>
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '/',
  icon: '',
});
</script>

<style scoped>
.q-item {
  border-radius: var(--border-radius-small, 8px);
  margin: 2px 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--on-surface, #1e293b);
}

.q-item:hover {
  background: var(--surface-variant, #f1f5f9);
}

.q-item.q-router-link-active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.q-item .q-item__label {
  color: inherit;
}

.q-item .q-item__label--caption {
  color: var(--on-surface-variant, #64748b);
  opacity: 0.8;
}

.q-item.q-router-link-active .q-item__label--caption {
  color: rgba(255, 255, 255, 0.8);
}

.q-item .q-icon {
  color: inherit;
}

/* Dark mode adjustments */
.body--dark .q-item {
  color: var(--on-surface, #f1f5f9);
}

.body--dark .q-item:hover {
  background: var(--surface-variant, #334155);
}

.body--dark .q-item .q-item__label--caption {
  color: var(--on-surface-variant, #cbd5e1);
}

.body--dark .q-item.q-router-link-active .q-item__label--caption {
  color: rgba(255, 255, 255, 0.8);
}
</style>
