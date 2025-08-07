<template>
    <div class="video-upload" data-testid="video-upload">
        <q-card class="upload-card">
            <q-card-section>
                <div class="text-h6 q-mb-md">Upload Video</div>

                <!-- Upload Area -->
                <div class="upload-area" data-testid="upload-area"
                    :class="{ 'upload-area--dragover': isDragOver, 'upload-area--uploading': isUploading }"
                    @drop="handleDrop" @dragover="handleDragOver" @dragleave="handleDragLeave"
                    @click="triggerFileInput">
                    <div class="upload-content">
                        <q-icon name="cloud_upload" size="4rem" color="primary" data-testid="upload-icon" />
                        <div class="text-h6 q-mt-md">Drop your video here</div>
                        <div class="text-body2 text-grey-6 q-mt-sm">
                            or click to browse files
                        </div>
                        <div class="text-caption text-grey-5 q-mt-md">
                            Supported formats: MP4, AVI, MOV, MKV, WEBM (max 500MB)
                        </div>
                    </div>
                </div>

                <!-- File Input (Hidden) -->
                <input ref="fileInput" type="file" accept="video/*" style="display: none" data-testid="file-input"
                    @change="handleFileSelect" />

                <!-- Upload Progress -->
                <div v-if="isUploading" class="q-mt-md">
                    <q-linear-progress :value="uploadProgress" color="primary" class="q-mb-sm"
                        data-testid="upload-progress" />
                    <div class="text-caption" data-testid="upload-progress-text">
                        Uploading... {{ Math.round(uploadProgress * 100) }}%
                    </div>
                </div>

                <!-- Project Details Form -->
                <div v-if="selectedFile && !isUploading" class="q-mt-lg" data-testid="project-form">
                    <q-form @submit="handleUpload" class="q-gutter-md">
                        <q-input v-model="projectName" :label="$t('subtitle.projectName')" outlined
                            data-testid="project-name-input" :rules="[val => !!val || 'Project name is required']"
                            required />

                        <q-input v-model="projectDescription" label="Description (optional)" outlined type="textarea"
                            rows="3" data-testid="project-description-input" />

                        <q-select v-model="selectedLanguage" :options="languageOptions" label="Language" outlined
                            emit-value map-options data-testid="language-select" />

                        <div class="row q-gutter-sm">
                            <q-btn type="submit" color="primary" :loading="isUploading" :disable="!selectedFile"
                                data-testid="upload-button">
                                Start Processing
                            </q-btn>
                            <q-btn flat color="grey" @click="resetUpload" :disable="isUploading">
                                Cancel
                            </q-btn>
                        </div>
                    </q-form>
                </div>
            </q-card-section>
        </q-card>

        <!-- Error Dialog -->
        <q-dialog v-model="showError" persistent data-testid="error-dialog">
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="error" color="negative" text-color="white" />
                    <span class="q-ml-sm">Upload Error</span>
                </q-card-section>

                <q-card-section>
                    {{ errorMessage }}
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="OK" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useSubtitleStore } from '../stores/subtitle-store'

// Props
interface Props {
    onUploadComplete?: (projectId: number) => void
}

const props = withDefaults(defineProps<Props>(), {
    onUploadComplete: () => { }
})

// Composables
const $q = useQuasar()
const subtitleStore = useSubtitleStore()

// Reactive data
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const projectName = ref('')
const projectDescription = ref('')
const selectedLanguage = ref('en')
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const showError = ref(false)
const errorMessage = ref('')

// Language options
const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'French', value: 'fr' },
    { label: 'Spanish', value: 'es' },
    { label: 'German', value: 'de' },
    { label: 'Italian', value: 'it' },
    { label: 'Portuguese', value: 'pt' },
    { label: 'Russian', value: 'ru' },
    { label: 'Chinese', value: 'zh' },
    { label: 'Japanese', value: 'ja' },
    { label: 'Korean', value: 'ko' }
]

// Computed
const isFormValid = computed(() => {
    return selectedFile.value && projectName.value.trim()
})

// Methods
const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        validateAndSetFile(file)
    }
}

const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
        validateAndSetFile(files[0]!)
    }
}

const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = false
}

const validateAndSetFile = (file: File) => {
    // Check file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
        showErrorMessage('Please select a valid video file (MP4, AVI, MOV, MKV, WEBM)')
        return
    }

    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
        showErrorMessage('File size must be less than 500MB')
        return
    }

    selectedFile.value = file
    projectName.value = file.name.replace(/\.[^/.]+$/, '') // Remove extension
}

const handleUpload = async () => {
    if (!selectedFile.value || !projectName.value.trim()) {
        return
    }

    try {
        isUploading.value = true
        uploadProgress.value = 0

        // Create FormData
        const formData = new FormData()
        formData.append('video_file', selectedFile.value)
        formData.append('name', projectName.value.trim())
        formData.append('description', projectDescription.value.trim())
        formData.append('language', selectedLanguage.value)

        // Upload project
        const project = await subtitleStore.uploadVideo(formData, (progress) => {
            uploadProgress.value = progress
        })

        // Success notification
        $q.notify({
            type: 'positive',
            message: 'Video uploaded successfully! Processing will begin shortly.',
            position: 'top'
        })

        // Call callback if provided
        if (props.onUploadComplete) {
            props.onUploadComplete(project.id)
        }

        // Reset form
        resetUpload()

    } catch (error) {
        console.error('Upload error:', error)
        showErrorMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
        isUploading.value = false
        uploadProgress.value = 0
    }
}

const resetUpload = () => {
    selectedFile.value = null
    projectName.value = ''
    projectDescription.value = ''
    selectedLanguage.value = 'en'
    isDragOver.value = false
    isUploading.value = false
    uploadProgress.value = 0

    // Reset file input
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const showErrorMessage = (message: string) => {
    errorMessage.value = message
    showError.value = true
}
</script>

<style scoped>
.video-upload {
    max-width: 600px;
    margin: 0 auto;
}

.upload-card {
    border-radius: 12px;
}

.upload-area {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #fafafa;
}

.upload-area:hover {
    border-color: #1976d2;
    background-color: #f5f5f5;
}

.upload-area--dragover {
    border-color: #1976d2;
    background-color: #e3f2fd;
    transform: scale(1.02);
}

.upload-area--uploading {
    border-color: #1976d2;
    background-color: #e8f5e8;
    cursor: not-allowed;
}

.upload-content {
    pointer-events: none;
}

.upload-area--uploading .upload-content {
    opacity: 0.7;
}
</style>