import { useRouter } from 'vue-router'

export function useReadingProgress() {
  const router = useRouter()

  function startReading(bookId: string) {
    const lastRead = localStorage.getItem(`last-read-${bookId}`)
    router.push(`/reader/${bookId}/${lastRead || '1'}`)
  }

  function saveProgress(bookId: string, chapterId: string) {
    localStorage.setItem(`last-read-${bookId}`, chapterId)
  }

  return {
    startReading,
    saveProgress
  }
}
