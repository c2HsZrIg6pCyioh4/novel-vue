<template>
  <div class="card book" @click="$router.push(`/book/${book.novel_id}`)">
    <div 
      class="cover" 
      :style="{ backgroundImage: `url(${getImageUrl(book.cover_url)})` }"
    ></div>
    <div class="info">
      <h3 class="title">{{ book.name }}</h3>
      <p class="meta"><span class="badge">{{ book.author }}</span></p>
      <div class="flex mt-2">
        <button
            class="btn primary"
            @click.stop="startReading(book.novel_id)"
        >
          {{ hasProgress(book.novel_id) ? '继续阅读' : '开始阅读' }}
        </button>
        <button class="btn" @click.stop="$emit('toggle', book)">{{ inShelf ? '移出书架' : '加入书架' }}</button>
      </div>
      <p class="desc">{{ book.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Novel } from '../types/book'

const props = defineProps<{ book: Novel, inShelf?: boolean }>()
defineEmits<{ (e:'toggle', book: Novel): void }>()

const router = useRouter()

// 默认图片URL - 使用当前域名
const defaultImageUrl = `https://${window.location.hostname}/webp/2025/12/16/6f3b3649-f469-4497-a0a2-2966c98f3e91.webp`

// 存储已知无效的图片URL，避免重复请求
const invalidUrls = ref(new Set<string>())

// 获取图片URL，如果已知无效则返回默认图片
function getImageUrl(url: string): string {
  if (invalidUrls.value.has(url)) {
    return defaultImageUrl
  }
  return url
}

// 预加载图片并检测是否有效，设置1秒超时
function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    
    // 设置1秒超时
    const timeout = setTimeout(() => {
      img.src = '' // 清空src以取消加载
      resolve(false)
    }, 1000)
    
    // 如果图片加载完成，清除超时
    img.onload = () => {
      clearTimeout(timeout)
      resolve(true)
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      resolve(false)
    }
    
    img.src = url
  })
}

// 检查封面图片是否有效，无效则标记为已知无效
async function checkCoverImage(url: string) {
  const isValid = await preloadImage(url)
  if (!isValid) {
    invalidUrls.value.add(url)
  }
}

// 组件挂载时检查书籍封面
onMounted(() => {
  checkCoverImage(props.book.cover_url)
})

// 检查是否有阅读进度
function hasProgress(bookId: string) {
  return !!localStorage.getItem(`last-read-${bookId}`)
}

// 跳转到阅读页
function startReading(bookId: string) {
  const lastRead = localStorage.getItem(`last-read-${bookId}`)
  router.push(`/reader/${bookId}/${lastRead || '1'}`)
}
</script>

<style scoped>
.book {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr); /* 右侧区域最多 1fr，最小 0 */
  gap: 1rem;
  align-items: start;
  max-width: 100%; /* 卡片整体不会超过父级 */
  box-sizing: border-box;
  overflow: hidden; /* 防止内容撑破 */
}
.cover {
  aspect-ratio: 3 / 5;   /* 封面常见比例，3:5 */;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  border:1px solid var(--border);
}
.title {
  margin: 0;
  white-space: nowrap;      /* 不换行 */
  overflow: hidden;         /* 超出隐藏 */
  text-overflow: ellipsis;  /* 超出用省略号显示 */
}
.btn {
  white-space: nowrap;     /* 不换行 */
  flex-shrink: 0;          /* 不被压缩 */
}
.flex {
  display: flex;
  flex-wrap: nowrap;   /* 不允许换行 */
  gap: 8px;            /* 按钮间距 */
}
.desc { color: var(--muted); display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
</style>