import { notFound } from 'next/navigation'

// Fallback for localized URLs the proxy did not see. The proxy normally sends
// unknown URLs to the prerendered (pages)/page-not-found page instead.
export default function CatchAllPage() {
  notFound()
}
