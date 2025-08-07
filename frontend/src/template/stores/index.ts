import { createPinia } from 'pinia';

export default createPinia();

// Export stores for easy access
export { useThemeStore } from './theme-store';
export { useSettingsStore } from './settings-store';
