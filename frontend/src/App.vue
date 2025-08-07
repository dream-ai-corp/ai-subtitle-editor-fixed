<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useThemeStore } from './template/stores/theme-store';
import { useSettingsStore } from './template/stores/settings-store';
import { useAuthStore } from './template/stores/auth-store';

// Initialize stores (they auto-register when imported)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _themeStore = useThemeStore();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _settingsStore = useSettingsStore();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _authStore = useAuthStore();

onMounted(async () => {
  // Initialize auth store
  await _authStore.initializeAuth();
  console.log('App mounted - stores initialized');

  // Check if exploration mode is enabled
  const explorationMode = localStorage.getItem('exploration_mode')
  if (explorationMode === 'true') {
    console.log('Exploration mode enabled - bypassing authentication checks')
    // Set a global flag to bypass auth checks
    window.__EXPLORATION_MODE__ = true
  }
});
</script>
