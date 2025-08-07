import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

export interface AppSettings {
  language: string;
  theme: string;
  devMode: boolean;
  notifications: boolean;
  autoSave: boolean;
  compactMode: boolean;
}

export const useSettingsStore = defineStore("settings", () => {
  const { locale } = useI18n();

  // Default settings
  const defaultSettings: AppSettings = {
    language: "en-US",
    theme: "luxury-light",
    devMode: false,
    notifications: true,
    autoSave: true,
    compactMode: false
  };

  // Current settings
  const settings = ref<AppSettings>({ ...defaultSettings });

  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("app-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        settings.value = { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem("app-settings", JSON.stringify(settings.value));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  // Update setting
  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    settings.value[key] = value;
    saveSettings();

    // Handle special cases
    if (key === "language") {
      locale.value = value as string;
    }
  };

  // Reset settings to default
  const resetSettings = () => {
    settings.value = { ...defaultSettings };
    saveSettings();
  };

  // Toggle dev mode
  const toggleDevMode = () => {
    updateSetting("devMode", !settings.value.devMode);
  };

  // Export settings
  const exportSettings = (): string => {
    return JSON.stringify(settings.value, null, 2);
  };

  // Import settings
  const importSettings = (settingsJson: string): boolean => {
    try {
      const imported = JSON.parse(settingsJson);
      if (imported && typeof imported === "object") {
        settings.value = { ...defaultSettings, ...imported };
        saveSettings();
        return true;
      }
    } catch (error) {
      console.error("Failed to import settings:", error);
    }
    return false;
  };

  // Computed properties
  const isDevMode = computed(() => settings.value.devMode);
  const currentLanguage = computed(() => settings.value.language);
  const currentTheme = computed(() => settings.value.theme);

  // Initialize
  const initialize = () => {
    loadSettings();
    locale.value = settings.value.language;
  };

  return {
    settings,
    isDevMode,
    currentLanguage,
    currentTheme,
    updateSetting,
    toggleDevMode,
    resetSettings,
    exportSettings,
    importSettings,
    initialize
  };
});
