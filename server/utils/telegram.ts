import type { TelegramDelivery } from '../../shared/types'
import { readJson } from './files'
import { dataPath } from './paths'

interface TelegramConfig {
  botToken: string
  recipients: Array<{ chatId: string, enabled: boolean }>
}

export async function sendTelegram(subject: string, contacts: string, message: string): Promise<TelegramDelivery[]> {
  let config: TelegramConfig
  try { config = await readJson<TelegramConfig>(dataPath('config', 'telegram.json')) } catch { return [] }
  const deliveries: TelegramDelivery[] = []
  for (const recipient of config.recipients || []) {
    if (!recipient.enabled) {
      deliveries.push({ chatId: recipient.chatId, status: 'disabled' })
      continue
    }
    if (!config.botToken || !recipient.chatId) {
      deliveries.push({ chatId: recipient.chatId || '', status: 'failed', error: 'Telegram is not configured' })
      continue
    }
    const text = `🎵 New M.G.I. Records request\n\nSubject: ${subject}\nContacts: ${contacts}\n\n${message}`
    try {
      const response: any = await $fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        timeout: 8000,
        body: { chat_id: recipient.chatId, text }
      })
      if (!response?.ok) throw new Error(response?.description || 'Telegram API error')
      deliveries.push({ chatId: recipient.chatId, status: 'sent' })
    } catch (error: any) {
      const rawError = String(error?.message || 'Telegram delivery failed')
      const safeError = config.botToken ? rawError.replaceAll(config.botToken, '[redacted]') : rawError
      console.error('[telegram]', recipient.chatId, safeError)
      deliveries.push({ chatId: recipient.chatId, status: 'failed', error: safeError.slice(0, 500) })
    }
  }
  return deliveries
}
