<template>
  <button class="btn" @click="toggleTheme">主题：{{ themeLabel }}</button>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'

const theme = ref<string>(localStorage.getItem('app-theme') || 'light')

const themeLabel = computed(() =>
    theme.value === 'light' ? '浅色' : theme.value === 'sepia' ? '护眼' : '深色'
)

function toggleTheme() {
  theme.value = theme.value === 'light'
      ? 'sepia'
      : theme.value === 'sepia'
          ? 'dark'
          : 'light'
}

watchEffect(() => {
  localStorage.setItem('app-theme', theme.value)
  document.documentElement.dataset.theme = theme.value
})
</script>

<style scoped>
.btn {
  padding: 0.375rem 0.8rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
  background: var(--panel, #ffffff);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;       /* 不换行 */
  flex-shrink: 0;            /* 在 flex 容器里不被压缩 */
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}
</style>