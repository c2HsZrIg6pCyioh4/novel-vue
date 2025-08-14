<template>
  <div>
    <Header />
    <main class="container" style="width:100%;">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from './views/Header.vue'
</script>