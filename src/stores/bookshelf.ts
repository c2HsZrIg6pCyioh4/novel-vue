import { defineStore } from 'pinia'
import type { Book } from '@/types/book'

interface State { items: Book[] }
export const useBookshelf = defineStore('shelf', {
    state: (): State => ({
        items: JSON.parse(localStorage.getItem('bookshelf') || '[]') as Book[]
    }),
    actions: {
        toggle(book: Book){
            const idx = this.items.findIndex(b => b.id === book.id)
            if (idx >= 0) this.items.splice(idx, 1)
            else this.items.unshift(book)
            localStorage.setItem('bookshelf', JSON.stringify(this.items))
        },
        inShelf(id: string){ return this.items.some(b => b.id === id) }
    }
})