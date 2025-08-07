<template>
    <q-page class="q-pa-xl">
        <div class="row q-col-gutter-xl">
            <!-- Settings Header -->
            <div class="col-12">
                <div class="text-h2 text-premium q-mb-md font-weight-bold animate-fade-in-up">
                    {{ $t('settings.title') }}
                </div>
                <div class="text-body1 text-grey-6 q-mb-xl animate-fade-in-up" style="animation-delay: 0.1s;">
                    Customize your subtitle editing experience with advanced settings and preferences
                </div>
            </div>

            <!-- Language Settings -->
            <div class="col-12 col-md-6 animate-fade-in-up" style="animation-delay: 0.2s;">
                <q-card class="premium-card">
                    <q-card-section class="q-pa-lg">
                        <div class="row items-center q-mb-md">
                            <q-icon name="translate" size="24px" color="primary" class="q-mr-md" />
                            <div class="text-h6 font-weight-bold">{{ $t('settings.language') }}</div>
                        </div>
                        <q-select v-model="currentLanguage" :options="languageOptions" option-label="label"
                            option-value="value" emit-value map-options @update:model-value="updateLanguage"
                            class="q-mt-md" data-cy="language-select" outlined dense />
                    </q-card-section>
                </q-card>
            </div>

            <!-- Theme Settings -->
            <div class="col-12 col-md-6 animate-fade-in-up" style="animation-delay: 0.3s;">
                <q-card class="premium-card">
                    <q-card-section class="q-pa-lg">
                        <div class="row items-center q-mb-md">
                            <q-icon name="palette" size="24px" color="secondary" class="q-mr-md" />
                            <div class="text-h6 font-weight-bold">{{ $t('settings.theme') }}</div>
                        </div>
                        <q-select v-model="currentTheme" :options="themeOptions" option-label="name" option-value="id"
                            emit-value map-options @update:model-value="updateTheme" class="q-mt-md"
                            data-cy="theme-select" outlined dense />
                    </q-card-section>
                </q-card>
            </div>

            <!-- Development Mode -->
            <div class="col-12 col-md-6 animate-fade-in-up" style="animation-delay: 0.4s;">
                <q-card class="premium-card">
                    <q-card-section class="q-pa-lg">
                        <div class="row items-center q-mb-md">
                            <q-icon name="bug_report" size="24px" color="warning" class="q-mr-md" />
                            <div class="text-h6 font-weight-bold">{{ $t('dev.mode') }}</div>
                        </div>
                        <div class="q-mt-md">
                            <q-toggle v-model="isDevMode" :label="isDevMode ? $t('dev.enabled') : $t('dev.disabled')"
                                @update:model-value="toggleDevMode" color="warning" data-cy="dev-mode-toggle"
                                size="lg" />
                        </div>
                        <div class="text-caption q-mt-sm text-grey-6">
                            {{ $t('dev.features') }}
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <!-- Notifications -->
            <div class="col-12 col-md-6 animate-fade-in-up" style="animation-delay: 0.5s;">
                <q-card class="premium-card">
                    <q-card-section class="q-pa-lg">
                        <div class="row items-center q-mb-md">
                            <q-icon name="notifications" size="24px" color="info" class="q-mr-md" />
                            <div class="text-h6 font-weight-bold">{{ $t('settings.notifications') }}</div>
                        </div>
                        <div class="q-mt-md">
                            <q-toggle v-model="settings.notifications"
                                :label="settings.notifications ? $t('common.yes') : $t('common.no')"
                                @update:model-value="updateNotificationSetting" color="info"
                                data-cy="notifications-toggle" size="lg" />
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <!-- Theme Management -->
            <div class="col-12 animate-fade-in-up" style="animation-delay: 0.6s;">
                <q-card class="premium-card">
                    <q-card-section class="q-pa-lg">
                        <div class="row items-center q-mb-lg">
                            <q-icon name="style" size="24px" color="accent" class="q-mr-md" />
                            <div class="text-h6 font-weight-bold">{{ $t('settings.themeManagement') }}</div>
                        </div>
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <div class="row q-col-gutter-sm">
                                    <div class="col-auto">
                                        <q-btn class="premium-btn" :label="$t('common.export')"
                                            @click="exportCurrentTheme" data-cy="export-theme" no-caps />
                                    </div>
                                    <div class="col-auto">
                                        <q-btn outline :label="$t('common.import')" @click="showImportDialog = true"
                                            data-cy="import-theme" no-caps />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <!-- Settings Management -->
            <div class="col-12 animate-fade-in-up" style="animation-delay: 0.7s;">
                <q-card class="premium-card">
                    <q-card-section class="q-pa-lg">
                        <div class="row items-center q-mb-lg">
                            <q-icon name="backup" size="24px" color="positive" class="q-mr-md" />
                            <div class="text-h6 font-weight-bold">{{ $t('settings.settingsManagement') }}</div>
                        </div>
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <div class="row q-col-gutter-sm">
                                    <div class="col-auto">
                                        <q-btn class="premium-btn" :label="$t('common.export')" @click="exportSettings"
                                            data-cy="export-settings" no-caps />
                                    </div>
                                    <div class="col-auto">
                                        <q-btn outline :label="$t('common.import')"
                                            @click="showSettingsImportDialog = true" data-cy="import-settings"
                                            no-caps />
                                    </div>
                                    <div class="col-auto">
                                        <q-btn outline color="negative" :label="$t('common.reset')"
                                            @click="resetSettings" data-cy="reset-settings" no-caps />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <!-- Import Theme Dialog -->
        <q-dialog v-model="showImportDialog">
            <q-card class="premium-card" style="min-width: 400px">
                <q-card-section class="q-pa-lg">
                    <div class="text-h6 q-mb-md">{{ $t('settings.importTheme') }}</div>
                    <q-input v-model="importThemeData" type="textarea" :label="$t('settings.pasteThemeJson')" rows="10"
                        autofocus data-cy="theme-import-input" outlined />
                </q-card-section>

                <q-card-actions align="right" class="q-pa-lg">
                    <q-btn flat :label="$t('common.cancel')" color="grey" v-close-popup />
                    <q-btn class="premium-btn" :label="$t('common.import')" @click="importTheme" v-close-popup
                        no-caps />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Import Settings Dialog -->
        <q-dialog v-model="showSettingsImportDialog">
            <q-card class="premium-card" style="min-width: 400px">
                <q-card-section class="q-pa-lg">
                    <div class="text-h6 q-mb-md">{{ $t('settings.importSettings') }}</div>
                    <q-input v-model="importSettingsData" type="textarea" :label="$t('settings.pasteSettingsJson')"
                        rows="10" autofocus data-cy="settings-import-input" outlined />
                </q-card-section>

                <q-card-actions align="right" class="q-pa-lg">
                    <q-btn flat :label="$t('common.cancel')" color="grey" v-close-popup />
                    <q-btn class="premium-btn" :label="$t('common.import')" @click="importSettings" v-close-popup
                        no-caps />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '../stores/theme-store';
import { useSettingsStore } from '../stores/settings-store';

const $q = useQuasar();
const { t } = useI18n();

const themeStore = useThemeStore();
const settingsStore = useSettingsStore();

// Reactive data
const showImportDialog = ref(false);
const showSettingsImportDialog = ref(false);
const importThemeData = ref('');
const importSettingsData = ref('');

// Computed properties
const currentLanguage = computed({
    get: () => settingsStore.currentLanguage,
    set: (value: string) => settingsStore.updateSetting('language', value)
});

const currentTheme = computed({
    get: () => settingsStore.currentTheme,
    set: (value: string) => settingsStore.updateSetting('theme', value)
});

const isDevMode = computed({
    get: () => settingsStore.isDevMode,
    set: (value: boolean) => settingsStore.updateSetting('devMode', value)
});

const settings = computed(() => settingsStore.settings);

// Language options
const languageOptions = [
    { label: 'English', value: 'en-US' },
    { label: 'Français', value: 'fr-FR' }
];

// Theme options
const themeOptions = computed(() =>
    themeStore.themes.map(theme => ({
        id: theme.id,
        name: theme.name
    }))
);

// Methods
const updateLanguage = (language: string) => {
    settingsStore.updateSetting('language', language);
    $q.notify({
        type: 'positive',
        message: t('common.success'),
        position: 'top-right',
        timeout: 2000
    });
};

const updateTheme = (themeId: string) => {
    settingsStore.updateSetting('theme', themeId);
    themeStore.setTheme(themeId);
    $q.notify({
        type: 'positive',
        message: t('common.success'),
        position: 'top-right',
        timeout: 2000
    });
};

const toggleDevMode = (enabled: boolean) => {
    settingsStore.updateSetting('devMode', enabled);
    $q.notify({
        type: enabled ? 'warning' : 'positive',
        message: enabled ? t('dev.enabled') : t('dev.disabled'),
        position: 'top-right',
        timeout: 2000
    });
};

const updateNotificationSetting = (enabled: boolean) => {
    settingsStore.updateSetting('notifications', enabled);
};

const exportCurrentTheme = () => {
    try {
        const themeJson = themeStore.exportTheme(currentTheme.value);
        void navigator.clipboard.writeText(themeJson);
        $q.notify({
            type: 'positive',
            message: t('settings.themeExported'),
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

const importTheme = () => {
    try {
        if (themeStore.importTheme(importThemeData.value)) {
            $q.notify({
                type: 'positive',
                message: t('settings.themeImported'),
                position: 'top-right',
                timeout: 2000
            });
            importThemeData.value = '';
        } else {
            $q.notify({
                type: 'negative',
                message: t('settings.themeImportFailed'),
                position: 'top-right',
                timeout: 3000
            });
        }
    } catch (error) {
        console.error('Failed to import theme:', error);
        $q.notify({
            type: 'negative',
            message: t('settings.themeImportFailed'),
            position: 'top-right',
            timeout: 3000
        });
    }
};

const exportSettings = () => {
    try {
        const settingsJson = settingsStore.exportSettings();
        void navigator.clipboard.writeText(settingsJson);
        $q.notify({
            type: 'positive',
            message: t('settings.settingsExported'),
            position: 'top-right',
            timeout: 2000
        });
    } catch (error) {
        console.error('Failed to export settings:', error);
        $q.notify({
            type: 'negative',
            message: 'Failed to export settings',
            position: 'top-right',
            timeout: 3000
        });
    }
};

const importSettings = () => {
    try {
        if (settingsStore.importSettings(importSettingsData.value)) {
            $q.notify({
                type: 'positive',
                message: t('settings.settingsImported'),
                position: 'top-right',
                timeout: 2000
            });
            importSettingsData.value = '';
        } else {
            $q.notify({
                type: 'negative',
                message: t('settings.settingsImportFailed'),
                position: 'top-right',
                timeout: 3000
            });
        }
    } catch (error) {
        console.error('Failed to import settings:', error);
        $q.notify({
            type: 'negative',
            message: t('settings.settingsImportFailed'),
            position: 'top-right',
            timeout: 3000
        });
    }
};

const resetSettings = () => {
    $q.dialog({
        title: t('settings.confirmReset'),
        message: t('settings.confirmResetMessage'),
        cancel: true,
        persistent: true,
        ok: {
            label: t('common.reset'),
            color: 'negative'
        }
    }).onOk(() => {
        settingsStore.resetSettings();
        $q.notify({
            type: 'positive',
            message: t('settings.settingsReset'),
            position: 'top-right',
            timeout: 2000
        });
    });
};
</script>

<style scoped>
/* Custom animations for settings page */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
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

/* Responsive adjustments */
@media (max-width: 768px) {
    .text-h2 {
        font-size: 1.75rem;
    }

    .q-pa-xl {
        padding: 16px !important;
    }
}
</style>