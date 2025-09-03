<template>
  <div>
    <Header />
    <main class="container" style="width:100%;">
      <router-view />
    </main>
    <Footer />
    <CmpConsent/>
  </div>
</template>

<script setup lang="ts">
import Header from './views/Header.vue'
import Footer from './views/Footer.vue'
import CmpConsent from "./views/CmpConsent.vue";
</script>