<template>
  <div>
    <div class="grid cols-3 mt-3">
      <BookCard v-for="b in books" :key="b.id" :book="b" :in-shelf="shelf.inShelf(b.id)" @toggle="shelf.toggle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchBooks } from '../api'
import type { Book } from '../types/book'
import { useBookshelf } from '../stores/bookshelf'
import BookCard from '../components/BookCard.vue'

const books = ref<Book[]>([])
const shelf = useBookshelf()

onMounted(async () => {
  books.value = await fetchBooks()
})
</script>