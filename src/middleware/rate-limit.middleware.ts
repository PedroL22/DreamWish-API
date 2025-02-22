import type { Context, Next } from 'hono'

const rateLimitStore = new Map<string, { count: number; time: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS = 50

function getClientIP(c: Context): string {
  const headers = [
    'x-forwarded-for', // Standard proxy header
    'x-real-ip', // nginx
    'cf-connecting-ip', // Cloudflare
    'fastly-client-ip', // Fastly
    'x-cluster-client-ip', // GCP load balancer
  ]

  for (const header of headers) {
    const ip = c.req.header(header)
    if (ip) {
      // If x-forwarded-for contains multiple IPs, take the first one
      return ip.split(',')[0].trim()
    }
  }

  return 'unknown-ip'
}

export async function rateLimitMiddleware(c: Context, next: Next) {
  const ip = getClientIP(c)

  const now = Date.now()
  const record = rateLimitStore.get(ip) || { count: 0, time: now }

  if (now - record.time > WINDOW_MS) {
    record.count = 0
    record.time = now
  }

  record.count++
  rateLimitStore.set(ip, record)

  if (record.count > MAX_REQUESTS) {
    console.error(`Rate limit exceeded for IP: ${ip}. Count: ${record.count}`)

    return c.json(
      {
        message: 'Too Many Requests',
        retryAfter: Math.ceil((record.time + WINDOW_MS - now) / 1000),
      },
      429
    )
  }

  return next()
}
