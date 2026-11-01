// `vp run dev`: the Next.js dev server, and as soon as it answers, one request per page. The
// dev server prepares a page on its first visit after every start (its compile and about 1 s
// of "generate-params", the `[locale]` check; the compile cache does not keep that): 1.4–2 s
// per first click (the author's Firefox profile, 2026-11-01). After the warm-up, a first click
// waits only for the render (0.2–0.5 s). The arguments go to `next dev`
// (`vp run dev --port 3002`).

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { devPort, warmUpPaths } from './lib/dev-warm-up.ts'

const args = process.argv.slice(2)
const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next')
const server = spawn(process.execPath, [nextBin, 'dev', ...args], { stdio: 'inherit' })

let running = true
server.on('exit', (code, signal) => {
  running = false
  process.exit(code ?? (signal ? 1 : 0))
})
// Ctrl+C reaches the dev server itself (the same terminal); this script ends when it does.
// Killing it from here would cut its shutdown short (on Windows, kill() is abrupt).
process.on('SIGINT', () => {})
process.on('SIGTERM', () => server.kill('SIGTERM'))

const origin = `http://localhost:${devPort(args, process.env)}`

/** Requests a page and reads the whole answer (the render streams). Null while nobody listens. */
async function request(path: string): Promise<number | null> {
  try {
    const response = await fetch(origin + path, { redirect: 'manual' })
    await response.arrayBuffer()
    return response.status
  } catch {
    return null
  }
}

async function warmUp() {
  const [first, ...rest] = warmUpPaths()
  if (first === undefined) return
  const started = performance.now()
  // The server listens a moment after it starts; until then a request is refused.
  let status = await request(first)
  while (status === null && running && performance.now() - started < 120_000) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    status = await request(first)
  }
  const failed: string[] = []
  if (status !== 200) failed.push(`${first} (${status ?? 'no answer'})`)
  // One by one (17–19 s after a restart). Several first visits at once raced in Next.js
  // 16.4: a page read a JSON file that another one was writing, and answered 500.
  for (const path of rest) {
    if (!running) return
    const answer = await request(path)
    if (answer !== 200) failed.push(`${path} (${answer ?? 'no answer'})`)
  }
  const seconds = ((performance.now() - started) / 1000).toFixed(1)
  console.log(` ✓ Warm-up: ${rest.length + 1} pages compiled in ${seconds}s`)
  if (failed.length > 0) console.log(` ⚠ Warm-up: no 200 from ${failed.join(', ')}`)
}

void warmUp()
