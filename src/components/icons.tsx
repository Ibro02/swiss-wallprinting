// Small line icons (24 × 24, stroke = currentColor). Decorative by default: give the
// surrounding link or button an accessible name.

import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const SunIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </Icon>
)

export const MoonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </Icon>
)

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Icon>
)

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
)

export const LinkIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5" />
  </Icon>
)

export const GlobeIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
  </Icon>
)

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
)

export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)

export const CubeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
    <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
  </Icon>
)

export const MailIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5L12 13l8.5-6.5" />
  </Icon>
)

export const PhoneIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z" />
  </Icon>
)

export const MapPinIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
)

export const InstagramIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </Icon>
)

export const FacebookIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14.5 8H17V4.5h-2.5A4 4 0 0 0 10.5 8.5V11H8v3.5h2.5V21H14v-6.5h2.6l.4-3.5h-3V9a1 1 0 0 1 1-1z" />
  </Icon>
)

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)

/** The disclosure mark of the FAQ and the project stories: turns into × when open (CSS). */
export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

/** The flip button of the project cards: two arrows turning around. */
export const FlipIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 11a7.5 7.5 0 0 1 13-4.5l1.5 1.5" />
    <path d="M19 3.5V8h-4.5" />
    <path d="M19.5 13a7.5 7.5 0 0 1-13 4.5L5 16" />
    <path d="M5 20.5V16h4.5" />
  </Icon>
)

export const ClockIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
)

/** The placeholder of a project photo that the client has not sent yet. */
export const CameraIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
)

// Application areas (src/content/application-areas.ts, `icon`).

export const OfficeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18" />
    <path d="M8 8h3M8 12h3M8 16h3" />
  </Icon>
)

export const HotelIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" />
    <circle cx="7" cy="11.5" r="1.8" />
  </Icon>
)

export const RestaurantIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2 1.5-3 4-3 7v3h3" />
  </Icon>
)

export const SchoolIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2.5 9L12 4.5 21.5 9 12 13.5 2.5 9z" />
    <path d="M6.5 11v4.5c1.5 1.3 3.4 2 5.5 2s4-.7 5.5-2V11M21.5 9v5" />
  </Icon>
)

export const HomeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 10.5L12 4l8.5 6.5M5.5 9v11h13V9" />
    <path d="M10 20v-5h4v5" />
  </Icon>
)

export const FacadeIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="18" cy="5.5" r="2" />
    <path d="M3 21V10h12v11M3 21h18M6.5 13.5h2v2h-2zM10.5 13.5h2v2h-2zM8 21v-3h2v3" />
  </Icon>
)

/** Speech bubble with a handset: the usual "chat on WhatsApp" sign. */
export const WhatsAppIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 20l1.3-4A8.5 8.5 0 1 1 8.4 19z" />
    <path d="M9.2 8.6c.3-.6.8-.6 1-.2l.8 1.7c.1.3 0 .6-.2.8l-.5.5a5.6 5.6 0 0 0 2.4 2.4l.5-.5c.2-.2.5-.3.8-.2l1.7.8c.4.2.4.7-.2 1-1.2.8-2.8.6-4.6-1.2S8.4 9.8 9.2 8.6z" />
  </Icon>
)
