<template>
  <div>
    <h2>🔍 搜索书籍</h2>
    <input v-model="keyword" class="input mt-2" placeholder="输入书名或作者" />
    <div class="grid cols-3 mt-3">
      <BookCard v-for="b in filtered" :key="b.novel_id" :book="b" :in-shelf="shelf.inShelf(b.novel_id)" @toggle="shelf.toggle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchBooks } from '../api'
import type { Novel } from '../types/book'
import { useBookshelf } from '../stores/bookshelf'
import BookCard from '../components/BookCard.vue'

const books = ref<Novel[]>([])
const keyword = ref('')
const shelf = useBookshelf()

const filtered = computed(() =>
    books.value.filter(b => b.name.includes(keyword.value) || b.author.includes(keyword.value))
)

onMounted(async () => {
  books.value = await fetchBooks()
})
</script>