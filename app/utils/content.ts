import type { LocalizedString, LocalizedText } from '#shared/types'

export function localize(value: LocalizedString | undefined, language: string, fallback: string): string {
  if (!value) return ''
  return value[language] ?? value[fallback] ?? Object.values(value)[0] ?? ''
}

export function localizeText(value: LocalizedText | undefined, language: string, fallback: string): string[] {
  if (!value) return []
  const selected = value[language] ?? value[fallback] ?? Object.values(value)[0]
  if (Array.isArray(selected)) return selected
  return typeof selected === 'string' ? [selected] : []
}

export function absoluteMediaUrl(filename: string): string {
  return `/media/${encodeURIComponent(filename)}`
}
