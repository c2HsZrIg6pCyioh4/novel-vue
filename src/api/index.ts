import type { Book, Chapter } from '@/types/book'

export async function fetchBooks(): Promise<Book[]> {
    const res = await fetch('/mock/books.json')
    return res.json()
}

// 获取章节内容，按书籍ID和章节ID请求
export async function fetchChapters(bookId: string, chapterId: string): Promise<Chapter> {
    const res = await fetch(`/mock/chapters/${bookId}/${chapterId}.json`)
    return res.json()
}

// 如果还需要获取书籍所有章节列表
export async function fetchChaptersList(bookId: string): Promise<Chapter[]> {
    const res = await fetch(`/mock/chapters/${bookId}/chapters.json`) // 可单独存一个 chapters.json
    return res.json()
}