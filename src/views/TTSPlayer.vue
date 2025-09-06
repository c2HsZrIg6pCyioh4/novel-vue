<template>
  <div
      class="tts-player"
      :class="{ 'tts-player--playing': isPlaying, mini: isMini }"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
  >
    <!-- 播放按钮 -->
    <!-- 播放按钮，仅正常模式显示 -->
    <button
        v-if="!isMini"
        class="tts-btn tts-btn--play"
        :class="{ 'tts-btn--pulse': isPlaying && isHovered }"
        @click="togglePlay"
        :aria-label="isPlaying ? '暂停朗读' : '开始朗读'"
    >
      <span v-if="isPlaying">⏸️</span>
      <span v-else>▶️</span>
    </button>

    <!-- 切换 TTS 模式 -->
    <button v-if="!isMini" class="tts-btn tts-btn--mode" @click="toggleMode">
      {{ mode === 'local' ? '本地语音' : '真人音色' }}
    </button>
    <!-- 倍速选择（迷你模式隐藏） -->
    <div class="tts-speed" v-if="!isMini">
      <label class="tts-speed-label">倍速</label>
      <div class="tts-speed-select-wrapper">
        <select
            v-model.number="rate"
            @change="changeRate"
            class="tts-speed-select"
            aria-label="选择朗读速度"
        >
          <option v-for="r in speedOptions" :key="r" :value="r">{{ r }}x</option>
        </select>
        <span class="tts-speed-arrow">▼</span>
      </div>
    </div>

    <!-- 关闭按钮，仅正常模式显示 -->
    <button
        v-if="!isMini"
        class="tts-btn tts-btn--close"
        @click="closePlayer"
    >
      ✖️
    </button>
    <!-- 迷你模式打开正常模式按钮 -->
    <button
        v-if="isMini"
        class="tts-btn tts-btn--mini-open"
        @click.stop="restoreNormalMode"
        aria-label="打开完整播放器"
    >
      🎧
    </button>
  </div>
</template>

<script lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'

export default {
  name: 'TTSPlayer',
  props: {
    sentences: { type: Array as () => string[], required: true },
    startIndex: { type: Number, default: 0 }
  },
  emits: ['update:currentIndex', 'close'],
  setup(props, { emit }) {
    const isPlaying = ref(false)
    const rate = ref(1)
    const currentIndex = ref(props.startIndex)
    const isHovered = ref(false)
    const isMini = ref(false)
    const mode = ref<'local' | 'api'>('local') // TTS 模式：local 或 api
    let audio: HTMLAudioElement | null = null
    let utterance: SpeechSynthesisUtterance | null = null

    const speedOptions = [0.8, 1, 1.2, 1.5, 2]

    const speakNext = async () => {
      if (currentIndex.value >= props.sentences.length) {
        isPlaying.value = false
        return
      }
      const text = props.sentences[currentIndex.value]

      if (mode.value === 'local') {
        utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = rate.value
        const voices = window.speechSynthesis.getVoices()
        utterance.voice = voices.find(v => v.lang.startsWith('zh')) || null

        utterance.onend = () => {
          currentIndex.value++
          emit('update:currentIndex', currentIndex.value)
          nextTick(() => { if (isPlaying.value) speakNext() })
        }
        utterance.onerror = () => {
          console.error('本地朗读失败')
          isPlaying.value = false
        }
        window.speechSynthesis.speak(utterance)
      } else {
        // 使用外部 API
        utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = rate.value
        const voices = window.speechSynthesis.getVoices()
        utterance.voice = voices.find(v => v.name === 'Ting-Ting')|| null

        utterance.onend = () => {
          currentIndex.value++
          emit('update:currentIndex', currentIndex.value)
          nextTick(() => { if (isPlaying.value) speakNext() })
        }
        utterance.onerror = () => {
          console.error('本地朗读失败')
          isPlaying.value = false
        }
        window.speechSynthesis.speak(utterance)
      }
      emit('update:currentIndex', currentIndex.value)
    }

    const togglePlay = () => {
      if (isPlaying.value) pause()
      else play()
    }

    const play = () => {
      if (!props.sentences.length) return
      isPlaying.value = true
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
      else speakNext()
    }

    const pause = () => {
      isPlaying.value = false
      window.speechSynthesis.pause()
    }

    const stop = () => {
      isPlaying.value = false
      window.speechSynthesis.cancel()
    }

    const changeRate = () => {
      if (isPlaying.value) {
        stop()
        nextTick(() => play())
      }
    }

    watch(() => props.sentences, () => {
      stop()
      currentIndex.value = props.startIndex
    })

    onBeforeUnmount(() => stop())

    // ---------- 迷你模式 ----------
    const startX = ref(0)
    const deltaX = ref(0)

    const onTouchStart = (e: TouchEvent) => { startX.value = e.touches[0].clientX; deltaX.value = 0 }
    const onTouchMove = (e: TouchEvent) => {
      deltaX.value = e.touches[0].clientX - startX.value
      if (deltaX.value > 50 && !isMini.value) isMini.value = true
    }
    const onTouchEnd = () => {}

    const closePlayer = () => {
      stop()
      isMini.value = false
      emit('close')
    }
    const restoreNormalMode = () => {
      isMini.value = false
    }
    const toggleMode = () => {
      mode.value = mode.value === 'local' ? 'api' : 'local'
    }
    return {
      isPlaying, togglePlay, rate, changeRate,
      isHovered, speedOptions, isMini,
      onTouchStart, onTouchMove, onTouchEnd, closePlayer,restoreNormalMode,mode, toggleMode
    }
  },
}
</script>

<style scoped>
.tts-player {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(220, 220, 220, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  padding: 16px 20px 16px 16px; /* 右侧留空间给关闭按钮 */
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.tts-player.mini {
  width: 60px;
  height: 60px;
  padding: 4px;
  border-radius: 50%;
  font-size: 0;
  justify-content: center;
}

.tts-player--playing {
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.25), 0 2px 8px rgba(37, 99, 235, 0.12);
}

/* ===== 关闭按钮 - 右上角定位 ===== */
.tts-btn--close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  font-size: 14px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.tts-btn--close:hover {
  opacity: 1;
  background: #dc2626;
  transform: scale(1.1);
}

.tts-player.mini:hover .tts-btn--close {
  opacity: 0.8;
  transform: scale(1.2);
  pointer-events: auto;
}
.tts-btn--close:active {
  transform: scale(0.95);
  background: #dc2626;
}

/* ===== 播放按钮 ===== */
.tts-btn--play {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.25s ease;
}

.tts-btn--play:hover {
  transform: translateY(-1px) scale(1.03);
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.tts-btn--pulse {
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1) translateY(-1px);
  }
  50% {
    transform: scale(1.08) translateY(-1px);
  }
}

/* ===== 倍速选择器 ===== */
.tts-speed {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.tts-speed-label {
  font-weight: 500;
  color: #333;
  opacity: 0.85;
  white-space: nowrap;
}

.tts-speed-select-wrapper {
  position: relative;
  min-width: 64px;
}

.tts-speed-select {
  appearance: none;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 6px 26px 6px 10px;
  color: #333;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.tts-speed-select:hover {
  background: rgba(255, 255, 255, 0.6);
}

.tts-speed-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 10px;
  opacity: 0.7;
}
/* 新增迷你模式打开按钮 */
.tts-btn--mini-open {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #2563eb;
  color: white;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.tts-btn--mini-open:hover {
  background: #1d4ed8;
}
</style>