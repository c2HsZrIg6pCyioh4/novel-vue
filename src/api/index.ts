import type { Chapter, ChapterDetail, Novel} from '@/types/book'

const STORAGE_KEY = 'novel_servers' // 保存 server 地址列表
const CACHE_KEY = 'novel_servers_cache' // 保存每个 server 的健康检查时间
let serverAddress = window.location.origin
const CACHE_DURATION = 5 * 60 * 1000 // 5 分钟

interface CachedServer {
    server: string
    lastCheck: number
}

interface ServerResult {
    default: string
    available: string[]
}

// 健康检查，并更新缓存
async function checkServerWithCache(server: string, cache: CachedServer[]): Promise<boolean> {
    const now = Date.now()
    let cached = cache.find(c => c.server === server)
    try {
        const testUrl = `${server}/health`
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        const res = await fetch(testUrl, { signal: controller.signal })
        clearTimeout(timeout)
        const ok = res.ok
        if (cached) cached.lastCheck = now
        else cache.push({ server, lastCheck: now })
        return ok
    } catch {
        if (cached) cached.lastCheck = now
        else cache.push({ server, lastCheck: now })
        return false
    } finally {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    }
}

export async function initServerAddresses(): Promise<void> {
    const currentOrigin = window.location.origin
    let servers: string[] = []

    try {
        const res = await fetch(`${currentOrigin}/novel/server.json`)
        if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 0) {
                for (const item of data) {
                    const server = item?.server_address
                    if (server?.startsWith('http')) {
                        const cache: CachedServer[] = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
                        const isHealthy = await checkServerWithCache(server, cache)
                        if (isHealthy) servers.push(server)
                    }
                }
            }
        }
    } catch {
        // 忽略异常
    }

    if (servers.length === 0) servers = [currentOrigin]

    serverAddress = servers[0]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servers))
}

// 获取默认 server（随机）以及可用 server 列表
export async function getServerAddress(): Promise<ServerResult> {
    const now = Date.now()
    let servers: string[] = []

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
        await initServerAddresses()
        servers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } else {
        try {
            const parsed = JSON.parse(stored)
            servers = Array.isArray(parsed) ? parsed : []
        } catch {
            servers = []
        }
    }

    // 读取 CACHE_KEY
    let cache: CachedServer[] = []
    const cacheRaw = localStorage.getItem(CACHE_KEY)
    if (cacheRaw) {
        try {
            const parsed = JSON.parse(cacheRaw)
            if (Array.isArray(parsed)) cache = parsed
        } catch {}
    }

    const available: string[] = []

    // 优先使用缓存未过期的 server
    for (const server of servers) {
        const cached = cache.find(c => c.server === server)
        if (cached && now - cached.lastCheck <= CACHE_DURATION) {
            available.push(server)
        }
    }

    // 检查缓存过期或未检查的 server
    for (const server of servers) {
        if (!available.includes(server)) {
            if (await checkServerWithCache(server, cache)) {
                available.push(server)
            }
        }
    }

    // 全部失败兜底
    if (available.length === 0) {
        serverAddress = window.location.origin
        const cached = cache.find(c => c.server === serverAddress)
        if (cached) cached.lastCheck = now
        else cache.push({ server: serverAddress, lastCheck: now })
        available.push(serverAddress)
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } else {
        // 随机选择一个作为默认 server
        serverAddress = available[Math.floor(Math.random() * available.length)]
    }

    return { default: serverAddress, available }
}

// 获取书籍列表
export async function fetchBooks(): Promise<Novel[]> {
    const { default: server } = await getServerAddress()
    const res = await fetch(`${server}/novels`)
    return res.json()
}

// 从自定义 URL 获取书籍列表
export async function fetchFromCustomUrl(url: string): Promise<Novel[]> {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch from custom URL')
    return res.json()
}

// 获取章节内容
export async function fetchChapters(bookId: string, chapterId: bigint): Promise<Chapter> {
    const { default: server } = await getServerAddress()
    const res = await fetch(`${server}/chapters/${bookId}/${chapterId}`)
    return res.json()
}

// 获取书籍章节列表
export async function fetchChaptersList(bookId: string): Promise<ChapterDetail[]> {
    const { default: server } = await getServerAddress()
    const res = await fetch(`${server}/novels/${bookId}/chapters`)
    return res.json()
}

// 删除缓存函数
export function clearServerCache() {
    localStorage.removeItem(STORAGE_KEY) // 删除服务器列表
    localStorage.removeItem(CACHE_KEY)   // 删除健康检查缓存
}

// 获取友情链接
export async function fetchFriendLinks(): Promise<
    { name: string; url: string; icon?: string; desc?: string }[]
> {
    const { default: server } = await getServerAddress()
    try {
        const res = await fetch(`${server}/friend-links`)
        if (!res.ok) throw new Error("Failed to fetch friend links")
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
            return data
        }
    } catch (err) {
        console.warn("使用默认友情链接：", err)
    }

    // 默认回退（更丰富的展示）
    return [
        {
            name: "OpenAI",
            url: "https://openai.com",
            icon: "https://openai.com/favicon.ico",
            desc: "人工智能研究机构，ChatGPT 的开发公司"
        },
        {
            name: "Vue.js",
            url: "https://vuejs.org",
            icon: "https://vuejs.org/images/logo.png",
            desc: "渐进式 JavaScript 框架"
        }
    ]
}