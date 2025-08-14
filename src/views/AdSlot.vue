<template>
  <div ref="adContainer" class="ad-slot">
    <!-- Google 测试广告 -->
    <ins class="adsbygoogle"
         data-ad-client="ca-pub-3940256099942544"
         data-ad-slot="6300978111"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'

const adContainer = ref<HTMLDivElement | null>(null)
let adLoaded = false

onMounted(async () => {
  // 确保 DOM 渲染完成
  await nextTick()

  // 动态加载 AdSense 脚本（只在未加载时）
  if (!(window as any).adsbygoogle) {
    const script = document.createElement('script')
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    script.async = true
    document.head.appendChild(script)
    script.onload = renderAd
  } else {
    renderAd()
  }

  // 窗口 resize 时重新渲染广告
  window.addEventListener('resize', renderAd)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderAd)
})

function renderAd() {
  if (!adContainer.value || adLoaded) return

  const tryRender = () => {
    const width = adContainer.value?.offsetWidth || 0
    if (width === 0) {
      requestAnimationFrame(tryRender)
      return
    }
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || []
      ;(window as any).adsbygoogle.push({})
      adLoaded = true
    } catch (e) {
      console.error('AdSense push failed', e)
    }
  }

  tryRender()
}
</script>

<style scoped>
.ad-slot {
  text-align: center;
  margin: 1rem auto;
  width: 100%;
  max-width: 400px;
  min-height: 100px;
  display: block;
  border: 1px solid red;
  visibility: visible; /* 确保容器可见 */
}
</style>