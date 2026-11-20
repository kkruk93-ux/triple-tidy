/** Original geometric icons drawn in code. No emoji, no third-party art. */

export const ICON_NAMES = [
  'apple', 'pear', 'citrus', 'berry',
  'leaf', 'bloom', 'star', 'sun',
  'moon', 'drop', 'gem', 'shell',
];

const TINTS = [
  '#E85D4C', '#8FBF3F', '#F0A202', '#5B6FD6',
  '#2F9E6B', '#E46AA0', '#E6B017', '#F28C28',
  '#6B7C9A', '#3A8FD4', '#8B5CF6', '#2A9D8F',
];

export function iconTint(type) {
  return TINTS[type % TINTS.length];
}

function apple() {
  return `
    <ellipse cx="32" cy="36" rx="16" ry="18" fill="#E85D4C"/>
    <ellipse cx="25" cy="30" rx="5" ry="7" fill="#FF9A8B" opacity="0.55"/>
    <rect x="30.2" y="12" width="3.4" height="10" rx="1.6" fill="#6B4423"/>
    <path d="M33 14c4-1 8-6 9-9-6 1-10 5-10 9z" fill="#3D8B5A"/>
  `;
}

function pear() {
  return `
    <ellipse cx="32" cy="42" rx="14" ry="13" fill="#8FBF3F"/>
    <ellipse cx="32" cy="28" rx="9" ry="12" fill="#8FBF3F"/>
    <ellipse cx="27" cy="38" rx="4" ry="6" fill="#C5E07A" opacity="0.55"/>
    <rect x="30.3" y="12" width="3.2" height="9" rx="1.5" fill="#6B4423"/>
    <path d="M34 14c3 0 6-5 6-8-5 1-8 4-8 8z" fill="#3D8B5A"/>
  `;
}

function citrus() {
  return `
    <circle cx="32" cy="34" r="18" fill="#F0A202"/>
    <circle cx="32" cy="34" r="13" fill="#FFD36A"/>
    <g stroke="#F0A202" stroke-width="1.4" fill="none">
      <path d="M32 21v26"/>
      <path d="M20.5 28.5c7 3 14 3 23 0"/>
      <path d="M20.5 39.5c7-3 14-3 23 0"/>
    </g>
    <circle cx="32" cy="34" r="2.2" fill="#F0A202"/>
    <path d="M28 16c2-5 8-6 10-2" stroke="#3D8B5A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  `;
}

function berry() {
  return `
    <circle cx="23" cy="36" r="10" fill="#5B6FD6"/>
    <circle cx="41" cy="36" r="10" fill="#4A5CC4"/>
    <circle cx="32" cy="24" r="10" fill="#6E80EA"/>
    <circle cx="20" cy="33" r="3" fill="#C5CCF8" opacity="0.55"/>
    <circle cx="38" cy="33" r="3" fill="#C5CCF8" opacity="0.4"/>
    <circle cx="29" cy="21" r="3" fill="#C5CCF8" opacity="0.55"/>
    <path d="M32 14c0 0 1-6 6-7" stroke="#3D8B5A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  `;
}

function leaf() {
  return `
    <path d="M32 12c14 8 20 22 16 34-12 2-24-8-28-22 4-8 8-10 12-12z" fill="#2F9E6B"/>
    <path d="M32 16c9 7 13 18 11 28" stroke="#1E7A52" stroke-width="1.6" fill="none"/>
    <path d="M32 22c4 2 8 6 10 12M32 30c3 2 6 5 7 9M32 38c2 1 4 3 5 6" stroke="#A6E3C4" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  `;
}

function bloom() {
  return `
    <g fill="#E46AA0">
      <ellipse cx="32" cy="18" rx="8" ry="11"/>
      <ellipse cx="32" cy="46" rx="8" ry="11"/>
      <ellipse cx="18" cy="32" rx="11" ry="8"/>
      <ellipse cx="46" cy="32" rx="11" ry="8"/>
      <ellipse cx="21" cy="21" rx="8" ry="10" transform="rotate(-45 21 21)"/>
      <ellipse cx="43" cy="43" rx="8" ry="10" transform="rotate(-45 43 43)"/>
      <ellipse cx="43" cy="21" rx="8" ry="10" transform="rotate(45 43 21)"/>
      <ellipse cx="21" cy="43" rx="8" ry="10" transform="rotate(45 21 43)"/>
    </g>
    <circle cx="32" cy="32" r="8" fill="#F6D15A"/>
    <circle cx="32" cy="32" r="3.4" fill="#E8A317"/>
  `;
}

function star() {
  return `
    <path d="M32 8l6.2 14.4 15.8 1.6-12 10.4 3.6 15.6L32 42.4 18.4 50l3.6-15.6-12-10.4 15.8-1.6z" fill="#E6B017"/>
    <path d="M32 16l4 9.4 10.2 1-7.8 6.6 2.2 10.2L32 38.2" fill="#FFE58A"/>
  `;
}

function sun() {
  return `
    <g stroke="#F28C28" stroke-width="3.2" stroke-linecap="round">
      <path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l5.5 5.5M45.5 45.5l5.5 5.5M13 51l5.5-5.5M45.5 18.5L51 13"/>
    </g>
    <circle cx="32" cy="32" r="13" fill="#F28C28"/>
    <circle cx="32" cy="32" r="9" fill="#FFD36A"/>
  `;
}

function moon() {
  return `
    <circle cx="32" cy="32" r="18" fill="#8A9BB8"/>
    <circle cx="38" cy="28" r="14" fill="#FFF4E5"/>
    <circle cx="24" cy="26" r="3.2" fill="#B7C3D9" opacity="0.85"/>
    <circle cx="22" cy="38" r="2.2" fill="#B7C3D9" opacity="0.7"/>
  `;
}

function drop() {
  return `
    <path d="M32 8c0 0 16 22 16 32a16 16 0 0 1-32 0C16 30 32 8 32 8z" fill="#3A8FD4"/>
    <path d="M26 28c2-6 6-12 8-16 8 12 12 22 8 30-6 2-14-4-16-14z" fill="#7EC2F2" opacity="0.55"/>
    <ellipse cx="26" cy="36" rx="4" ry="6" fill="#E8F6FF" opacity="0.45"/>
  `;
}

function gem() {
  return `
    <path d="M32 8l16 14-16 34L16 22z" fill="#8B5CF6"/>
    <path d="M32 8l16 14H16z" fill="#C4B5FD"/>
    <path d="M16 22h32L32 56z" fill="#7C3AED"/>
    <path d="M16 22l16 34V8z" fill="#A78BFA" opacity="0.85"/>
    <path d="M24 22h16L32 56z" fill="#6D28D9" opacity="0.45"/>
  `;
}

function shell() {
  return `
    <path d="M32 54c16 0 22-14 20-28-8 2-14 0-20-8-6 8-12 10-20 8-2 14 4 28 20 28z" fill="#2A9D8F"/>
    <path d="M32 18c6 8 12 10 20 8-1-6-8-14-20-16-12 2-19 10-20 16 8 2 14 0 20-8z" fill="#5EC8B8"/>
    <path d="M32 20v34" stroke="#1C7468" stroke-width="1.6" fill="none"/>
    <path d="M32 28c6 2 12 3 16 2M32 36c7 2 12 2 16 0M32 44c6 2 11 2 14-1" stroke="#A6EBE1" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  `;
}

const DRAW = [apple, pear, citrus, berry, leaf, bloom, star, sun, moon, drop, gem, shell];

export function iconSvg(type, size = 64) {
  const inner = DRAW[type % DRAW.length]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;
}

export function iconName(type) {
  return ICON_NAMES[type % ICON_NAMES.length];
}
