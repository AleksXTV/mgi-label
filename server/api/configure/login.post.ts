import { createError, readBody, setResponseStatus } from 'h3'
import { createAdminSession, verifyCredentials } from '../../utils/auth'
import { clientIp } from '../../utils/http'
import { consumeRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = clientIp(event)
  const limit = consumeRateLimit(`login:${ip}`, 6, 15 * 60 * 1000)
  if (!limit.ok) throw createError({ statusCode: 429, statusMessage: 'Too many login attempts' })
  const body = await readBody<{ username?: string, password?: string }>(event)
  const username = String(body?.username || '')
  const password = String(body?.password || '')
  if (!(await verifyCredentials(username, password))) {
    setResponseStatus(event, 401)
    return { ok: false, message: 'Invalid username or password' }
  }
  createAdminSession(event)
  return { ok: true }
})
