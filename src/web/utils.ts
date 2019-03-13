import { LZString } from './lz'

export function extractImageUrlsFromLocation(location: Location) {
    const currentUrl = new URL(location.href)
    const urlsCompressed = currentUrl.searchParams.get('urls_c')
    const urls = currentUrl.searchParams.get('urls')

    if (urlsCompressed) {
        return LZString.decompressFromEncodedURIComponent(urlsCompressed).split(' ')
    }

    if (urls) {
        return urls.split(',')
    }

    return []
}

export const isDev = location.hostname === 'localhost'

export const prefixUrl = isDev
    ? 'http://localhost:5000'
    : 'https://asia-northeast1-photohook-app.cloudfunctions.net'
