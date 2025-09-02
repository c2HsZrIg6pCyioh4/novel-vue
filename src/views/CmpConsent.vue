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
        <!-- 点击时打开弹窗 -->
        <a href="javascript:void(0)" @click="showPrivacy = true" class="privacy-link">隐私政策</a>
        <div class="cmp-actions">
          <button class="btn decline" @click="savePreferences(false)">拒绝全部</button>
          <button class="btn accept" @click="savePreferences(true)">接受全部</button>
          <button class="btn save" @click="savePreferences()">保存设置</button>
        </div>
      </div>
    </div>
  </div>
  <!-- 隐私政策弹窗 -->
  <div v-if="showPrivacy" class="privacy-modal">
    <div class="privacy-content">
      <h2>隐私政策</h2>
      <p>我们非常重视您的隐私。本政策解释了我们如何收集、使用和保护您的个人信息。</p>
      <ul>
        <li>我们只会收集为提供服务所必需的数据。</li>
        <li>您的数据不会被出售或出租给第三方。</li>
        <li>部分 Cookie 用于提升用户体验，例如记住登录状态。</li>
        <li>分析 Cookie 用于了解用户行为，以优化网站功能。</li>
        <li>营销 Cookie 可能用于个性化广告。</li>
      </ul>
      <p>更多详情请随时联系我们。</p>

      <div class="modal-actions">
        <button class="btn" @click="showPrivacy = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { loadGA } from '../utils/loadGA'
import { ref, onMounted, reactive } from 'vue'

const showConsent = ref(false)
const showPrivacy = ref(false)
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
/* ✅ 隐私政策弹窗样式 */
.privacy-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.privacy-content {
  background: white;
  padding: 1.5rem;
  max-width: 600px;
  max-height: 80%;
  overflow-y: auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}

.privacy-content h2 {
  margin-top: 0;
}
</style>
```