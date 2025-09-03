<template>
  <div>
    <!-- 加载中动画 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>数据加载中...</p>
    </div>

    <!-- 数据展示 -->
    <div v-else>
      <!-- 本月强推 - 热门推荐 -->
      <section v-if="hotBooks.length > 0" class="section">
        <h2 class="section-title">🔥 本月强推 · 热门推荐</h2>
        <div class="grid cols-3 mt-3">
          <BookCard
              v-for="b in hotBooks"
              :key="b.novel_id"
              :book="b"
              :in-shelf="shelf.inShelf(b.novel_id)"
              @toggle="shelf.toggle"
              @start-reading="startReading"
          />
        </div>
      </section>

      <!-- 最新书籍 -->
      <section v-if="latestBooks.length > 0" class="section">
        <h2 class="section-title">🆕 最新书籍</h2>
        <div class="grid cols-3 mt-3">
          <BookCard
              v-for="b in latestBooks"
              :key="b.novel_id"
              :book="b"
              :in-shelf="shelf.inShelf(b.novel_id)"
              @toggle="shelf.toggle"
              @start-reading="startReading"
          />
        </div>
      </section>

      <!-- 全部书籍（分类展示） -->
      <section v-if="books.length > 0" class="section">
        <h2 class="section-title">📚 全部分类</h2>
        <div v-for="(list, category) in categorizedBooks" :key="category" class="category">
          <h3 class="category-title">{{ category }}</h3>
          <div class="grid cols-3 mt-2">
            <BookCard
                v-for="b in list"
                :key="b.novel_id"
                :book="b"
                :in-shelf="shelf.inShelf(b.novel_id)"
                @toggle="shelf.toggle"
                @start-reading="startReading"
            />
          </div>
        </div>
      </section>

      <!-- 无数据时显示重置按钮 -->
      <div v-else-if="showReset" class="reset-btn">
        <p>暂无数据或服务器异常</p>
        <button class="btn" @click="resetServer">重置服务器</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchBooks } from '../api'
import type { Novel } from '../types/book'
import { useBookshelf } from '../stores/bookshelf'
import BookCard from '../components/BookCard.vue'
import { clearServerCache } from '../api'

const books = ref<Novel[]>([])
const hotBooks = ref<Novel[]>([]) // 热门推荐
const latestBooks = ref<Novel[]>([]) // 最新书籍
const shelf = useBookshelf()
const router = useRouter()
const showReset = ref(false)
const loading = ref(true) // 控制加载动画

onMounted(() => {
  // 启动 10 秒超时
  const timeoutId = setTimeout(() => {
    if (books.value.length === 0) {
      showReset.value = true
      loading.value = false
    }
  }, 10000)

  // 拉取书籍数据
  fetchBooks()
      .then(data => {
        books.value = data
        if (books.value.length > 0) {
          // 模拟分类
          hotBooks.value = data.slice(0, 6) // 前 6 本当热门推荐
          latestBooks.value = [...data].reverse().slice(0, 6) // 最新书籍（反转取前 6）
          showReset.value = false
          loading.value = false
          clearTimeout(timeoutId)
        }
      })
      .catch(err => {
        console.error('获取书籍列表失败', err)
        books.value = []
      })
})

function resetServer() {
  clearServerCache()
  window.location.reload()
}

// 分类（假设 Novel 有 category 字段）
const categorizedBooks = computed(() => {
  const map: Record<string, Novel[]> = {}
  books.value.forEach(b => {
    const cat = b.category || '其他'
    if (!map[cat]) map[cat] = []
    map[cat].push(b)
  })
  return map
})

function startReading(bookId: string) {
  const lastRead = localStorage.getItem(`last-read-${bookId}`)
  if (lastRead) {
    router.push(`/reader/${bookId}/${lastRead}`)
  } else {
    router.push(`/reader/${bookId}/1`)
  }
}
</script>

<style scoped>
.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: .5rem;
  color: var(--text, #333);
}

.category {
  margin-top: 1rem;
}

.category-title {
  font-size: 1rem;
  font-weight: 500;
  margin: .5rem 0;
  color: var(--muted, #666);
}
</style>