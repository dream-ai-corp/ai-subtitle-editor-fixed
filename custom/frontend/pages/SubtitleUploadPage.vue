<template>
  <q-page class="subtitle-upload-page">
    <div class="container">
      <div class="page-header">
        <h1 class="text-h3 q-mb-md">AI Subtitle Generator</h1>
        <p class="text-body1 text-grey-7">
          Upload your video and let our AI generate accurate subtitles automatically
        </p>
      </div>

      <div class="upload-section">
        <VideoUpload @upload-complete="handleUploadComplete" />
      </div>

      <div v-if="recentProjects.length > 0" class="recent-projects q-mt-xl">
        <h2 class="text-h5 q-mb-md">Recent Projects</h2>
        <div class="row q-gutter-md">
          <div
            v-for="project in recentProjects"
            :key="project.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <q-card class="project-card" clickable @click="viewProject(project.id)">
              <q-card-section>
                <div class="text-h6">{{ project.name }}</div>
                <div class="text-caption text-grey-6">{{ project.description }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="row items-center q-gutter-sm">
                  <q-chip
                    :color="getStatusColor(project.status)"
                    text-color="white"
                    size="sm"
                  >
                    {{ project.status }}
                  </q-chip>
                  <q-chip
                    v-if="project.subtitle_count > 0"
                    color="primary"
                    text-color="white"
                    size="sm"
                  >
                    {{ project.subtitle_count }} subtitles
                  </q-chip>
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="text-caption text-grey-6">
                  Created: {{ formatDate(project.created_at) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <div class="features-section q-mt-xl">
        <h2 class="text-h5 q-mb-lg">Features</h2>
        <div class="row q-gutter-lg">
          <div class="col-12 col-md-4">
            <div class="feature-card text-center">
              <q-icon name="cloud_upload" size="3rem" color="primary" class="q-mb-md" />
              <h3 class="text-h6 q-mb-sm">Easy Upload</h3>
              <p class="text-body2 text-grey-7">
                Drag and drop your video files. Supports MP4, AVI, MOV, MKV, and WEBM formats.
              </p>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="feature-card text-center">
              <q-icon name="psychology" size="3rem" color="primary" class="q-mb-md" />
              <h3 class="text-h6 q-mb-sm">AI-Powered</h3>
              <p class="text-body2 text-grey-7">
                Advanced speech recognition using OpenAI Whisper for accurate subtitle generation.
              </p>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="feature-card text-center">
              <q-icon name="edit" size="3rem" color="primary" class="q-mb-md" />
              <h3 class="text-h6 q-mb-sm">Easy Editing</h3>
              <p class="text-body2 text-grey-7">
                Edit subtitles with our intuitive timeline editor. Split, merge, and adjust timing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import VideoUpload from '../components/VideoUpload.vue'
import { useSubtitleStore, type SubtitleProject } from '../stores/subtitle-store'

// Composables
const router = useRouter()
const $q = useQuasar()
const subtitleStore = useSubtitleStore()

// Reactive data
const recentProjects = ref<SubtitleProject[]>([])

// Methods
const handleUploadComplete = (projectId: number) => {
  // Navigate to the project editor
  router.push(`/subtitle-editor/${projectId}`)
}

const viewProject = (projectId: number) => {
  router.push(`/subtitle-editor/${projectId}`)
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const loadRecentProjects = async () => {
  try {
    await subtitleStore.fetchProjects()
    recentProjects.value = subtitleStore.projects.slice(0, 6) // Show last 6 projects
  } catch (error) {
    console.error('Error loading recent projects:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadRecentProjects()
})
</script>

<style scoped>
.subtitle-upload-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.page-header h1 {
  margin-bottom: 1rem;
  font-weight: 300;
}

.upload-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.recent-projects {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.features-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-card {
  padding: 1.5rem;
  border-radius: 8px;
  background: #f8f9fa;
  height: 100%;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
}
</style> 