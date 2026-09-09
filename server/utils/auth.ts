import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import { dataPath } from './paths'
import { readJson } from './files'
import { isHttps } from './http'

const COOKIE = 'mgi_admin_session'
const sessions = new Map<string, { createdAt: number }>()

function equalText(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const cfg = await readJson<{ username: string, password: string }>(dataPath('config', 'admin.json'))
  return equalText(username, cfg.username) && equalText(password, cfg.password)
}

export function createAdminSession(event: H3Event): void {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, { createdAt: Date.now() })
  setCookie(event, COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isHttps(event),
    path: '/'
  })
}

export function destroyAdminSession(event: H3Event): void {
  const token = getCookie(event, COOKIE)
  if (token) sessions.delete(token)
  deleteCookie(event, COOKIE, { path: '/' })
}

export function isAdmin(event: H3Event): boolean {
  const token = getCookie(event, COOKIE)
  return Boolean(token && sessions.has(token))
}

export function requireAdmin(event: H3Event): void {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
}
