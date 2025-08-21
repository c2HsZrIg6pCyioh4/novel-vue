<template>
  <div>
    <div class="grid cols-3 mt-3">
      <BookCard 
      v-for="b in books" 
      :key="b.novel_id"
      :book="b" 
      :in-shelf="shelf.inShelf(b.novel_id)"
      @toggle="shelf.toggle"
      @start-reading="(bookId) => {
        const lastRead = localStorage.getItem(`last-read-${bookId}`)
        if (lastRead) {
          router.push(`/reader/${bookId}/${lastRead}`)
        } else {
          router.push(`/reader/${bookId}/1`) // Assuming first chapter ID is '1'
        }
      }"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchBooks } from '../api'
import type { Novel } from '../types/book'
import { useBookshelf } from '../stores/bookshelf'
import BookCard from '../components/BookCard.vue'

const books = ref<Novel[]>([])
const shelf = useBookshelf()
const router = useRouter()

onMounted(async () => {
  books.value = await fetchBooks()
})
</script>
