// The dark theme choice (globals.css, "Dark theme"; ThemeToggle). Shared by the server layout
// and the client switch: a constant from a 'use client' module is not a value on the server.

/**
 * Whether visitors may choose the theme. Off (the author, 2026-11-01): the site is dark only.
 * The server renders data-theme="dark" on <html>, so the first paint is dark on every device
 * and nothing switches after load; no switch, no head script. The light theme stays in
 * globals.css: set this to true to bring back the device's theme and the switch.
 */
export const THEME_CHOICE = false

/** The theme on <html> while THEME_CHOICE is off. */
export const FIXED_THEME = 'dark'

/** The localStorage key of the visitor's choice: "dark" or "light"; absent = the device's. */
export const THEME_STORAGE_KEY = 'theme'

/**
 * Runs in <head> before the page paints (layout.tsx): a saved choice becomes data-theme on
 * <html>. Without a choice, or without storage, the CSS follows prefers-color-scheme.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`
