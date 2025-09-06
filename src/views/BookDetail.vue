<template>
  <div class="grid" style="grid-template-rows: auto 1fr; gap: 16px;">
    <!-- 上方书籍信息 -->
    <!-- 上方书籍信息：复用 BookCard -->
    <BookCard
        v-if="book"
        :book="book"
        :inShelf="shelf.inShelf(book.novel_id)"
        @toggle="shelf.toggle"
    />

    <!-- 下方章节目录 -->
    <div class="card">
      <h3 style="margin:0">目录</h3>
      <ul class="chapters-grid">
        <li v-for="c in chapters_list" :key="c.chapter_index">
          <router-link :to="`/reader/${book?.novel_id}/${c.chapter_index}`">
            {{ c.title }}
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
import type {Novel, Chapter, ChapterDetail} from '../types/book'
import { useBookshelf } from '../stores/bookshelf'
import { useReadingProgress } from '../composables/useReadingProgress'

const route = useRoute()
const book = ref<Novel | null>(null)
const chapters = ref<Chapter[]>([])
const chapters_list = ref<ChapterDetail[]>([])
import BookCard from '../components/BookCard.vue'

const shelf = useBookshelf()
const { startReading } = useReadingProgress()

onMounted(async () => {
  const books = await fetchBooks()
  book.value = books.find(b => b.novel_id === route.params.id) || null

  if (book.value) {
    // 获取章节列表而不是整本章节内容
    chapters_list.value = await fetchChaptersList(book.value.novel_id)
  }
})
</script>
<style scoped>
.chapters-grid {
  list-style: none;
  padding: .25rem;
  margin-top: .5rem;
  display: grid;
  /* 自动分列，最小宽度 160px，不够就换行 */
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: .5rem;
  //max-height: 60vh;
  //overflow: auto;
}

.chapters-grid li a {
  display: block;
  padding: 4px 6px;
  border-radius: 4px;
  //color: var(--text);
  text-decoration: none;
  transition: background 0.2s;
}

.chapters-grid li a:hover {
  background: var(--hover, #f5f5f5);
}
</style>