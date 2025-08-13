<template>
  <div>
    <h2>📖 我的书架</h2>
    <div v-if="shelf.items.length === 0" style="color:var(--muted);margin-top:1rem;">书架为空</div>
    <div class="grid cols-3 mt-3">
      <BookCard v-for="b in shelf.items" :key="b.id" :book="b" :in-shelf="true" @toggle="shelf.toggle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookshelf } from '../stores/bookshelf'
import BookCard from '../components/BookCard.vue'

const shelf = useBookshelf()
</script>