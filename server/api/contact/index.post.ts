import { randomUUID } from 'node:crypto'
import { createError, readBody } from 'h3'
import type { ContactMessage } from '../../../shared/types'
import { clientIp } from '../../utils/http'
import { consumeRateLimit } from '../../utils/rateLimit'
import { updateMessages } from '../../utils/messages'
import { sendTelegram } from '../../utils/telegram'

export default defineEventHandler(async (event) => {
  const ip = clientIp(event)
  if (!consumeRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000).ok) throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  const body = await readBody<any>(event)
  if (String(body?.website || '').trim()) return { ok: true }
  const startedAt = Number(body?.startedAt || 0)
  if (!startedAt || Date.now() - startedAt < 1500) throw createError({ statusCode: 400, statusMessage: 'Form submitted too quickly' })
  const subject = String(body?.subject || '').trim()
  const contacts = String(body?.contacts || '').trim()
  const message = String(body?.message || '').trim()
  const language = String(body?.language || 'en').slice(0, 16)
  if (!subject || !contacts || !message) throw createError({ statusCode: 400, statusMessage: 'All fields are required' })
  if (subject.length > 200 || contacts.length > 1000 || message.length > 10000) throw createError({ statusCode: 400, statusMessage: 'One or more fields are too long' })
  const entry: ContactMessage = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    language,
    subject,
    contacts,
    message,
    status: 'new',
    telegram: []
  }
  await updateMessages((items) => { items.unshift(entry) })
  const deliveries = await sendTelegram(subject, contacts, message)
  await updateMessages((items) => {
    const found = items.find((x) => x.id === entry.id)
    if (found) found.telegram = deliveries
  })
  return { ok: true, id: entry.id }
})
