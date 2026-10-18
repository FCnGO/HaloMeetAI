/**
 * Soft pastel color palette for HoloMeet AI attendee avatars, badges, and accents.
 * 7 friendly pastel shades matching the reference design:
 * - Soft Yellow
 * - Mint
 * - Light Blue
 * - Lavender
 * - Teal
 * - Pink
 * - Peach
 */

export interface PastelColor {
  name: string;
  bg: string;
  border: string;
  text: string;
  ring: string;
  badgeBg: string;
}

export const PASTEL_PALETTE: PastelColor[] = [
  {
    name: 'Soft Yellow',
    bg: '#FEF3C7',
    border: '#FDE68A',
    text: '#92400E',
    ring: 'ring-amber-200',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  {
    name: 'Mint',
    bg: '#DCFCE7',
    border: '#BBF7D0',
    text: '#166534',
    ring: 'ring-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200'
  },
  {
    name: 'Light Blue',
    bg: '#E0F2FE',
    border: '#BAE6FD',
    text: '#0369A1',
    ring: 'ring-sky-200',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-200'
  },
  {
    name: 'Lavender',
    bg: '#F3E8FF',
    border: '#E9D5FF',
    text: '#6B21A8',
    ring: 'ring-purple-200',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-200'
  },
  {
    name: 'Teal',
    bg: '#CCFBF1',
    border: '#99F6E4',
    text: '#115E59',
    ring: 'ring-teal-200',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-200'
  },
  {
    name: 'Pink',
    bg: '#FCE7F3',
    border: '#FBCFE8',
    text: '#9D174D',
    ring: 'ring-pink-200',
    badgeBg: 'bg-pink-100 text-pink-900 border-pink-200'
  },
  {
    name: 'Peach',
    bg: '#FFEDD5',
    border: '#FED7AA',
    text: '#9A3412',
    ring: 'ring-orange-200',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-200'
  }
];

/**
 * Deterministically assigns a pastel color to a person based on their ID or name.
 */
export function getPastelTheme(identifier: string = ''): PastelColor {
  if (!identifier) return PASTEL_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PASTEL_PALETTE.length;
  return PASTEL_PALETTE[index];
}

/**
 * Extract initials from a full name (e.g. "Priya Shah" -> "PS")
 */
export function getInitials(name: string = ''): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
