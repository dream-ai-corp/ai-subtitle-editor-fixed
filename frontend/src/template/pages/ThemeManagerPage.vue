<template>
  <q-page class="q-pa-xl">
    <div class="row q-col-gutter-xl">
      <!-- Header -->
      <div class="col-12">
        <div class="text-h2 text-premium q-mb-md font-weight-bold animate-fade-in-up">
          {{ $t('themes.manager') }}
        </div>
        <div class="text-body1 text-grey-6 q-mb-xl animate-fade-in-up" style="animation-delay: 0.1s;">
          Customize themes with advanced color controls and create your own unique designs
        </div>
      </div>

      <!-- Theme List -->
      <div class="col-12 col-md-4 animate-fade-in-up" style="animation-delay: 0.2s;">
        <q-card class="premium-card">
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-lg">
              <q-icon name="palette" size="1.5rem" color="primary" class="q-mr-md" />
              <div class="text-h6 font-weight-bold">{{ $t('themes.available') }}</div>
            </div>

            <div class="q-mb-md">
              <q-btn class="premium-btn full-width" :label="$t('themes.addNew')" @click="showAddThemeDialog = true"
                icon="add" no-caps />
            </div>

            <q-list separator>
              <q-item v-for="theme in themes" :key="theme.id" clickable @click="selectTheme(theme)"
                :class="{ 'theme-item-active': selectedTheme?.id === theme.id }" class="theme-item">
                <q-item-section avatar>
                  <q-icon :name="theme.isDark ? 'dark_mode' : 'light_mode'"
                    :color="theme.isDark ? 'grey-4' : 'amber'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ theme.name }}</q-item-label>
                  <q-item-label caption>{{ theme.isDark ? 'Dark' : 'Light' }} Theme</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round icon="more_vert" @click.stop="showThemeMenu(theme, $event)">
                    <q-menu>
                      <q-list style="min-width: 9.375rem">
                        <q-item clickable @click="duplicateTheme(theme)">
                          <q-item-section avatar>
                            <q-icon name="content_copy" />
                          </q-item-section>
                          <q-item-section>{{ $t('common.duplicate') }}</q-item-section>
                        </q-item>
                        <q-item clickable @click="exportTheme(theme)">
                          <q-item-section avatar>
                            <q-icon name="download" />
                          </q-item-section>
                          <q-item-section>{{ $t('common.export') }}</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable @click="deleteTheme(theme)" class="text-negative">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section>{{ $t('common.delete') }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Theme Editor -->
      <div class="col-12 col-md-8 animate-fade-in-up" style="animation-delay: 0.3s;">
        <q-card class="premium-card" v-if="selectedTheme">
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-lg">
              <q-icon name="edit" size="1.5rem" color="secondary" class="q-mr-md" />
              <div class="text-h6 font-weight-bold">{{ $t('themes.editor') }}</div>
            </div>

            <!-- Theme Basic Info -->
            <div class="theme-section">
              <div class="row q-col-gutter-md q-mb-lg">
                <div class="col-12 col-md-6">
                  <q-input v-model="selectedTheme.name" :label="$t('themes.name')" outlined dense
                    @update:model-value="updateTheme" />
                </div>
                <div class="col-12 col-md-6">
                  <q-toggle v-model="selectedTheme.isDark" :label="selectedTheme.isDark ? 'Dark' : 'Light'"
                    @update:model-value="updateTheme" color="primary" />
                </div>
              </div>
            </div>

            <!-- Color Palette -->
            <div class="theme-section">
              <div class="text-subtitle1 font-weight-medium q-mb-md">{{ $t('themes.colors') }}</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6" v-for="(color, key) in selectedTheme.colors" :key="key">
                  <div class="color-picker-item">
                    <div class="color-picker-row">
                      <div class="color-picker-label">{{ key }}</div>
                      <div class="color-preview" :style="{ backgroundColor: color }" @click="toggleColorPicker(key)">
                        <q-icon name="colorize" size="0.875rem" color="white" v-if="isLightColor(color)" />
                        <q-icon name="colorize" size="0.875rem" color="black" v-else />
                      </div>
                      <q-input v-model="selectedTheme.colors[key]" @update:model-value="updateTheme" dense outlined
                        class="color-input" />
                      <q-btn flat round size="sm" icon="colorize" @click="toggleColorPicker(key)"
                        :color="openColorPickers[key] ? 'primary' : 'grey'" />
                    </div>
                    <q-color v-model="selectedTheme.colors[key]" @update:model-value="updateTheme"
                      v-show="openColorPickers[key]" class="color-picker-popup" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom Properties -->
            <div class="theme-section">
              <div class="text-subtitle1 font-weight-medium q-mb-md">{{ $t('themes.customProperties') }}</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6" v-for="(value, key) in selectedTheme.custom" :key="key">
                  <div class="row items-center q-mb-sm">
                    <div class="col-8">
                      <div class="text-caption text-grey-6">{{ key }}</div>
                    </div>
                    <div class="col-4">
                      <q-input :model-value="selectedTheme.custom?.[key] || ''"
                        @update:model-value="(val) => updateCustomProperty(key, val)" :label="key" dense outlined />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="theme-section">
              <div class="row q-col-gutter-sm q-mt-lg">
                <div class="col-auto">
                  <q-btn class="premium-btn" :label="$t('common.save')" @click="saveTheme" no-caps />
                </div>
                <div class="col-auto">
                  <q-btn outline :label="$t('common.reset')" @click="resetTheme" no-caps />
                </div>
                <div class="col-auto">
                  <q-btn outline :label="$t('common.preview')" @click="previewTheme" no-caps />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- No Theme Selected -->
        <q-card class="premium-card" v-else>
          <q-card-section class="q-pa-xl text-center">
            <q-icon name="palette" size="4rem" color="grey-4" class="q-mb-md" />
            <div class="text-h6 text-grey-6">{{ $t('themes.selectTheme') }}</div>
            <div class="text-body2 text-grey-5 q-mt-sm">{{ $t('themes.selectThemeDesc') }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Add Theme Dialog -->
    <q-dialog v-model="showAddThemeDialog">
      <q-card class="premium-card" style="min-width: 25rem">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 q-mb-md">{{ $t('themes.addNew') }}</div>
          <q-input v-model="newThemeName" :label="$t('themes.name')" autofocus outlined />
          <div class="q-mt-md">
            <q-toggle v-model="newThemeIsDark" :label="newThemeIsDark ? 'Dark' : 'Light'" color="primary" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat :label="$t('common.cancel')" color="grey" v-close-popup />
          <q-btn class="premium-btn" :label="$t('common.add')" @click="addNewTheme" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '../stores/theme-store';
import { useSettingsStore } from '../stores/settings-store';
import type { Theme } from '../stores/theme-store';

const $q = useQuasar();
const { t } = useI18n();

const themeStore = useThemeStore();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const settingsStore = useSettingsStore();

// Reactive data
const selectedTheme = ref<Theme | null>(null);
const showAddThemeDialog = ref(false);
const newThemeName = ref('');
const newThemeIsDark = ref(false);
const originalTheme = ref<Theme | null>(null);
const openColorPickers = ref<Record<string, boolean>>({});

// Computed properties
const themes = computed(() => themeStore.themes);

// Methods
const selectTheme = (theme: Theme) => {
  selectedTheme.value = JSON.parse(JSON.stringify(theme)); // Deep clone
  originalTheme.value = JSON.parse(JSON.stringify(theme)); // Keep original for reset
  // Reset color picker states
  openColorPickers.value = {};
};

const updateTheme = () => {
  if (selectedTheme.value) {
    // Update the theme in the store
    const index = themeStore.themes.findIndex(t => t.id === selectedTheme.value!.id);
    if (index !== -1) {
      if (selectedTheme.value) {
        themeStore.updateTheme(selectedTheme.value);
      }
    }
  }
};

const updateCustomProperty = (key: string, value: string | number | null) => {
  if (selectedTheme.value) {
    if (!selectedTheme.value.custom) {
      selectedTheme.value.custom = {};
    }
    selectedTheme.value.custom[key] = value?.toString() || '';
    updateTheme();
  }
};

const toggleColorPicker = (colorKey: string) => {
  openColorPickers.value[colorKey] = !openColorPickers.value[colorKey];
};

const isLightColor = (color: string): boolean => {
  // Simple heuristic to determine if color is light
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

const saveTheme = () => {
  if (selectedTheme.value) {
    try {
      themeStore.updateTheme(selectedTheme.value);
      $q.notify({
        type: 'positive',
        message: t('themes.themeSaved'),
        position: 'top-right',
        timeout: 2000
      });
    } catch (error) {
      console.error('Failed to save theme:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to save theme',
        position: 'top-right',
        timeout: 3000
      });
    }
  }
};

const resetTheme = () => {
  if (originalTheme.value) {
    selectedTheme.value = JSON.parse(JSON.stringify(originalTheme.value));
    updateTheme();
    $q.notify({
      type: 'positive',
      message: t('themes.themeReset'),
      position: 'top-right',
      timeout: 2000
    });
  }
};

const previewTheme = () => {
  if (selectedTheme.value) {
    themeStore.setTheme(selectedTheme.value.id);
    $q.notify({
      type: 'positive',
      message: t('themes.themePreviewed'),
      position: 'top-right',
      timeout: 2000
    });
  }
};

const addNewTheme = () => {
  if (newThemeName.value.trim()) {
    try {
      const newTheme = themeStore.createTheme(newThemeName.value, newThemeIsDark.value);
      selectTheme(newTheme);
      newThemeName.value = '';
      newThemeIsDark.value = false;
      $q.notify({
        type: 'positive',
        message: t('themes.themeAdded'),
        position: 'top-right',
        timeout: 2000
      });
    } catch (error) {
      console.error('Failed to add theme:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to add theme',
        position: 'top-right',
        timeout: 3000
      });
    }
  }
};

const duplicateTheme = (theme: Theme) => {
  try {
    const duplicatedTheme = themeStore.duplicateTheme(theme);
    selectTheme(duplicatedTheme);
    $q.notify({
      type: 'positive',
      message: t('themes.themeDuplicated'),
      position: 'top-right',
      timeout: 2000
    });
  } catch (error) {
    console.error('Failed to duplicate theme:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to duplicate theme',
      position: 'top-right',
      timeout: 3000
    });
  }
};

const exportTheme = (theme: Theme) => {
  try {
    const themeJson = themeStore.exportTheme(theme.id);
    void navigator.clipboard.writeText(themeJson);
    $q.notify({
      type: 'positive',
      message: t('themes.themeExported'),
      position: 'top-right',
      timeout: 2000
    });
  } catch (error) {
    console.error('Failed to export theme:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to export theme',
      position: 'top-right',
      timeout: 3000
    });
  }
};

const deleteTheme = (theme: Theme) => {
  $q.dialog({
    title: t('themes.confirmDelete'),
    message: `${t('themes.confirmDeleteMessage')} "${theme.name}"?`,
    cancel: true,
    persistent: true,
    ok: {
      label: t('common.delete'),
      color: 'negative'
    }
  }).onOk(() => {
    try {
      themeStore.removeTheme(theme.id);
      if (selectedTheme.value?.id === theme.id) {
        selectedTheme.value = null;
        originalTheme.value = null;
      }
      $q.notify({
        type: 'positive',
        message: t('themes.themeDeleted'),
        position: 'top-right',
        timeout: 2000
      });
    } catch (error) {
      console.error('Failed to delete theme:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to delete theme',
        position: 'top-right',
        timeout: 3000
      });
    }
  });
};

const showThemeMenu = (theme: Theme, event: Event) => {
  event.stopPropagation();
  selectTheme(theme);
};

// Initialize
onMounted(() => {
  if (themes.value.length > 0 && themes.value[0]) {
    selectTheme(themes.value[0]);
  }
});
</script>

<style scoped>
/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(1.25rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}

/* Theme item styling */
.theme-item {
  border-radius: var(--border-radius-small, 0.75rem);
  margin: 0.25rem 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-item:hover {
  background: var(--surface-variant, #f8fafc);
  transform: translateX(0.25rem);
}

.theme-item-active {
  background: var(--gradient-luxury);
  color: white;
  box-shadow: var(--shadow-md);
}

.theme-item-active .q-item__label--caption {
  color: rgba(255, 255, 255, 0.8);
}

/* Theme section styling */
.theme-section {
  margin-bottom: 2rem;
}

.theme-section:last-child {
  margin-bottom: 0;
}

/* Color picker styling */
.color-picker-item {
  margin-bottom: 1rem;
  position: relative;
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.color-picker-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--on-surface-variant, #64748b);
  flex-shrink: 0;
  min-width: 4rem;
}

.color-preview {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid var(--outline, #e2e8f0);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.color-preview:hover {
  border-color: var(--primary, #1e293b);
  transform: scale(1.05);
}

.color-input {
  flex-grow: 1;
  margin-bottom: 0;
}

.color-picker-popup {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--outline, #e2e8f0);
  margin-top: 0.25rem;
}

/* Dark mode adjustments */
.body--dark .theme-item:hover {
  background: var(--surface-variant, #334155);
}

.body--dark .theme-item-active {
  background: var(--gradient-luxury);
}

.body--dark .color-preview {
  border-color: var(--outline, #475569);
}

.body--dark .color-picker-popup {
  border-color: var(--outline, #475569);
}

/* Responsive adjustments */
@media (max-width: 48rem) {
  .text-h2 {
    font-size: 1.75rem;
  }

  .q-pa-xl {
    padding: 1rem !important;
  }

  .color-picker-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .color-picker-label {
    min-width: auto;
  }

  .color-input {
    width: 100%;
  }

  .color-preview {
    align-self: flex-start;
  }
}

/* Mobile optimizations */
@media (max-width: 36rem) {
  .q-col-gutter-xl {
    margin: -0.5rem;
  }

  .q-col-gutter-xl>div {
    padding: 0.5rem;
  }

  .color-picker-item {
    margin-bottom: 1.5rem;
  }

  .color-picker-row {
    gap: 0.375rem;
  }

  .color-picker-label {
    font-size: 0.8125rem;
  }

  .color-preview {
    width: 2.25rem;
    height: 2.25rem;
  }
}
</style>