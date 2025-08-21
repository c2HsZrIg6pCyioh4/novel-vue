import { defineStore } from 'pinia'
import type { Novel } from '@/types/book'

interface State { items: Novel[] }
export const useBookshelf = defineStore('shelf', {
    state: (): State => ({
        items: JSON.parse(localStorage.getItem('bookshelf') || '[]') as Novel[]
    }),
    actions: {
        toggle(book: Novel){
            const idx = this.items.findIndex(b => b.novel_id === book.novel_id)
            if (idx >= 0) this.items.splice(idx, 1)
            else this.items.unshift(book)
            localStorage.setItem('bookshelf', JSON.stringify(this.items))
        },
        inShelf(novel_id: string){ return this.items.some(b => b.novel_id === novel_id) }
    }
})