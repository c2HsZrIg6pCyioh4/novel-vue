<template>
  <div class="reader-container">
    <h1>
      {{ chapter?.title }}
      <!-- 听书按钮 -->
      <button v-if="showListenBtn" class="listen-btn" @click="openPlayer">🎧 听书</button>
    </h1>

    <!-- 小说内容 -->
    <div class="content" v-if="chapter?.content">
      <p v-for="(para, pIndex) in parsedContent" :key="pIndex">
        <span
            v-for="(sent, sIndex) in para.sentences"
            :key="sIndex"
            :class="{
              'highlight': showPlayerFlag && pIndex === currentParaIndex && sIndex === currentSentenceIndex
            }"
        >
          {{ sent.text }}
        </span>
      </p>
      <!-- 隐形下一章链接，用于 SEO / 预加载 -->
      <i v-if="nextChapterLink" style="height:0;opacity:0;">
        <a :href="nextChapterLink">下一章</a>
      </i>
      <i v-if="nextChapterLink" style="height:0;opacity:0;">
        <a :href="nextChapterLink+'.html'">下一章</a>
      </i>
    </div>

    <!-- 分页导航 -->
    <div class="chapter-nav">
      <button class="nav-btn" :disabled="!prevId" @click="go(prevId)">上一章</button>
      <button class="nav-btn middle-btn" @click="goToToc">目录</button>
      <button class="nav-btn" :disabled="!nextId" @click="go(nextId)">下一章</button>
    </div>

    <!-- TTS 播放器悬浮 -->
    <TTSPlayer
        v-if="showPlayerFlag"
        :sentences="parsedSentences"
        :startIndex="globalSentenceIndex"
        @update:currentIndex="onSentenceUpdate"
        @close="closePlayer"
    />

    <AdSlot />
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchChaptersList, fetchChapters } from '../api'
import type { Chapter, ChapterDetail } from '../types/book'
import TTSPlayer from './TTSPlayer.vue'
import AdSlot from './AdSlot.vue'
import { normalizeChapterId } from '../utils/normalize'

interface ParsedSentence { text: string; }
interface ParsedParagraph { sentences: ParsedSentence[] }

export default {
  name: 'Reader',
  components: { TTSPlayer, AdSlot },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const chapter = ref<Chapter | null>(null)
    const chaptersList = ref<ChapterDetail[]>([])
    const prevId = ref<string | null>(null)
    const nextId = ref<string | null>(null)

    const parsedContent = ref<ParsedParagraph[]>([])
    const parsedSentences = computed(() => parsedContent.value.flatMap(p => p.sentences.map(s => s.text)))

    const currentParaIndex = ref(0)
    const currentSentenceIndex = ref(0)
    const globalSentenceIndex = ref(0)

    const showPlayerFlag = ref(false)
    const showListenBtn = ref(true)

    const parseContent = (text: string) => {
      const paragraphs: ParsedParagraph[] = []
      const paras = text.split(/\n+/)
      paras.forEach(p => {
        const sentences: ParsedSentence[] = []
        p.split(/([。？！])/).forEach((s) => {
          if (!s) return
          if (/[。？！]/.test(s)) {
            sentences[sentences.length-1].text += s
          } else {
            sentences.push({ text: s })
          }
        })
        if (sentences.length) paragraphs.push({ sentences })
      })
      return paragraphs
    }

    const loadChaptersList = async (bookId: string) => {
      chaptersList.value = await fetchChaptersList(bookId)
    }

    const loadChapter = async (bookId: string, chapterId: string) => {
      chapter.value = await fetchChapters(bookId, chapterId)
      document.title = chapter.value?.title || '阅读器'
      parsedContent.value = chapter.value?.content ? parseContent(chapter.value.content) : []
      currentParaIndex.value = 0
      currentSentenceIndex.value = 0
      globalSentenceIndex.value = 0

      const idx = chaptersList.value.findIndex(c => c.chapter_index === Number(chapterId))
      prevId.value = idx > 0 ? chaptersList.value[idx-1].chapter_index : null
      nextId.value = idx >=0 && idx < chaptersList.value.length-1 ? chaptersList.value[idx+1].chapter_index : null

      localStorage.setItem(`last-read-${bookId}`, chapterId)
    }

    const go = (chapterId: string | null) => { if (chapterId) router.push(`/reader/${route.params.id}/${chapterId}`) }
    const goToToc = () => { router.push(`/book/${route.params.id}`) }

    const startReading = () => {
      const lastRead = localStorage.getItem(`last-read-${route.params.id}`)
      const firstChapterId = chaptersList.value[0]?.chapter_index
      if (lastRead) go(lastRead)
      else if (firstChapterId) go(firstChapterId)
    }

    const openPlayer = () => {
      showPlayerFlag.value = true
      showListenBtn.value = false

      // 从上次朗读位置设置高亮
      currentParaIndex.value = 0
      currentSentenceIndex.value = 0
      let count = 0
      for (let p = 0; p < parsedContent.value.length; p++) {
        const para = parsedContent.value[p]
        if (globalSentenceIndex.value < count + para.sentences.length) {
          currentParaIndex.value = p
          currentSentenceIndex.value = globalSentenceIndex.value - count
          break
        }
        count += para.sentences.length
      }
    }

    const closePlayer = () => {
      showPlayerFlag.value = false
      showListenBtn.value = true
      // 高亮保留在最后朗读位置
    }

    const onSentenceUpdate = (index: number) => {
      globalSentenceIndex.value = index
      let count = 0
      for (let p=0;p<parsedContent.value.length;p++){
        const para = parsedContent.value[p]
        if (index < count + para.sentences.length){
          currentParaIndex.value = p
          currentSentenceIndex.value = index - count
          nextTick(() => {
            const el = document.querySelector('.highlight') as HTMLElement
            if (el) el.scrollIntoView({ behavior:'smooth', block:'center' })
          })
          break
        }
        count += para.sentences.length
      }
    }

    const init = async () => {
      const bookId = route.params.id as string
      const chapterId = normalizeChapterId(route.params.chapter)
      await loadChaptersList(bookId)
      await loadChapter(bookId, chapterId)
    }

    onMounted(init)

    watch([() => route.params.id, () => route.params.chapter], async ([bookId, chapterId]) => {
      if (!bookId || !chapterId) return
      await loadChapter(bookId as string, normalizeChapterId(chapterId))
    })
    const nextChapterLink = computed(() => {
      const bookId = route.params.id
      const next = nextId.value
      return next ? `/reader/${bookId}/${next}` : ''
    })
    return {
      chapter, prevId, nextId, parsedContent, parsedSentences,
      currentParaIndex, currentSentenceIndex, globalSentenceIndex,
      go, goToToc, startReading, onSentenceUpdate,
      showPlayerFlag, showListenBtn, openPlayer, closePlayer,nextChapterLink
    }
  }
}
</script>

<style scoped>
.reader-container { max-width: 720px; margin:0 auto; padding:1rem; }
.content { margin-top:1rem; line-height:1.8; text-align:justify; }
.content span { cursor:pointer; transition:background 0.2s; }
.content span.highlight { background:#fff9c4; border-radius:4px; padding:2px 4px; box-shadow:0 0 0 2px rgba(255,235,59,0.3);}
.chapter-nav { display:flex; justify-content:space-between; margin-top:1rem; gap:8px; }
.nav-btn { flex:1; max-width:120px; padding:0.6em 0; border-radius:8px; background:#2563eb; color:#fff; border:none; cursor:pointer; }
.nav-btn.middle-btn { background:#10b981; }
.nav-btn:disabled { background:#cbd5e1; cursor:not-allowed; }
.start-btn { display:block; margin:1rem auto; padding:0.8em 1.6em; font-size:1.1rem; }
.listen-btn {
  margin-left: 12px;
  background: #2563eb;
  color: #fff;
  border-radius: 6px;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
}
</style>