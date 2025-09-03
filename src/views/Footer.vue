<template>
  <footer  v-if="!isReaderPage" class="footer">
    <FriendLinks />
    <p >
      本站所有小说内容均由网友上传分享，仅供学习与交流使用，版权归原作者所有。如有侵权，请联系<a :href="`mailto:contact@${rootDomain}`">contact@{{ rootDomain }}</a>删除<br>
    </p>
    <p>© 2025 Novel Reader · All rights reserved.</p>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import FriendLinks from "./FriendLinks.vue";
const route = useRoute()
const isReaderPage = computed(() => route.path.startsWith('/reader'))
function getRootDomain(hostname: string): string {
  // 处理本地开发环境
  if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
  ) {
    return hostname
  }

  const parts = hostname.split('.')
  if (parts.length <= 2) return hostname

  // 处理常见的双后缀情况
  const tlds = ['com.cn', 'net.cn', 'org.cn', 'gov.cn', 'co.uk']
  const lastTwo = parts.slice(-2).join('.')
  const lastThree = parts.slice(-3).join('.')
  if (tlds.includes(lastTwo)) {
    return lastThree
  }
  return lastTwo
}
// 动态获取当前域名
// 动态获取当前域名
const rootDomain = getRootDomain(window.location.hostname)
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 1rem;
  //background: #f9f9f9;
  color: #666;
  font-size: 0.9rem;
  border-top: 1px solid var(--border, #e0e0e0);
}
</style>