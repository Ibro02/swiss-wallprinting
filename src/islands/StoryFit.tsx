'use client'

import { useEffect } from 'react'

// "Show more" on a project card (ProjectList.tsx) appears only when the story is longer than
// the card's back. Browsers with CSS scroll timelines know it from CSS alone (globals.css,
// `.flip-card__story`), in the first frame. The others (Firefox, 2026-10) get it here: a story
// box that overflows is marked `data-overflow`, again whenever the box or its text changes
// size (a narrower window, the fonts arriving). The back of a card is hidden until the
// visitor turns it, so the mark never changes what is on the screen (no-ui-flash); until it
// is set, the back shows no button rather than a button it may not need.

export function StoryFit() {
  useEffect(() => {
    if (CSS.supports('animation-timeline: scroll()')) return
    const observer = new ResizeObserver((entries) => {
      for (const { target } of entries) {
        const story = target.closest('.flip-card__story')
        story?.toggleAttribute('data-overflow', story.scrollHeight > story.clientHeight + 1)
      }
    })
    for (const story of document.querySelectorAll('.flip-card__story')) {
      observer.observe(story)
      for (const part of story.children) observer.observe(part)
    }
    return () => observer.disconnect()
  }, [])
  return null
}
