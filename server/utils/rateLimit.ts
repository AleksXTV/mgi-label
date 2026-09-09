const buckets = new Map<string, number[]>()

export function consumeRateLimit(key: string, max: number, windowMs: number): { ok: boolean, retryAfterMs: number } {
  const now = Date.now()
  const cutoff = now - windowMs
  const recent = (buckets.get(key) || []).filter((stamp) => stamp > cutoff)
  if (recent.length >= max) {
    buckets.set(key, recent)
    return { ok: false, retryAfterMs: Math.max(1000, windowMs - (now - recent[0]!)) }
  }
  recent.push(now)
  buckets.set(key, recent)
  return { ok: true, retryAfterMs: 0 }
}
