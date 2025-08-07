<template>
  <q-page class="index-page">
    <div class="loading-container">
      <q-spinner-dots size="50px" color="primary" />
      <p class="loading-text">{{ $t('subtitle.loadingApp') }}</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const router = useRouter()

onMounted(() => {
  // Redirect to login page after a short delay
  // setTimeout(() => {
  //   router.push('/')
  // }, 1500)
})
</script>

<style scoped>
.index-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  text-align: center;
  color: white;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1.2rem;
  opacity: 0.8;
}
</style>
