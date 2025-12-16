<template>
  <div class="card book" @click="$router.push(`/book/${book.novel_id}`)">
    <img 
      :src="book.cover_url" 
      @error="onImageError"
      class="cover"
    />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Novel } from '../types/book'

const router = useRouter()
defineProps<{ book: Novel, inShelf?: boolean }>()
defineEmits<{ (e:'toggle', book: Novel): void }>()

// 默认图片URL - 使用当前域名
const defaultImageUrl = `https://${window.location.hostname}/webp/2025/12/16/6f3b3649-f469-4497-a0a2-2966c98f3e91.webp`

// 图片加载失败处理
function onImageError(event: Event) {
  const imgElement = event.target as HTMLImageElement
  // 检查当前图片是否已经是默认图片，避免循环错误
  if (imgElement.src !== defaultImageUrl) {
    imgElement.src = defaultImageUrl
  } else {
    // 如果默认图片也加载失败，则不进行任何操作或设置一个固定的后备方案
    // 这里我们简单地移除错误处理程序以防止进一步的错误处理
    imgElement.onerror = null
  }
}

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
  border:1px solid var(--border);
  object-fit: cover;
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