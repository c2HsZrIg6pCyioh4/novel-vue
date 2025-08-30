<template>
  <h2>{{ chapter?.title }}</h2>
  
  <!-- 开始阅读按钮 -->
  <button 
    v-if="!chapter?.content" 
    class="btn start-btn" 
    @click="startReading"
  >
    开始阅读
  </button>

  <!-- 小说内容显示 -->
  <div class="content" v-if="chapter?.content" v-html="renderedMarkdown"></div>
  <!-- 分页按钮 -->
  <div class="flex mt-3" style="justify-content: space-between;">
    <button class="btn" :disabled="!prevId" @click="go(prevId)">上一章</button>
    <button class="btn" :disabled="!nextId" @click="go(nextId)">下一章</button>
  </div>
  <!-- 引入广告组件 -->
  <AdSlot />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchChaptersList, fetchChapters } from '../api'
import type {Chapter, ChapterDetail} from '../types/book'
import AdSlot from './AdSlot.vue' // 引入广告组件
import CmpConsent from './CmpConsent.vue' // 引入广告组件
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()

const chapter = ref<Chapter | null>(null)
const chaptersList = ref<ChapterDetail[]>([])
const prevId = ref<string | null>(null)
const nextId = ref<string | null>(null)

// Markdown 渲染
const renderedMarkdown = computed(() => {
  // 简单处理换行 -> <p>
  if (!chapter.value?.content) return ''
  return chapter.value.content
      .split(/\n+/)
      .map(p => `<p>${p.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`)
      .join('')
})

// 加载章节列表（用于导航）
async function loadChaptersList(bookId: string) {
  const list = await fetchChaptersList(bookId)
  chaptersList.value = list // 使用接口返回的所有章节
}

// 加载单章内容，并处理上一章/下一章按钮
async function loadChapter(bookId: string, chapterId: string) {
  // 获取当前章节内容
  chapter.value = await fetchChapters(bookId, chapterId)
// 更新页面标题为章节标题
  if (chapter.value?.title) {
    document.title = chapter.value.title
  }
  // 找到当前章节在章节列表中的索引
  const idx = chaptersList.value.findIndex(c => c.chapter_index === Number(chapterId))
  // 明确判断上一章
  prevId.value = idx > 0 ? chaptersList.value[idx - 1].chapter_index : null

  // 明确判断下一章（最后一章禁用）
  nextId.value = idx >= 0 && idx < chaptersList.value.length - 1
      ? chaptersList.value[idx + 1].chapter_index
      : null

  // 保存阅读进度
  localStorage.setItem(`last-read-${bookId}`, chapterId)
}

// 跳转章节
function go(chapterId: string | null) {
  if (chapterId) router.push(`/reader/${route.params.id}/${chapterId}`)
}

// 开始阅读 - 跳转到上次阅读位置或第一章
function startReading() {
  const bookId = route.params.id as string
  const lastRead = localStorage.getItem(`last-read-${bookId}`)
  const firstChapterId = chaptersList.value[0]?.chapter_index
  
  if (lastRead) {
    go(lastRead)
  } else if (firstChapterId) {
    go(firstChapterId)
  }
}


const hasLoadedChapter = ref(false)  // 新增 flag
async function init() {
  const bookId = route.params.id as string
  const chapterId = route.params.chapter as string
  await loadChaptersList(bookId)
  if (!hasLoadedChapter.value) {
    await loadChapter(bookId, chapterId)
    hasLoadedChapter.value = true
  }
}

onMounted(async () => {
  const bookId = route.params.id as string
  const chapterId = route.params.chapter as string
  await loadChaptersList(bookId)
  if (!hasLoadedChapter.value) {
    await loadChapter(bookId, chapterId)
    hasLoadedChapter.value = true
  }
})

// 只在切换章节时加载，不重复加载
watch(
    () => [route.params.id, route.params.chapter],
    async ([bookId, chapterId], [oldBookId, oldChapterId]) => {
      if (!bookId || !chapterId) return
      // 跳过首次初始化
      if (!hasLoadedChapter.value) return
      // 仅在路由参数变化时加载
      if (bookId !== oldBookId || chapterId !== oldChapterId) {
        await loadChapter(bookId, chapterId)
      }
    }
)
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
  text-align: justify;
  padding: 0 4px;
}

.content p {
  text-indent: 2em;
  margin-bottom: 1em;
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

.start-btn {
  display: block;
  margin: 1rem auto;
  padding: 0.8em 1.6em;
  font-size: 1.1rem;
}
</style>
