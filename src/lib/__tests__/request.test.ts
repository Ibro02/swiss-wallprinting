import { describe, expect, it } from 'vite-plus/test'
import { clientIp, refererPath } from '../request.ts'

const headers = (values: Record<string, string>) => new Headers(values)

describe('clientIp', () => {
  it('takes the address that the nearest proxy added, not the one the visitor sent', () => {
    const sent = headers({ 'x-forwarded-for': '6.6.6.6, 203.0.113.7' })
    expect(clientIp(sent, {})).toBe('203.0.113.7')
  })

  it('counts TRUSTED_PROXY_HOPS entries from the right', () => {
    const sent = headers({ 'x-forwarded-for': '6.6.6.6, 203.0.113.7, 10.0.0.2' })
    expect(clientIp(sent, { TRUSTED_PROXY_HOPS: '2' })).toBe('203.0.113.7')
    expect(clientIp(sent, { TRUSTED_PROXY_HOPS: '9' })).toBe('6.6.6.6')
    expect(clientIp(sent, { TRUSTED_PROXY_HOPS: 'many' })).toBe('10.0.0.2')
  })

  it('uses X-Real-IP without X-Forwarded-For, then "unknown"', () => {
    expect(clientIp(headers({ 'x-real-ip': ' 203.0.113.9 ' }), {})).toBe('203.0.113.9')
    expect(clientIp(headers({ 'x-forwarded-for': ' , ' }), {})).toBe('unknown')
    expect(clientIp(headers({}), {})).toBe('unknown')
  })
})

describe('refererPath', () => {
  it('keeps only the path', () => {
    expect(refererPath('https://www.swisswallprinting.ch/it/contatti?x=1#form')).toBe(
      '/it/contatti',
    )
  })

  it('drops the host of a forged Referer', () => {
    expect(refererPath('https://evil.example/login')).toBe('/login')
  })

  it('gives "-" without a usable Referer', () => {
    expect(refererPath(null)).toBe('-')
    expect(refererPath('not a url')).toBe('-')
  })

  it('keeps a long path short', () => {
    expect(refererPath(`https://a.example/${'x'.repeat(500)}`)).toHaveLength(200)
  })
})
