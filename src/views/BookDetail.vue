<template>
  <div class="grid" style="grid-template-columns: 2fr 1fr; gap: 16px;">
    <!-- 左侧书籍信息 -->
    <div class="card">
      <div class="flex">
        <img :src="book?.cover" style="width:120px;height:160px;border-radius:10px;border:1px solid var(--border)" />
        <div style="margin-left:12px">
          <h2 style="margin:0">{{ book?.title }}</h2>
          <p class="mt-2"><span class="badge">{{ book?.author }}</span></p>
          <p class="mt-2" style="color:var(--muted)">{{ book?.description }}</p>
          <div class="flex mt-2" style="gap:8px;">
            <button
                class="btn primary"
                @click="book?.id && startReading(book.id)"
            >
              开始阅读
            </button>
            <button class="btn" @click="book && shelf.toggle(book)">
              {{ book && shelf.inShelf(book.id) ? '移出书架' : '加入书架' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧章节目录 -->
    <div class="card">
      <h3 style="margin:0">目录</h3>
      <ul
          style="list-style:none;padding:0;margin-top:.5rem;display:grid;gap:.25rem;max-height:60vh;overflow:auto;"
      >
        <li v-for="c in chapters" :key="c.id">
          <router-link :to="`/reader/${book?.id}/${c.id}`">
            {{ c.id }}. {{ c.title }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchBooks, fetchChaptersList } from '../api'
import type { Book, Chapter } from '../types/book'
import { useBookshelf } from '../stores/bookshelf'
import { useReadingProgress } from '../composables/useReadingProgress'

const route = useRoute()
const book = ref<Book | null>(null)
const chapters = ref<Chapter[]>([])
const shelf = useBookshelf()
const { startReading } = useReadingProgress()

onMounted(async () => {
  const books = await fetchBooks()
  book.value = books.find(b => b.id === route.params.id) || null

  if (book.value) {
    // 获取章节列表而不是整本章节内容
    chapters.value = await fetchChaptersList(book.value.id)
  }
})
</script>
