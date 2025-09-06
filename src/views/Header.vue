<template>
  <header v-if="!isReaderPage"
      class="card"
      style="position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:1rem;background-color:var(--color-background);"
  >
    <router-link to="/" class="logo">📚 <span class="logo-text">Novel Reader</span></router-link>

    <nav class="flex" style="gap:.75rem;">
      <router-link  class="btn" to="/bookshelf">书架</router-link>
      <router-link  class="btn" to="/search">搜索</router-link>
    </nav>
    <div style="flex:1"></div>
    <ThemeSwitcher />
  </header>
  <router-link  v-if="isReaderPage" to="/" style="font-weight:700;text-decoration:none;">📚 Novel Reader</router-link>
  <meta name="google-adsense-account" content="ca-pub-4075901524204194">
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ThemeSwitcher from './ThemeSwitcher.vue'

const route = useRoute()
const isReaderPage = computed(() => route.path.startsWith('/reader'))
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
.logo {
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}
.logo-text {
  display: inline;
}
@media (max-width: 480px) {
  .logo-text {
    display: none; /* 手机上只显示图标，不显示文字 */
  }
}
</style>