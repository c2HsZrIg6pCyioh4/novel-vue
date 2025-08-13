<template>
  <div>
    <header class="card" style="position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:1rem;background-color:var(--color-background);">
      <router-link to="/" style="font-weight:700;text-decoration:none;">📚 Novel Reader</router-link>
      <nav class="flex" style="gap:.75rem;">
        <router-link to="/bookshelf">书架</router-link>
        <router-link to="/search">搜索</router-link>
      </nav>
      <div style="flex:1"></div>
      <button class="btn" @click="toggleTheme">主题：{{ themeLabel }}</button>
    </header>
    <main class="container" style="width:100%;">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
const theme = ref<string>(localStorage.getItem('app-theme') || 'light')
const themeLabel = computed(() => theme.value === 'light' ? '浅色' : theme.value === 'sepia' ? '护眼' : '深色')
function toggleTheme(){
  theme.value = theme.value === 'light' ? 'sepia' : theme.value === 'sepia' ? 'dark' : 'light'
}
watchEffect(() => {
  localStorage.setItem('app-theme', theme.value)
  document.documentElement.dataset.theme = theme.value
})
</script>
