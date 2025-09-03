<template>
  <div class="friend-links">
    <span class="title">友情链接：</span>
    <div class="links-grid">
      <div
          v-for="link in links"
          :key="link.url"
          class="link-card"
      >
        <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
        >
          <img v-if="link.icon" :src="link.icon" alt="logo" class="icon" />
          <span class="name">{{ link.name }}</span>
        </a>
        <!-- tooltip -->
        <div class="tooltip">{{ link.desc || link.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { fetchFriendLinks } from "../api"

interface FriendLink {
  name: string
  url: string
  icon?: string
  desc?: string
}

const links = ref<FriendLink[]>([])

onMounted(async () => {
  try {
    const data = await fetchFriendLinks()
    if (Array.isArray(data) && data.length > 0) {
      links.value = data
    }
  } catch {
    links.value = [
      {
        name: "OpenAI",
        url: "https://openai.com",
        icon: "https://openai.com/favicon.ico",
        desc: "人工智能研究机构，ChatGPT 的开发公司"
      },
      {
        name: "Vue.js",
        url: "https://vuejs.org",
        icon: "https://vuejs.org/images/logo.png",
        desc: "渐进式 JavaScript 框架"
      }
    ]
  }
})
</script>

<style scoped>
.friend-links {
  //margin-top: 1rem;
  //padding: 0.5rem 0;
  text-align: center;
}

.title {
  font-size: 1.2 rem;
  font-weight: normal;
  color: var(--muted, #999); /* 弱化颜色 */
  margin-right: 0.5rem;
}

.links-grid {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem 1rem;
}

.link-card {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.link-card a {
  display: inline-flex;
  align-items: center;
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--text, #333);
  transition: color 0.2s;
}

.link-card a:hover {
  color: var(--primary, #007bff);
}

.link-card .icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  border-radius: 3px;
}

/* Tooltip 样式 */
.tooltip {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  visibility: hidden;
  opacity: 0;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  line-height: 1.2;
  white-space: nowrap;
  transition: opacity 0.2s;
  pointer-events: none;
  z-index: 100;
}

.link-card:hover .tooltip,
.link-card a:hover + .tooltip {
  visibility: visible;
  opacity: 1;
}
</style>