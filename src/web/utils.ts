export function extractImageUrlsFromLocation(location: Location) {
    const url = new URL(location.href)
    const targetsString = url.searchParams.get('urls')

    if (!targetsString) {
        return []
    }

    return [...new Set(targetsString.split(',').filter(u => u))]
}

export const isDev = location.hostname === 'localhost'

export const prefixUrl = isDev ? 'http://localhost:3000/api' : '/api'
