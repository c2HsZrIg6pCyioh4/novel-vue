import type { Book, Chapter } from '@/types/book'

const STORAGE_KEY = 'novel_servers'
let serverAddress = window.location.origin

async function checkServerHealth(url: string): Promise<boolean> {
    try {
        const testUrl = `${url}/mock/healthcheck.json`
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        
        const res = await fetch(testUrl, {
            signal: controller.signal
        })
        clearTimeout(timeout)
        return res.ok
    } catch {
        return false
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
                for (const item of data) { // ✅ 改成 for...of
                    const server = item?.server_address
                    if (server?.startsWith('http')) {
                        const isHealthy = await checkServerHealth(server)
                        if (isHealthy) {
                            servers.push(server)
                        }
                    }
                }
            }
        }
    } catch {
        // 忽略异常，后面走兜底逻辑
    }

    if (servers.length === 0) {
        servers = [currentOrigin] // ✅ 兜底写入当前域名
    }

    serverAddress = servers[0]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servers))
}

export async function getServerAddress(): Promise<string> {
    // If no servers in session, try to fetch them
    if (!localStorage.getItem(STORAGE_KEY)) {
        await initServerAddresses()
    }

    // Try to get from session storage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        const servers: string[] = JSON.parse(stored)
        // Try servers in random order
        const shuffled = [...servers].sort(() => 0.5 - Math.random())
        for (const server of shuffled) {
            if (await checkServerHealth(server)) {
                serverAddress = server
                return server
            }
        }
    }
    return serverAddress
}

export async function fetchBooks(): Promise<Book[]> {
    const server = await getServerAddress()
    const res = await fetch(`${server}/mock/books.json`)
    return res.json()
}

export async function fetchFromCustomUrl(url: string): Promise<Book[]> {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch from custom URL')
    return res.json()
}

// 获取章节内容，按书籍ID和章节ID请求
export async function fetchChapters(bookId: string, chapterId: string): Promise<Chapter> {
    const server = await getServerAddress()
    const res = await fetch(`${server}/mock/chapters/${bookId}/${chapterId}.json`)
    return res.json()
}

// 如果还需要获取书籍所有章节列表
export async function fetchChaptersList(bookId: string): Promise<Chapter[]> {
    const server = await getServerAddress()
    const res = await fetch(`${server}/mock/chapters/${bookId}/chapters.json`)
    return res.json()
}