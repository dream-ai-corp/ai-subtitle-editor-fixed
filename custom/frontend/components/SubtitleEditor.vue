<template>
    <div class="subtitle-editor" data-testid="subtitle-editor">
        <q-card class="editor-card">
            <q-card-section>
                <div class="text-h6 q-mb-md">Subtitle Editor</div>

                <!-- Video Player -->
                <div class="video-container q-mb-lg">
                    <video ref="videoPlayer" class="video-player" controls data-testid="video-player"
                        @timeupdate="handleTimeUpdate" @loadedmetadata="handleVideoLoaded">
                        <source :src="videoUrl" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>

                <!-- Timeline -->
                <div class="timeline-container q-mb-lg">
                    <div class="timeline-header">
                        <div class="text-subtitle2">Timeline</div>
                        <div class="text-caption text-grey-6">
                            Current Time: {{ formatTime(currentTime) }}
                        </div>
                    </div>

                    <div class="timeline">
                        <div v-for="subtitle in subtitles" :key="subtitle.id" class="timeline-item"
                            data-testid="timeline-item" :class="{ 'timeline-item--active': isSubtitleActive(subtitle) }"
                            @click="seekToSubtitle(subtitle)">
                            <div class="timeline-item-time">
                                {{ formatTime(subtitle.start_time) }} - {{ formatTime(subtitle.end_time) }}
                            </div>
                            <div class="timeline-item-text">
                                {{ subtitle.text }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Subtitle Editor -->
                <div class="subtitle-editor-panel" data-testid="subtitle-editor-panel">
                    <div class="text-subtitle2 q-mb-md">Edit Subtitle</div>

                    <div v-if="selectedSubtitle" class="q-gutter-md">
                        <div class="row q-gutter-sm">
                            <q-input v-model.number="selectedSubtitle.start_time" label="Start Time (seconds)"
                                type="number" step="0.1" outlined dense class="col" data-testid="start-time-input" />
                            <q-input v-model.number="selectedSubtitle.end_time" label="End Time (seconds)" type="number"
                                step="0.1" outlined dense class="col" data-testid="end-time-input" />
                        </div>

                        <q-input v-model="selectedSubtitle.text" :label="$t('subtitle.subtitleText')" type="textarea"
                            rows="3" outlined data-testid="subtitle-text-input" />

                        <div class="row q-gutter-sm">
                            <q-btn color="primary" @click="saveSubtitle" :loading="isSaving" data-testid="save-button">
                                Save Changes
                            </q-btn>
                            <q-btn flat color="grey" @click="cancelEdit" data-testid="cancel-button">
                                Cancel
                            </q-btn>
                            <q-btn flat color="orange" @click="splitSubtitle" :disable="!selectedSubtitle"
                                data-testid="split-button">
                                Split
                            </q-btn>
                            <q-btn flat color="red" @click="deleteSubtitle" :disable="!selectedSubtitle"
                                data-testid="delete-button">
                                Delete
                            </q-btn>
                        </div>
                    </div>

                    <div v-else class="text-grey-6 text-center q-pa-md">
                        Select a subtitle from the timeline to edit
                    </div>
                </div>

                <!-- Subtitle List -->
                <div class="subtitle-list q-mt-lg">
                    <div class="text-subtitle2 q-mb-md">All Subtitles</div>

                    <q-list bordered separator>
                        <q-item v-for="subtitle in subtitles" :key="subtitle.id" clickable
                            :active="selectedSubtitle?.id === subtitle.id" @click="selectSubtitle(subtitle)"
                            data-testid="subtitle-list-item">
                            <q-item-section>
                                <q-item-label>
                                    {{ formatTime(subtitle.start_time) }} - {{ formatTime(subtitle.end_time) }}
                                </q-item-label>
                                <q-item-label caption>
                                    {{ subtitle.text }}
                                </q-item-label>
                            </q-item-section>

                            <q-item-section side>
                                <q-chip v-if="subtitle.is_edited" size="sm" color="orange" text-color="white"
                                    data-testid="edited-chip">
                                    Edited
                                </q-chip>
                                <q-chip v-if="subtitle.confidence" size="sm"
                                    :color="getConfidenceColor(subtitle.confidence)" text-color="white"
                                    data-testid="confidence-chip">
                                    {{ Math.round(subtitle.confidence * 100) }}%
                                </q-chip>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>
            </q-card-section>
        </q-card>

        <!-- Split Dialog -->
        <q-dialog v-model="showSplitDialog" persistent data-testid="split-dialog">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">Split Subtitle</div>
                </q-card-section>

                <q-card-section>
                    <q-input v-model.number="splitTime" label="Split Time (seconds)" type="number" step="0.1" outlined
                        data-testid="split-time-input" :rules="[
                            val => val > selectedSubtitle?.start_time || 'Must be after start time',
                            val => val < selectedSubtitle?.end_time || 'Must be before end time'
                        ]" />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancel" color="grey" v-close-popup />
                    <q-btn flat label="Split" color="primary" @click="confirmSplit" :disable="!isValidSplitTime"
                        data-testid="confirm-split-button" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useSubtitleStore } from '../stores/subtitle-store'

// Props
interface Props {
    projectId: number
    videoUrl: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
    subtitleUpdated: [subtitleId: number]
    subtitleDeleted: [subtitleId: number]
}>()

// Composables
const $q = useQuasar()
const subtitleStore = useSubtitleStore()

// Reactive data
const videoPlayer = ref<HTMLVideoElement>()
const currentTime = ref(0)
const selectedSubtitle = ref<any>(null)
const subtitles = ref<any[]>([])
const isSaving = ref(false)
const showSplitDialog = ref(false)
const splitTime = ref(0)

// Computed
const isValidSplitTime = computed(() => {
    if (!selectedSubtitle.value) return false
    return splitTime.value > selectedSubtitle.value.start_time &&
        splitTime.value < selectedSubtitle.value.end_time
})

// Methods
const handleTimeUpdate = () => {
    if (videoPlayer.value) {
        currentTime.value = videoPlayer.value.currentTime
    }
}

const handleVideoLoaded = () => {
    loadSubtitles()
}

const loadSubtitles = async () => {
    try {
        const data = await subtitleStore.getProjectSubtitles(props.projectId)
        subtitles.value = data
    } catch (error) {
        console.error('Error loading subtitles:', error)
        $q.notify({
            type: 'negative',
            message: 'Failed to load subtitles',
            position: 'top'
        })
    }
}

const selectSubtitle = (subtitle: any) => {
    selectedSubtitle.value = { ...subtitle }
}

const cancelEdit = () => {
    selectedSubtitle.value = null
}

const saveSubtitle = async () => {
    if (!selectedSubtitle.value) return

    try {
        isSaving.value = true

        await subtitleStore.updateSubtitle(selectedSubtitle.value.id, {
            start_time: selectedSubtitle.value.start_time,
            end_time: selectedSubtitle.value.end_time,
            text: selectedSubtitle.value.text
        })

        // Update local data
        const index = subtitles.value.findIndex(s => s.id === selectedSubtitle.value.id)
        if (index !== -1) {
            subtitles.value[index] = { ...selectedSubtitle.value }
        }

        $q.notify({
            type: 'positive',
            message: 'Subtitle updated successfully',
            position: 'top'
        })

        emit('subtitleUpdated', selectedSubtitle.value.id)
        selectedSubtitle.value = null

    } catch (error) {
        console.error('Error saving subtitle:', error)
        $q.notify({
            type: 'negative',
            message: 'Failed to save subtitle',
            position: 'top'
        })
    } finally {
        isSaving.value = false
    }
}

const deleteSubtitle = async () => {
    if (!selectedSubtitle.value) return

    try {
        await subtitleStore.deleteSubtitle(selectedSubtitle.value.id)

        // Remove from local data
        const index = subtitles.value.findIndex(s => s.id === selectedSubtitle.value.id)
        if (index !== -1) {
            subtitles.value.splice(index, 1)
        }

        $q.notify({
            type: 'positive',
            message: 'Subtitle deleted successfully',
            position: 'top'
        })

        emit('subtitleDeleted', selectedSubtitle.value.id)
        selectedSubtitle.value = null

    } catch (error) {
        console.error('Error deleting subtitle:', error)
        $q.notify({
            type: 'negative',
            message: 'Failed to delete subtitle',
            position: 'top'
        })
    }
}

const splitSubtitle = () => {
    if (!selectedSubtitle.value) return

    splitTime.value = (selectedSubtitle.value.start_time + selectedSubtitle.value.end_time) / 2
    showSplitDialog.value = true
}

const confirmSplit = async () => {
    if (!selectedSubtitle.value || !isValidSplitTime.value) return

    try {
        const result = await subtitleStore.splitSubtitle(selectedSubtitle.value.id, splitTime.value)

        // Update local data
        const index = subtitles.value.findIndex(s => s.id === selectedSubtitle.value.id)
        if (index !== -1) {
            subtitles.value[index] = result.original_entry
            subtitles.value.splice(index + 1, 0, result.new_entry)
        }

        $q.notify({
            type: 'positive',
            message: 'Subtitle split successfully',
            position: 'top'
        })

        showSplitDialog.value = false
        selectedSubtitle.value = null

    } catch (error) {
        console.error('Error splitting subtitle:', error)
        $q.notify({
            type: 'negative',
            message: 'Failed to split subtitle',
            position: 'top'
        })
    }
}

const seekToSubtitle = (subtitle: any) => {
    if (videoPlayer.value) {
        videoPlayer.value.currentTime = subtitle.start_time
    }
}

const isSubtitleActive = (subtitle: any) => {
    return currentTime.value >= subtitle.start_time && currentTime.value <= subtitle.end_time
}

const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
    } else {
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
    }
}

const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'positive'
    if (confidence >= 0.6) return 'warning'
    return 'negative'
}

// Lifecycle
onMounted(() => {
    loadSubtitles()
})

// Watchers
watch(() => props.projectId, () => {
    loadSubtitles()
})
</script>

<style scoped>
.subtitle-editor {
    max-width: 1200px;
    margin: 0 auto;
}

.editor-card {
    border-radius: 12px;
}

.video-container {
    position: relative;
    width: 100%;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
}

.video-player {
    width: 100%;
    height: auto;
    max-height: 400px;
}

.timeline-container {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.timeline {
    max-height: 200px;
    overflow-y: auto;
}

.timeline-item {
    padding: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.timeline-item:hover {
    background-color: #f5f5f5;
}

.timeline-item--active {
    background-color: #e3f2fd;
    border-color: #1976d2;
}

.timeline-item-time {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.25rem;
}

.timeline-item-text {
    font-size: 0.875rem;
    line-height: 1.4;
}

.subtitle-editor-panel {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    background-color: #fafafa;
}

.subtitle-list {
    max-height: 300px;
    overflow-y: auto;
}
</style>