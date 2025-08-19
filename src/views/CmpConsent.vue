```html
<template>
  <div v-if="showConsent" class="cmp-banner" :class="{ 'show': showConsent }">
    <div class="cmp-content">
      <h3>Cookie 和隐私设置</h3>
      <p>我们和我们的合作伙伴使用 Cookie 和类似技术来个性化内容和广告、提供社交媒体功能以及分析流量。</p>

      <div class="cookie-types">
        <div class="cookie-type">
          <label>
            <input type="checkbox" v-model="consentPreferences.necessary" disabled checked>
            <span>必要 Cookie</span>
            <span class="cookie-desc">网站运行所必需的，无法关闭</span>
          </label>
        </div>
        <div class="cookie-type">
          <label>
            <input type="checkbox" v-model="consentPreferences.analytics">
            <span>分析 Cookie</span>
            <span class="cookie-desc">帮助我们了解网站使用情况</span>
          </label>
        </div>
        <div class="cookie-type">
          <label>
            <input type="checkbox" v-model="consentPreferences.marketing">
            <span>营销 Cookie</span>
            <span class="cookie-desc">用于个性化广告</span>
          </label>
        </div>
      </div>

      <div class="cmp-footer">
        <a href="/privacy" target="_blank" class="privacy-link">隐私政策</a>
        <div class="cmp-actions">
          <button class="btn decline" @click="savePreferences(false)">拒绝全部</button>
          <button class="btn accept" @click="savePreferences(true)">接受全部</button>
          <button class="btn save" @click="savePreferences()">保存设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { loadGA } from '../utils/loadGA'
import { ref, onMounted, reactive } from 'vue'

const showConsent = ref(false)
const consentPreferences = reactive({
  necessary: true,
  analytics: false,
  marketing: false
})

onMounted(() => {
  const consent = localStorage.getItem('cmp_consent')
  if (!consent) {
    setTimeout(() => showConsent.value = true, 1000)
  } else {
    const savedConsent = JSON.parse(consent)
    if (Date.now() - savedConsent.timestamp > 30 * 24 * 60 * 60 * 1000) {
      showConsent.value = true
    } else {
      Object.assign(consentPreferences, savedConsent.preferences)
      // 如果用户之前已同意过 analytics，直接加载 GA
      if (consentPreferences.analytics) {
        loadGA()
      }
    }
  }
})

function savePreferences(acceptAll = null) {
  if (acceptAll !== null) {
    consentPreferences.analytics = acceptAll
    consentPreferences.marketing = acceptAll
  }

  localStorage.setItem('cmp_consent', JSON.stringify({
    preferences: consentPreferences,
    timestamp: Date.now()
  }))
  
  // ✅ 只有在用户勾选了 "分析 Cookie" 时才加载 GA
  if (consentPreferences.analytics) {
    loadGA()
  }
  // Close the banner after saving
  showConsent.value = false
}
</script>

<style>
.cmp-banner {
  position: fixed;
  bottom: -100%;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 0.8rem;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  z-index: 1000;
}

.cmp-banner.show {
  bottom: 0;
}

.cmp-content {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 1rem;
}

.cmp-content h3 {
  margin-top: 0;
  margin-bottom: 0.6rem;
  font-size: 1.1rem;
}

.cmp-content p {
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.cookie-types {
  margin: 0.8rem 0;
}

.cookie-type {
  padding: 0.4rem 0;
  border-bottom: 1px solid #eee;
}

.cookie-type label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
}

.cookie-desc {
  font-size: 0.8rem;
  color: #666;
  margin-left: 1.6rem;
}

.cmp-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.privacy-link {
  color: #1890ff;
  text-decoration: none;
  font-size: 0.9rem;
}

.cmp-actions {
  display: flex;
  gap: 0.6rem;
}

.btn {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn.decline {
  background: #f0f0f0;
  color: #333;
}

.btn.accept {
  background: #1890ff;
  color: white;
}

.btn.save {
  background: transparent;
  border: 1px solid #1890ff;
  color: #1890ff;
}

.btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .cmp-content {
    padding: 0 1rem;
  }

  .cmp-footer {
    flex-direction: column;
    gap: 0.8rem;
    align-items: flex-start;
  }

  .cmp-actions {
    width: 100%;
    justify-content: space-between;
  }

  .btn {
    flex: 1;
    margin: 0 2px;
  }
}
</style>
```