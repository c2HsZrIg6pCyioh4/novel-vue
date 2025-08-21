
export interface Chapter {
    id: string
    novel_id: string
    title: string
    content: string
    word_count: string
    chapter_index: string
    created_at: string
    updated_at: string
}


export interface ChapterDetail {
    id: string
    title: string
    chapter_index: string
}

export interface Novel {
    id: string
    novel_id: string
    name: string
    author: string
    category: string
    status: string
    description: string
    cover_url: string
    created_at: string
    updated_at: string
}