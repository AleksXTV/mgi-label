export type LocalizedString = Record<string, string>
export type LocalizedText = Record<string, string | string[]>

export interface SiteLanguage {
  code: string
  label: string
  flag: string
  order: number
  enabled: boolean
}

export interface SiteTheme {
  id: string
  icon: 'moon' | 'sun' | string
  order: number
  enabled: boolean
  name: LocalizedString
}

export interface MenuItem {
  id: string
  order: number
  route: string
  page: string
  enabled: boolean
  title: LocalizedString
}

export interface SiteConfig {
  schemaVersion: 1
  defaultLanguage: string
  defaultTheme: string
  languages: SiteLanguage[]
  themes: SiteTheme[]
  menu: MenuItem[]
}

export interface PageSeo {
  title?: LocalizedString
  description?: LocalizedString
  image?: string
}

export interface MediaItem {
  type: 'image' | 'embed' | 'audio'
  source: string
  title?: LocalizedString
  artist?: LocalizedString
  description?: LocalizedText
  alt?: LocalizedString
  target?: string
}

export interface ActionItem {
  type: 'internal' | 'external'
  target: string
  title: LocalizedString
}

export interface ContactFormLabels {
  subject: LocalizedString
  contacts: LocalizedString
  message: LocalizedString
  submit: LocalizedString
  success: LocalizedString
  error?: LocalizedString
}

export interface PageBlock {
  id: string
  enabled: boolean
  layout: string
  title?: LocalizedString
  subtitle?: LocalizedString
  text?: LocalizedText
  media?: MediaItem[]
  actions?: ActionItem[]
  form?: ContactFormLabels
}

export interface ContentPage {
  schemaVersion: 1
  id: string
  enabled: boolean
  seo?: PageSeo
  blocks: PageBlock[]
}

export interface TelegramDelivery {
  chatId: string
  status: 'sent' | 'failed' | 'disabled'
  error?: string
}

export interface ContactMessage {
  id: string
  createdAt: string
  language: string
  subject: string
  contacts: string
  message: string
  status: 'new' | 'read'
  telegram: TelegramDelivery[]
}

export interface ValidationIssue {
  path: string
  message: string
}
