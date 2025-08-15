<template>
  <div class="card book" @click="$router.push(`/book/${book.id}`)">
    <div class="cover" :style="{ backgroundImage: `url(${book.cover})` }"></div>
    <div class="info">
      <h3 class="title">{{ book.title }}</h3>
      <p class="meta"><span class="badge">{{ book.author }}</span></p>
      <p class="desc">{{ book.description }}</p>
      <div class="flex mt-2">
        <button 
          class="btn primary" 
          @click.stop="startReading(book.id)"
        >
          开始阅读
        </button>
        <button class="btn" @click.stop="$emit('toggle', book)">{{ inShelf ? '移出书架' : '加入书架' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Book } from '@/types/book'

const router = useRouter()
defineProps<{ book: Book, inShelf?: boolean }>()
defineEmits<{ (e:'toggle', book: Book): void }>()

function startReading(bookId: string) {
  const lastRead = localStorage.getItem(`last-read-${bookId}`)
  router.push(`/reader/${bookId}/${lastRead || '1'}`)
}
</script>

<style scoped>
.book { display:grid; grid-template-columns: 120px 1fr; gap: 1rem; }
.cover { width: 120px; height: 160px; border-radius: 10px; background-size: cover; background-position: center; border:1px solid var(--border); }
.title { margin: 0; }
.desc { color: var(--muted); display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
</style>
