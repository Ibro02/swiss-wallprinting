import { type RefObject, useEffect, useRef } from 'react'
import { issueFormToken } from '@/features/contact/actions.ts'
import type { FormName } from '@/lib/form-token.ts'

/**
 * The hidden input of the signed fill-time token (src/lib/form-token.ts): the server's token,
 * asked for after hydration. Without JavaScript, or when the request fails, it stays empty:
 * the form still sends, against the smaller limit. A new `round` (a new form) asks again.
 */
export function useFormToken(form: FormName, round = 0): RefObject<HTMLInputElement | null> {
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    let current = true
    void issueFormToken(form).then(
      (token) => {
        if (current && input.current) input.current.value = token
      },
      () => {},
    )
    return () => {
      current = false
    }
  }, [form, round])
  return input
}
