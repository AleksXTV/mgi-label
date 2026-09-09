export type MediaProvider = 'youtube' | 'vimeo' | 'spotify' | 'soundcloud' | 'bandcamp' | 'external'

export function detectProvider(source: string): MediaProvider {
  try {
    const host = new URL(source).hostname.replace(/^www\./, '').toLowerCase()
    if (host === 'youtu.be' || host.endsWith('youtube.com')) return 'youtube'
    if (host.endsWith('vimeo.com')) return 'vimeo'
    if (host.endsWith('spotify.com')) return 'spotify'
    if (host.endsWith('soundcloud.com')) return 'soundcloud'
    if (host === 'bandcamp.com' || host.endsWith('.bandcamp.com')) return 'bandcamp'
  } catch {}
  return 'external'
}

export function youtubeId(source: string): string | null {
  try {
    const url = new URL(source)
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || null
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || null
    if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || null
    return url.searchParams.get('v')
  } catch { return null }
}

export function vimeoId(source: string): string | null {
  try {
    const parts = new URL(source).pathname.split('/').filter(Boolean)
    return [...parts].reverse().find((part) => /^\d+$/.test(part)) || null
  } catch { return null }
}

export function spotifyEmbed(source: string): string | null {
  try {
    const url = new URL(source)
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'embed') return source
    const supported = ['track', 'album', 'artist', 'playlist', 'episode', 'show']
    const index = parts.findIndex((part) => supported.includes(part))
    if (index < 0 || !parts[index + 1]) return null
    const type = parts[index]!
    const id = parts[index + 1]!
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  } catch { return null }
}
