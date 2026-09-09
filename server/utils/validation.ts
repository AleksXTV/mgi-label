import type { ValidationIssue } from '../../shared/types'

export const allowedLayouts = new Set([
  'hero', 'statement', 'editorial', 'split-left', 'split-right', 'media-wide',
  'music-showcase', 'video-grid', 'contact-form'
])

export const imageExtensions = new Set(['avif', 'webp', 'jpg', 'jpeg', 'png', 'apng', 'gif', 'svg'])

function issue(list: ValidationIssue[], path: string, message: string) {
  list.push({ path, message })
}

function isObj(value: unknown): value is Record<string, any> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function localizedString(value: unknown, path: string, issues: ValidationIssue[], required = false) {
  if (value == null && !required) return
  if (!isObj(value)) return issue(issues, path, 'must be an object of language:string pairs')
  for (const [key, text] of Object.entries(value)) {
    if (!key || typeof text !== 'string') issue(issues, `${path}.${key}`, 'must be a string')
  }
}

function localizedText(value: unknown, path: string, issues: ValidationIssue[]) {
  if (value == null) return
  if (!isObj(value)) return issue(issues, path, 'must be an object of language:text pairs')
  for (const [key, text] of Object.entries(value)) {
    if (typeof text === 'string') continue
    if (Array.isArray(text) && text.every((x) => typeof x === 'string')) continue
    issue(issues, `${path}.${key}`, 'must be a string or string[]')
  }
}

export function isSafeImageFilename(name: string): boolean {
  if (!name || name.includes('/') || name.includes('\\') || name.includes('..')) return false
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return imageExtensions.has(ext)
}

function validUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch { return false }
}

export function validateSite(value: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!isObj(value)) return [{ path: '$', message: 'must be an object' }]
  if (value.schemaVersion !== 1) issue(issues, 'schemaVersion', 'must equal 1')
  if (typeof value.defaultLanguage !== 'string') issue(issues, 'defaultLanguage', 'must be a string')
  if (typeof value.defaultTheme !== 'string') issue(issues, 'defaultTheme', 'must be a string')
  const languages = Array.isArray(value.languages) ? value.languages : []
  if (!Array.isArray(value.languages) || !languages.length) issue(issues, 'languages', 'must be a non-empty array')
  const languageCodes = new Set<string>()
  const languageOrders = new Set<number>()
  languages.forEach((lang: any, i: number) => {
    const p = `languages[${i}]`
    if (!isObj(lang)) return issue(issues, p, 'must be an object')
    if (typeof lang.code !== 'string' || !lang.code) issue(issues, `${p}.code`, 'must be a non-empty string')
    else if (languageCodes.has(lang.code)) issue(issues, `${p}.code`, 'duplicate language code')
    else languageCodes.add(lang.code)
    if (typeof lang.label !== 'string') issue(issues, `${p}.label`, 'must be a string')
    if (typeof lang.flag !== 'string') issue(issues, `${p}.flag`, 'must be a string')
    if (!Number.isInteger(lang.order)) issue(issues, `${p}.order`, 'must be an integer')
    else if (languageOrders.has(lang.order)) issue(issues, `${p}.order`, 'duplicate order')
    else languageOrders.add(lang.order)
    if (typeof lang.enabled !== 'boolean') issue(issues, `${p}.enabled`, 'must be boolean')
  })
  if (typeof value.defaultLanguage === 'string' && !languageCodes.has(value.defaultLanguage)) issue(issues, 'defaultLanguage', 'must reference a configured language')

  const themes = Array.isArray(value.themes) ? value.themes : []
  if (!Array.isArray(value.themes) || !themes.length) issue(issues, 'themes', 'must be a non-empty array')
  const themeIds = new Set<string>()
  const themeOrders = new Set<number>()
  themes.forEach((theme: any, i: number) => {
    const p = `themes[${i}]`
    if (!isObj(theme)) return issue(issues, p, 'must be an object')
    if (typeof theme.id !== 'string' || !theme.id) issue(issues, `${p}.id`, 'must be a non-empty string')
    else if (themeIds.has(theme.id)) issue(issues, `${p}.id`, 'duplicate theme id')
    else themeIds.add(theme.id)
    if (typeof theme.icon !== 'string') issue(issues, `${p}.icon`, 'must be a string')
    if (!Number.isInteger(theme.order)) issue(issues, `${p}.order`, 'must be an integer')
    else if (themeOrders.has(theme.order)) issue(issues, `${p}.order`, 'duplicate order')
    else themeOrders.add(theme.order)
    if (typeof theme.enabled !== 'boolean') issue(issues, `${p}.enabled`, 'must be boolean')
    localizedString(theme.name, `${p}.name`, issues, true)
  })
  if (typeof value.defaultTheme === 'string' && !themeIds.has(value.defaultTheme)) issue(issues, 'defaultTheme', 'must reference a configured theme')

  const menu = Array.isArray(value.menu) ? value.menu : []
  if (!Array.isArray(value.menu) || !menu.length) issue(issues, 'menu', 'must be a non-empty array')
  const ids = new Set<string>(), orders = new Set<number>(), routes = new Set<string>()
  menu.forEach((item: any, i: number) => {
    const p = `menu[${i}]`
    if (!isObj(item)) return issue(issues, p, 'must be an object')
    if (typeof item.id !== 'string' || !item.id) issue(issues, `${p}.id`, 'must be a non-empty string')
    else if (ids.has(item.id)) issue(issues, `${p}.id`, 'duplicate id')
    else ids.add(item.id)
    if (!Number.isInteger(item.order)) issue(issues, `${p}.order`, 'must be an integer')
    else if (orders.has(item.order)) issue(issues, `${p}.order`, 'duplicate order')
    else orders.add(item.order)
    if (typeof item.route !== 'string' || !item.route.startsWith('/')) issue(issues, `${p}.route`, 'must start with /')
    else if (routes.has(item.route)) issue(issues, `${p}.route`, 'duplicate route')
    else routes.add(item.route)
    if (typeof item.page !== 'string' || !/^[a-z0-9_-]+$/.test(item.page)) issue(issues, `${p}.page`, 'must contain only a-z, 0-9, _ or -')
    if (typeof item.enabled !== 'boolean') issue(issues, `${p}.enabled`, 'must be boolean')
    localizedString(item.title, `${p}.title`, issues, true)
  })
  return issues
}

export function validatePage(value: unknown, expectedId?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!isObj(value)) return [{ path: '$', message: 'must be an object' }]
  if (value.schemaVersion !== 1) issue(issues, 'schemaVersion', 'must equal 1')
  if (typeof value.id !== 'string' || !value.id) issue(issues, 'id', 'must be a non-empty string')
  if (expectedId && value.id !== expectedId) issue(issues, 'id', `must equal "${expectedId}" for this file`)
  if (typeof value.enabled !== 'boolean') issue(issues, 'enabled', 'must be boolean')
  if (value.seo != null) {
    if (!isObj(value.seo)) issue(issues, 'seo', 'must be an object')
    else {
      localizedString(value.seo.title, 'seo.title', issues)
      localizedString(value.seo.description, 'seo.description', issues)
      if (value.seo.image != null && (typeof value.seo.image !== 'string' || !isSafeImageFilename(value.seo.image))) issue(issues, 'seo.image', 'must be a safe image filename')
    }
  }
  if (!Array.isArray(value.blocks)) return [...issues, { path: 'blocks', message: 'must be an array' }]
  const ids = new Set<string>()
  value.blocks.forEach((block: any, i: number) => {
    const p = `blocks[${i}]`
    if (!isObj(block)) return issue(issues, p, 'must be an object')
    if (typeof block.id !== 'string' || !block.id) issue(issues, `${p}.id`, 'must be a non-empty string')
    else if (ids.has(block.id)) issue(issues, `${p}.id`, 'duplicate block id')
    else ids.add(block.id)
    if (typeof block.enabled !== 'boolean') issue(issues, `${p}.enabled`, 'must be boolean')
    if (typeof block.layout !== 'string' || !allowedLayouts.has(block.layout)) issue(issues, `${p}.layout`, `must be one of: ${[...allowedLayouts].join(', ')}`)
    localizedString(block.title, `${p}.title`, issues)
    localizedString(block.subtitle, `${p}.subtitle`, issues)
    localizedText(block.text, `${p}.text`, issues)
    if (block.media != null) {
      if (!Array.isArray(block.media)) issue(issues, `${p}.media`, 'must be an array')
      else block.media.forEach((media: any, j: number) => {
        const mp = `${p}.media[${j}]`
        if (!isObj(media)) return issue(issues, mp, 'must be an object')
        if (!['image', 'embed', 'audio'].includes(media.type)) issue(issues, `${mp}.type`, 'must be image, embed or audio')
        if (typeof media.source !== 'string' || !media.source) issue(issues, `${mp}.source`, 'must be a non-empty string')
        else if (media.type === 'image' && !isSafeImageFilename(media.source)) issue(issues, `${mp}.source`, 'must be a safe image filename')
        else if (media.type === 'embed' && !validUrl(media.source)) issue(issues, `${mp}.source`, 'must be an http(s) URL')
        else if (media.type === 'audio' && !(isSafeImageFilename(media.source) || validUrl(media.source) || /^[^/\\]+\.(mp3|ogg|wav|m4a|aac|flac)$/i.test(media.source))) issue(issues, `${mp}.source`, 'must be a direct URL or safe audio filename')
        localizedString(media.title, `${mp}.title`, issues)
        localizedString(media.artist, `${mp}.artist`, issues)
        localizedText(media.description, `${mp}.description`, issues)
        localizedString(media.alt, `${mp}.alt`, issues)
        if (media.target != null && typeof media.target !== 'string') issue(issues, `${mp}.target`, 'must be a string')
      })
    }
    if (block.actions != null) {
      if (!Array.isArray(block.actions)) issue(issues, `${p}.actions`, 'must be an array')
      else block.actions.forEach((action: any, j: number) => {
        const ap = `${p}.actions[${j}]`
        if (!isObj(action)) return issue(issues, ap, 'must be an object')
        if (!['internal', 'external'].includes(action.type)) issue(issues, `${ap}.type`, 'must be internal or external')
        if (typeof action.target !== 'string' || !action.target) issue(issues, `${ap}.target`, 'must be a non-empty string')
        else if (action.type === 'internal' && !action.target.startsWith('/')) issue(issues, `${ap}.target`, 'internal target must start with /')
        else if (action.type === 'external' && !validUrl(action.target)) issue(issues, `${ap}.target`, 'external target must be an http(s) URL')
        localizedString(action.title, `${ap}.title`, issues, true)
      })
    }
    if (block.layout === 'contact-form') {
      if (!isObj(block.form)) issue(issues, `${p}.form`, 'contact-form layout requires form labels')
      else for (const key of ['subject', 'contacts', 'message', 'submit', 'success']) localizedString(block.form[key], `${p}.form.${key}`, issues, true)
    }
  })
  return issues
}

export function validateEditable(file: string, value: unknown): ValidationIssue[] {
  if (file === 'site.json') return validateSite(value)
  const match = /^pages\/([a-z0-9_-]+)\.json$/.exec(file)
  if (match) return validatePage(value, match[1])
  return [{ path: '$', message: 'file is not editable' }]
}
