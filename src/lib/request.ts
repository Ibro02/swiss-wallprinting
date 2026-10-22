// Facts about a form request that come from its headers. A visitor (or a script) sets most
// headers to any value, so these functions keep only what a header can honestly tell.

type Env = Record<string, string | undefined>

/**
 * The visitor's IP address, for the form send limit. Each proxy in front of the site adds
 * the address it received the request from at the END of X-Forwarded-For, so the trusted
 * entry is counted from the end: `TRUSTED_PROXY_HOPS` (default 1: one proxy, such as the
 * host's edge or one nginx) entries from the right. The first entry is whatever the visitor
 * sent: never use it.
 */
export function clientIp(headers: Pick<Headers, 'get'>, env: Env = process.env): string {
  const hops = Math.max(1, Math.trunc(Number(env.TRUSTED_PROXY_HOPS) || 1))
  const forwarded = (headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  const fromProxy = forwarded[Math.max(0, forwarded.length - hops)]
  return fromProxy ?? (headers.get('x-real-ip')?.trim() || 'unknown')
}

/**
 * The page a form was sent from, for the e-mail to the client: only the path of the Referer
 * header. A script can send any Referer, so a host or a query (a link to another site) must
 * never reach the e-mail.
 */
export function refererPath(referer: string | null): string {
  if (!referer) return '-'
  try {
    return new URL(referer).pathname.slice(0, 200)
  } catch {
    return '-'
  }
}
