import type { H3Event } from 'h3'
import { getHeader } from 'h3'

export function clientIp(event: H3Event): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return event.node.req.socket.remoteAddress || 'unknown'
}

export function isHttps(event: H3Event): boolean {
  const proto = getHeader(event, 'x-forwarded-proto')
  return proto === 'https' || Boolean((event.node.req.socket as any).encrypted)
}
