import { NotFoundContent } from '@/components/NotFoundContent.tsx'

// For notFound() calls inside real pages. Unknown URLs do not come here: the
// proxy sends them to the prerendered (pages)/page-not-found page.
export default function NotFoundPage() {
  return <NotFoundContent />
}
