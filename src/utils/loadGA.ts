// src/utils/loadGA.ts
export function loadGA(trackingId: string = 'G-29TDDBHRXM') {
    if (document.getElementById('ga-script')) return // 防止重复加载

    const script = document.createElement('script')
    script.id = 'ga-script'
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`
    document.head.appendChild(script)

    script.onload = () => {
        ;(window as any).dataLayer = (window as any).dataLayer || []
        function gtag(...args: any[]) {
            ;(window as any).dataLayer.push(args)
        }
        ;(window as any).gtag = gtag

        gtag('js', new Date())
        gtag('config', trackingId)
    }
}