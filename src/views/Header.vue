<template>
  <header v-if="!isReaderPage"
      class="card"
      style="position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:1rem;background-color:var(--color-background);"
  >
    <router-link  to="/" style="font-weight:700;text-decoration:none;">📚 Novel Reader</router-link>

    <nav class="flex" style="gap:.75rem;">
      <router-link  to="/bookshelf">书架</router-link>
      <router-link  to="/search">搜索</router-link>
    </nav>
    <div style="flex:1"></div>
    <button class="btn" @click="toggleTheme">主题：{{ themeLabel }}</button>
  </header>
  <router-link  v-if="isReaderPage" to="/" style="font-weight:700;text-decoration:none;">📚 Novel Reader</router-link>
  <meta name="google-adsense-account" content="ca-pub-4075901524204194">
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isReaderPage = computed(() => route.path.startsWith('/reader'))

// 主题控制
const theme = ref<string>(localStorage.getItem('app-theme') || 'light')
const themeLabel = computed(() =>
    theme.value === 'light' ? '浅色' : theme.value === 'sepia' ? '护眼' : '深色'
)

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'sepia' : theme.value === 'sepia' ? 'dark' : 'light'
}

watchEffect(() => {
  localStorage.setItem('app-theme', theme.value)
  document.documentElement.dataset.theme = theme.value
})
</script>

<style scoped>
.card {
  padding: 0.6rem 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.flex {
  display: flex;
}

.btn {
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>