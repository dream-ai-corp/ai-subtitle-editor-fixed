<template>
    <q-page class="subtitle-editor-page">
        <div class="container">
            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
                <q-spinner-dots size="50px" color="primary" />
                <div class="text-h6 q-mt-md">Loading project...</div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-container">
                <q-icon name="error" size="4rem" color="negative" />
                <div class="text-h6 q-mt-md">Error loading project</div>
                <div class="text-body2 text-grey-6 q-mt-sm">{{ error }}</div>
                <q-btn color="primary" :label="$t('subtitle.goBack')" @click="$router.push('/subtitle-upload')"
                    class="q-mt-md" />
            </div>

            <!-- Main Content -->
            <div v-else-if="project" class="editor-content">
                <!-- Header -->
                <div class="page-header">
                    <div class="header-left">
                        <q-btn flat round icon="arrow_back" @click="$router.push('/subtitle-upload')" class="q-mr-md" />
                        <div>
                            <h1 class="text-h4 q-mb-xs">{{ project.name }}</h1>
                            <p class="text-body2 text-grey-6">{{ project.description }}</p>
                        </div>
                    </div>

                    <div class="header-right">
                        <q-chip :color="getStatusColor(project.status)" text-color="white" size="md">
                            {{ project.status }}
                        </q-chip>

                        <q-btn v-if="project.is_completed" color="secondary" icon="movie" label="Embed"
                            @click="showEmbedDialog = true" class="q-mr-md" />

                        <q-btn v-if="project.is_completed" color="primary" icon="download" label="Export"
                            @click="showExportDialog = true" />
                    </div>
                </div>

                <!-- Processing State -->
                <div v-if="project.is_processing" class="processing-state">
                    <q-card class="processing-card">
                        <q-card-section class="text-center">
                            <q-spinner-dots size="50px" color="primary" />
                            <div class="text-h6 q-mt-md">Processing Video</div>
                            <div class="text-body2 text-grey-6 q-mt-sm">
                                Our AI is generating subtitles for your video. This may take a few minutes.
                            </div>
                            <q-btn color="primary" :label="$t('subtitle.refreshStatus')" @click="refreshProjectStatus"
                                class="q-mt-md" />
                        </q-card-section>
                    </q-card>
                </div>

                <!-- Editor -->
                <div v-else-if="project.is_completed" class="editor-section">
                    <SubtitleEditor :project-id="projectId" :video-url="project.video_file"
                        @subtitle-updated="handleSubtitleUpdated" @subtitle-deleted="handleSubtitleDeleted" />
                </div>

                <!-- Failed State -->
                <div v-else-if="project.status === 'failed'" class="failed-state">
                    <q-card class="failed-card">
                        <q-card-section class="text-center">
                            <q-icon name="error" size="4rem" color="negative" />
                            <div class="text-h6 q-mt-md">Processing Failed</div>
                            <div class="text-body2 text-grey-6 q-mt-sm">
                                There was an error processing your video. Please try uploading again.
                            </div>
                            <q-btn color="primary" label="Upload New Video" @click="$router.push('/subtitle-upload')"
                                class="q-mt-md" />
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Export Dialog -->
            <q-dialog v-model="showExportDialog" persistent>
                <q-card style="min-width: 400px">
                    <q-card-section>
                        <div class="text-h6">Export Subtitles</div>
                    </q-card-section>

                    <q-card-section>
                        <div class="q-gutter-md">
                            <q-select v-model="exportFormat" :options="exportFormats" label="Format" outlined emit-value
                                map-options />

                            <q-select v-model="exportStyle" :options="exportStyles" label="Style (optional)" outlined
                                emit-value map-options clearable />
                        </div>
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn flat label="Cancel" color="grey" v-close-popup />
                        <q-btn flat label="Export" color="primary" @click="exportSubtitles" :loading="exporting" />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <!-- Embed Subtitles Dialog -->
            <q-dialog v-model="showEmbedDialog" persistent>
                <q-card style="min-width: 800px; max-width: 90vw;">
                    <q-card-section>
                        <div class="text-h6">Embed Subtitles in Video</div>
                        <div class="text-caption text-grey-6">
                            Create a new video with subtitles permanently embedded
                        </div>
                    </q-card-section>

                    <q-card-section>
                        <SubtitleEmbedder :project-id="projectId" />
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn flat label="Close" color="grey" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import SubtitleEditor from '../components/SubtitleEditor.vue'
import SubtitleEmbedder from '../components/SubtitleEmbedder.vue'
import { useSubtitleStore, type SubtitleProject } from '../stores/subtitle-store'

// Composables
const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const subtitleStore = useSubtitleStore()

// Reactive data
const project = ref<SubtitleProject | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showExportDialog = ref(false)
const showEmbedDialog = ref(false)
const exportFormat = ref('srt')
const exportStyle = ref(null)
const exporting = ref(false)

// Computed
const projectId = computed(() => parseInt(route.params.id as string))

const exportFormats = [
    { label: 'SRT (SubRip)', value: 'srt' },
    { label: 'VTT (WebVTT)', value: 'vtt' },
    { label: 'TXT (Plain Text)', value: 'txt' }
]

const exportStyles = [
    { label: 'Classic', value: 1 },
    { label: 'Modern', value: 2 },
    { label: 'Bold', value: 3 },
    { label: 'Minimal', value: 4 }
]

// Methods
const loadProject = async () => {
    try {
        loading.value = true
        error.value = null

        const projectData = await subtitleStore.fetchProject(projectId.value)
        project.value = projectData
    } catch (err) {
        error.value = 'Failed to load project'
        console.error('Error loading project:', err)
    } finally {
        loading.value = false
    }
}

const refreshProjectStatus = async () => {
    try {
        const status = await subtitleStore.getProjectStatus(projectId.value)

        if (project.value) {
            project.value.status = status.status
            project.value.subtitle_count = status.subtitle_count
            project.value.is_processing = status.is_processing
            project.value.is_completed = status.is_completed
        }
    } catch (err) {
        console.error('Error refreshing project status:', err)
    }
}

const handleSubtitleUpdated = (subtitleId: number) => {
    $q.notify({
        type: 'positive',
        message: 'Subtitle updated successfully',
        position: 'top'
    })
}

const handleSubtitleDeleted = (subtitleId: number) => {
    $q.notify({
        type: 'positive',
        message: 'Subtitle deleted successfully',
        position: 'top'
    })
}

const exportSubtitles = async () => {
    if (!project.value) return

    try {
        exporting.value = true

        const blob = await subtitleStore.exportSubtitles(
            project.value.id,
            exportFormat.value,
            exportStyle.value || undefined
        )

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.value.name}.${exportFormat.value}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        showExportDialog.value = false

        $q.notify({
            type: 'positive',
            message: 'Subtitles exported successfully',
            position: 'top'
        })
    } catch (err) {
        console.error('Error exporting subtitles:', err)
        $q.notify({
            type: 'negative',
            message: 'Failed to export subtitles',
            position: 'top'
        })
    } finally {
        exporting.value = false
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'positive'
        case 'processing':
            return 'warning'
        case 'failed':
            return 'negative'
        default:
            return 'grey'
    }
}

// Lifecycle
onMounted(() => {
    loadProject()
})

// Watchers
watch(() => route.params.id, () => {
    loadProject()
})
</script>

<style scoped>
.subtitle-editor-page {
    background: #f5f5f5;
    min-height: 100vh;
    padding: 2rem 0;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
}

.loading-container,
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-left {
    display: flex;
    align-items: center;
}

.header-right {
    display: flex;
    align-items: center;
}

.processing-state,
.failed-state {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
}

.processing-card,
.failed-card {
    max-width: 500px;
    width: 100%;
}

.editor-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
</style>