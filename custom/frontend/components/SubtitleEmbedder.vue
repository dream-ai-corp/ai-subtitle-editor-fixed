<template>
    <div class="subtitle-embedder" data-testid="subtitle-embedder">
        <q-card class="embedder-card">
            <q-card-section>
                <div class="text-h6">{{ $t('subtitle.embedTitle') }}</div>
                <div class="text-caption text-grey-6">
                    {{ $t('subtitle.embedDescription') }}
                </div>
            </q-card-section>

            <q-card-section>
                <!-- Style Selection -->
                <div class="style-section q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">{{ $t('subtitle.subtitleStyle') }}</div>
                    <q-btn-group class="style-buttons">
                        <q-btn v-for="style in availableStyles" :key="style.name" :label="style.name"
                            :color="selectedStyle === style.name ? 'primary' : 'grey-3'"
                            :text-color="selectedStyle === style.name ? 'white' : 'dark'"
                            @click="selectedStyle = style.name" class="style-btn"
                            :data-testid="`style-btn-${style.name.toLowerCase()}`" />
                    </q-btn-group>
                </div>

                <!-- Style Preview -->
                <div class="style-preview q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">{{ $t('subtitle.preview') }}</div>
                    <div class="preview-container">
                        <div class="preview-text" :class="`preview-${selectedStyle}`" data-testid="style-preview">
                            {{ $t('subtitle.sampleSubtitleText') }}
                        </div>
                    </div>
                </div>

                <!-- Customization Options -->
                <div class="customization-section q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">{{ $t('subtitle.customization') }}</div>

                    <div class="row q-gutter-md">
                        <div class="col-12 col-md-6">
                            <q-input v-model.number="fontSize" type="number" :label="$t('subtitle.fontSize')" min="12"
                                max="72" outlined dense data-testid="font-size-input" />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-select v-model="fontColor" :options="fontColorOptions" :label="$t('subtitle.fontColor')"
                                outlined dense data-testid="font-color-select" />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-select v-model="outlineColor" :options="outlineColorOptions"
                                :label="$t('subtitle.outlineColor')" outlined dense
                                data-testid="outline-color-select" />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input v-model="outputFileName" :label="$t('subtitle.outputFilename')" outlined dense
                                data-testid="output-filename-input" />
                        </div>
                    </div>
                </div>

                <!-- Processing Status -->
                <div v-if="isProcessing" class="processing-section q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">{{ $t('subtitle.processing') }}</div>
                    <q-linear-progress :value="processingProgress" color="primary" data-testid="embedding-progress" />
                    <div class="text-caption q-mt-sm">
                        {{ processingMessage }}
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <q-btn color="primary" :label="$t('subtitle.embedButton')" icon="movie" @click="embedSubtitles"
                        :loading="isProcessing" :disable="isProcessing" data-testid="embed-button" />

                    <q-btn color="secondary" :label="$t('subtitle.previewStyle')" icon="visibility"
                        @click="previewStyle" :disable="isProcessing" data-testid="preview-button" />
                </div>
            </q-card-section>
        </q-card>

        <!-- Success Dialog -->
        <q-dialog v-model="showSuccessDialog" persistent>
            <q-card class="success-dialog">
                <q-card-section class="row items-center">
                    <q-avatar icon="check_circle" color="positive" text-color="white" />
                    <span class="q-ml-sm text-h6">{{ $t('subtitle.subtitlesEmbedded') }}</span>
                </q-card-section>

                <q-card-section>
                    <p>{{ $t('subtitle.videoReady') }}</p>
                    <div class="text-caption text-grey-6">
                        File: {{ outputFileName }}
                    </div>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat :label="$t('common.download')" color="primary" @click="downloadVideo" />
                    <q-btn flat :label="$t('common.close')" color="grey" @click="showSuccessDialog = false" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Error Dialog -->
        <q-dialog v-model="showErrorDialog" persistent>
            <q-card class="error-dialog">
                <q-card-section class="row items-center">
                    <q-avatar icon="error" color="negative" text-color="white" />
                    <span class="q-ml-sm text-h6">{{ $t('subtitle.embeddingFailed') }}</span>
                </q-card-section>

                <q-card-section>
                    <p>{{ errorMessage }}</p>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat :label="$t('common.close')" color="grey" @click="showErrorDialog = false" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSubtitleStore } from '../stores/subtitle-store'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

// Props
interface Props {
    projectId: number
}

const props = defineProps<Props>()

// Composables
const $q = useQuasar()
const subtitleStore = useSubtitleStore()
const { t: $t } = useI18n()

// Reactive data
const selectedStyle = ref('default')
const fontSize = ref(24)
const fontColor = ref('white')
const outlineColor = ref('black')
const outputFileName = ref('')
const isProcessing = ref(false)
const processingProgress = ref(0)
const processingMessage = ref('')
const showSuccessDialog = ref(false)
const showErrorDialog = ref(false)
const errorMessage = ref('')
const downloadUrl = ref('')

// Available styles
const availableStyles = computed(() => [
    { name: $t('subtitle.default'), description: 'Classic white text with black outline' },
    { name: $t('subtitle.modern'), description: 'Clean modern style with subtle shadows' },
    { name: $t('subtitle.bold'), description: 'High contrast style for better visibility' },
    { name: $t('subtitle.minimal'), description: 'Simple and clean style' }
])

// Color options
const fontColorOptions = computed(() => [
    { label: $t('subtitle.white'), value: 'white' },
    { label: $t('subtitle.yellow'), value: 'yellow' },
    { label: $t('subtitle.cyan'), value: 'cyan' },
    { label: $t('subtitle.green'), value: 'green' },
    { label: $t('subtitle.orange'), value: 'orange' }
])

const outlineColorOptions = computed(() => [
    { label: $t('subtitle.black'), value: 'black' },
    { label: $t('subtitle.darkBlue'), value: 'darkblue' },
    { label: $t('subtitle.darkGreen'), value: 'darkgreen' },
    { label: $t('subtitle.darkRed'), value: 'darkred' },
    { label: $t('subtitle.darkGrey'), value: 'darkgrey' }
])

// Computed
const project = computed(() => subtitleStore.projectById(props.projectId))

// Methods
const embedSubtitles = async () => {
    if (!project.value) {
        showError($t('subtitle.projectNotFound'))
        return
    }

    isProcessing.value = true
    processingProgress.value = 0
    processingMessage.value = $t('subtitle.preparingVideo')

    try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
            if (processingProgress.value < 0.9) {
                processingProgress.value += 0.1
                if (processingProgress.value < 0.3) {
                    processingMessage.value = $t('subtitle.extractingSubtitles')
                } else if (processingProgress.value < 0.6) {
                    processingMessage.value = $t('subtitle.embeddingSubtitles')
                } else if (processingProgress.value < 0.9) {
                    processingMessage.value = $t('subtitle.finalizingVideo')
                }
            }
        }, 500)

        // Call API to embed subtitles
        const response = await fetch(`/api/subtitle/projects/${props.projectId}/embed_subtitles/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                style: selectedStyle.value.toLowerCase(),
                font_size: fontSize.value,
                font_color: fontColor.value,
                outline_color: outlineColor.value
            })
        })

        clearInterval(progressInterval)
        processingProgress.value = 1
        processingMessage.value = $t('subtitle.complete')

        if (response.ok) {
            const result = await response.json()
            downloadUrl.value = result.download_url
            showSuccessDialog.value = true
        } else {
            const error = await response.json()
            throw new Error(error.message || $t('subtitle.failedToEmbed'))
        }

    } catch (error) {
        console.error('Error embedding subtitles:', error)
        showError(error instanceof Error ? error.message : $t('subtitle.failedToEmbed'))
    } finally {
        isProcessing.value = false
    }
}

const previewStyle = () => {
    $q.notify({
        message: `${$t('subtitle.previewStyle')} ${selectedStyle.value}`,
        color: 'info',
        icon: 'visibility'
    })
}

const downloadVideo = () => {
    if (downloadUrl.value) {
        window.open(downloadUrl.value, '_blank')
    }
}

const showError = (message: string) => {
    errorMessage.value = message
    showErrorDialog.value = true
}

// Initialize
onMounted(() => {
    if (project.value) {
        outputFileName.value = `${project.value.name}_with_subtitles.mp4`
    }
})
</script>

<style scoped>
.subtitle-embedder {
    max-width: 800px;
    margin: 0 auto;
}

.embedder-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.style-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.style-btn {
    min-width: 80px;
    border-radius: 8px;
}

.preview-container {
    background: #000;
    padding: 20px;
    border-radius: 8px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-text {
    font-size: 18px;
    text-align: center;
    padding: 8px 16px;
    border-radius: 4px;
}

/* Style previews */
.preview-default {
    color: white;
    text-shadow: 2px 2px 2px black;
}

.preview-modern {
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    background: rgba(0, 0, 0, 0.3);
    padding: 8px 16px;
    border-radius: 4px;
}

.preview-bold {
    color: white;
    font-weight: bold;
    text-shadow: 3px 3px 3px black;
    font-size: 20px;
}

.preview-minimal {
    color: white;
    text-shadow: 1px 1px 1px black;
    font-size: 16px;
}

.action-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 20px;
}

.success-dialog,
.error-dialog {
    min-width: 400px;
}

.processing-section {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 8px;
}

.customization-section {
    background: #fafafa;
    padding: 16px;
    border-radius: 8px;
}

.style-section {
    background: #fafafa;
    padding: 16px;
    border-radius: 8px;
}

.style-preview {
    background: #fafafa;
    padding: 16px;
    border-radius: 8px;
}
</style>