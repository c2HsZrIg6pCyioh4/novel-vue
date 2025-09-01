// utils/normalize.ts
export function normalizeChapterId(raw: string | string[] | undefined): string {
    if (!raw) return ''
    const str = Array.isArray(raw) ? raw[0] : raw
    // 只保留前面的数字部分
    return str.replace(/\.(html|htm|jsp)$/i, '')
}