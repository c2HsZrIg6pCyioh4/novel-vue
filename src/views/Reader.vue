<template>
  <div class="card">
    <h2>{{ chapter?.title }}</h2>

    <!-- 小说内容显示 -->
    <div class="content" v-if="chapter?.content" @copy.prevent="onCopy">
      {{ chapter.content }}
    </div>

    <!-- 分页按钮 -->
    <div class="flex mt-3" style="justify-content: space-between;">
      <button class="btn" :disabled="!prevId" @click="go(prevId)">上一章</button>
      <button class="btn" :disabled="!nextId" @click="go(nextId)">下一章</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchChaptersList, fetchChapters } from '../api'
import type { Chapter } from '../types/book'

const route = useRoute()
const router = useRouter()

const chapter = ref<Chapter | null>(null)
const chaptersList = ref<Chapter[]>([])
const prevId = ref<string | null>(null)
const nextId = ref<string | null>(null)

// 加载章节列表（用于导航）
async function loadChaptersList(bookId: string) {
  const list = await fetchChaptersList(bookId)
  chaptersList.value = list // 使用接口返回的所有章节
}

// 加载单章内容，并处理上一章/下一章按钮
async function loadChapter(bookId: string, chapterId: string) {
  // 获取当前章节内容
  chapter.value = await fetchChapters(bookId, chapterId)

  // 找到当前章节在章节列表中的索引
  const idx = chaptersList.value.findIndex(c => c.id === chapterId)

  // 明确判断上一章
  prevId.value = idx > 0 ? chaptersList.value[idx - 1].id : null

  // 明确判断下一章（最后一章禁用）
  nextId.value = idx >= 0 && idx < chaptersList.value.length - 1
      ? chaptersList.value[idx + 1].id
      : null

  // 保存阅读进度
  localStorage.setItem(`last-read-${bookId}`, chapterId)
}

// 跳转章节
function go(chapterId: string | null) {
  if (chapterId) router.push(`/reader/${route.params.id}/${chapterId}`)
}

// 自定义复制事件，去掉换行
function onCopy(event: ClipboardEvent) {
  if (!chapter.value) return
  const text = chapter.value.content.replace(/\n/g, '')
  event.clipboardData?.setData('text/plain', text)
  event.preventDefault()
}

// 初始化
async function init() {
  const bookId = route.params.id as string
  const chapterId = route.params.chapter as string
  await loadChaptersList(bookId)       // 获取章节列表
  await loadChapter(bookId, chapterId) // 获取单章内容
}

onMounted(init)

// 监听路由变化切换章节
watchEffect(() => {
  const bookId = route.params.id as string
  const chapterId = route.params.chapter as string
  if (bookId && chapterId) loadChapter(bookId, chapterId)
})
</script>

<style scoped>
.card {
  max-width: 720px;
  margin: 0 auto;
  padding: 1rem;
  box-sizing: border-box;
}

.content {
  margin-top: 1.2rem;
  line-height: 1.8;
  font-size: 16px;
  color: var(--text);
  white-space: pre-wrap; /* 保留换行符，适合小说段落 */
  text-align: justify;
  padding: 0 4px;
  /* 可选首行缩进 */
  text-indent: 2em;
}

.flex {
  display: flex;
}

.mt-3 {
  margin-top: 1rem;
}

.btn {
  padding: 0.6em 1.2em;
  font-size: 0.95rem;
}
</style>