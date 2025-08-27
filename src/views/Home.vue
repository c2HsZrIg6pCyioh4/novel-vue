<template>
  <div>
    <!-- 加载中动画 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>数据加载中...</p>
    </div>

    <!-- 数据列表 -->
    <div v-else-if="books.length > 0" class="grid cols-3 mt-3">
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
            router.push(`/reader/${bookId}/1`)
          }
        }"
      />
    </div>

    <!-- 无数据时显示重置按钮 -->
    <div v-else-if="showReset" class="reset-btn">
      <p>暂无数据或服务器异常</p>
      <button class="btn" @click="resetServer">重置服务器</button>
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
import { clearServerCache } from '../api'

const books = ref<Novel[]>([])
const shelf = useBookshelf()
const router = useRouter()
const showReset = ref(false)
const loading = ref(true) // 控制加载动画

onMounted(() => {
  // 启动 10 秒超时
  const timeoutId = setTimeout(() => {
    if (books.value.length === 0) {
      showReset.value = true
      loading.value = false // 超时后隐藏动画
    }
  }, 10000)

  // 拉取书籍数据
  fetchBooks()
      .then(data => {
        books.value = data
        if (books.value.length > 0) {
          showReset.value = false
          loading.value = false // 数据返回后隐藏动画
          clearTimeout(timeoutId) // 有数据就取消超时
        }
      })
      .catch(err => {
        console.error('获取书籍列表失败', err)
        books.value = []
        // 不立即隐藏 loading，让 10 秒超时来显示重置按钮
      })
})

function resetServer() {
  clearServerCache()
  window.location.reload()
}
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #ddd;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reset-btn {
  margin-top: 20px;
  text-align: center;
}
.btn {
  padding: 0.5rem 1rem;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn:hover {
  background: #d9363e;
}
</style>