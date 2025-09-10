<template>
  <div class="card book" @click="$router.push(`/book/${book.novel_id}`)">
    <div class="cover" :style="{ backgroundImage: `url(${book.cover_url})` }"></div>
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
import { useRouter } from 'vue-router'
import type { Novel } from '../types/book'

const router = useRouter()
defineProps<{ book: Novel, inShelf?: boolean }>()
defineEmits<{ (e:'toggle', book: Novel): void }>()
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
