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

function g(inner) {
  return inner;
}

function apple() {
  return g(`
    <ellipse cx="32" cy="36" rx="16" ry="18" fill="#E85D4C"/>
    <ellipse cx="25" cy="30" rx="5" ry="7" fill="#FF9A8B" opacity="0.55"/>
    <rect x="30.2" y="12" width="3.4" height="10" rx="1.6" fill="#6B4423"/>
    <path d="M33 14c4-1 8-6 9-9-6 1-10 5-10 9z" fill="#3D8B5A"/>
  `);
}
function pear() {
  return g(`
    <ellipse cx="32" cy="42" rx="14" ry="13" fill="#8FBF3F"/>
    <ellipse cx="32" cy="28" rx="9" ry="12" fill="#8FBF3F"/>
    <ellipse cx="27" cy="38" rx="4" ry="6" fill="#C5E07A" opacity="0.55"/>
    <rect x="30.3" y="12" width="3.2" height="9" rx="1.5" fill="#6B4423"/>
    <path d="M34 14c3 0 6-5 6-8-5 1-8 4-8 8z" fill="#3D8B5A"/>
  `);
}
function citrus() {
  return g(`
    <circle cx="32" cy="34" r="18" fill="#F0A202"/>
    <circle cx="32" cy="34" r="13" fill="#FFD36A"/>
    <g stroke="#F0A202" stroke-width="1.4" fill="none">
      <path d="M32 21v26"/><path d="M20.5 28.5c7 3 14 3 23 0"/><path d="M20.5 39.5c7-3 14-3 23 0"/>
    </g>
    <circle cx="32" cy="34" r="2.2" fill="#F0A202"/>
    <path d="M28 16c2-5 8-6 10-2" stroke="#3D8B5A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  `);
}
function berry() {
  return g(`
    <circle cx="23" cy="36" r="10" fill="#5B6FD6"/>
    <circle cx="41" cy="36" r="10" fill="#4A5CC4"/>
    <circle cx="32" cy="24" r="10" fill="#6E80EA"/>
    <circle cx="20" cy="33" r="3" fill="#C5CCF8" opacity="0.55"/>
    <circle cx="38" cy="33" r="3" fill="#C5CCF8" opacity="0.4"/>
    <circle cx="29" cy="21" r="3" fill="#C5CCF8" opacity="0.55"/>
    <path d="M32 14c0 0 1-6 6-7" stroke="#3D8B5A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  `);
}
function leaf() {
  return g(`
    <path d="M32 12c14 8 20 22 16 34-12 2-24-8-28-22 4-8 8-10 12-12z" fill="#2F9E6B"/>
    <path d="M32 16c9 7 13 18 11 28" stroke="#1E7A52" stroke-width="1.6" fill="none"/>
    <path d="M32 22c4 2 8 6 10 12M32 30c3 2 6 5 7 9M32 38c2 1 4 3 5 6" stroke="#A6E3C4" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  `);
}
function bloom() {
  return g(`
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
  `);
}
function star() {
  return g(`
    <path d="M32 8l6.2 14.4 15.8 1.6-12 10.4 3.6 15.6L32 42.4 18.4 50l3.6-15.6-12-10.4 15.8-1.6z" fill="#E6B017"/>
    <path d="M32 16l4 9.4 10.2 1-7.8 6.6 2.2 10.2L32 38.2" fill="#FFE58A"/>
  `);
}
function sun() {
  return g(`
    <g stroke="#F28C28" stroke-width="3.2" stroke-linecap="round">
      <path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l5.5 5.5M45.5 45.5l5.5 5.5M13 51l5.5-5.5M45.5 18.5L51 13"/>
    </g>
    <circle cx="32" cy="32" r="13" fill="#F28C28"/>
    <circle cx="32" cy="32" r="9" fill="#FFD36A"/>
  `);
}
function moon() {
  return g(`
    <circle cx="32" cy="32" r="18" fill="#8A9BB8"/>
    <circle cx="38" cy="28" r="14" fill="#FFF4E5"/>
    <circle cx="24" cy="26" r="3.2" fill="#B7C3D9" opacity="0.85"/>
    <circle cx="22" cy="38" r="2.2" fill="#B7C3D9" opacity="0.7"/>
  `);
}
function drop() {
  return g(`
    <path d="M32 8c0 0 16 22 16 32a16 16 0 0 1-32 0C16 30 32 8 32 8z" fill="#3A8FD4"/>
    <path d="M26 28c2-6 6-12 8-16 8 12 12 22 8 30-6 2-14-4-16-14z" fill="#7EC2F2" opacity="0.55"/>
    <ellipse cx="26" cy="36" rx="4" ry="6" fill="#E8F6FF" opacity="0.45"/>
  `);
}
function gem() {
  return g(`
    <path d="M32 8l16 14-16 34L16 22z" fill="#8B5CF6"/>
    <path d="M32 8l16 14H16z" fill="#C4B5FD"/>
    <path d="M16 22h32L32 56z" fill="#7C3AED"/>
    <path d="M16 22l16 34V8z" fill="#A78BFA" opacity="0.85"/>
  `);
}
function shell() {
  return g(`
    <path d="M32 54c16 0 22-14 20-28-8 2-14 0-20-8-6 8-12 10-20 8-2 14 4 28 20 28z" fill="#2A9D8F"/>
    <path d="M32 18c6 8 12 10 20 8-1-6-8-14-20-16-12 2-19 10-20 16 8 2 14 0 20-8z" fill="#5EC8B8"/>
    <path d="M32 20v34" stroke="#1C7468" stroke-width="1.6" fill="none"/>
    <path d="M32 28c6 2 12 3 16 2M32 36c7 2 12 2 16 0M32 44c6 2 11 2 14-1" stroke="#A6EBE1" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  `);
}
function clover() {
  return g(`
    <g fill="#3BA55C">
      <ellipse cx="32" cy="20" rx="9" ry="12"/>
      <ellipse cx="20" cy="32" rx="12" ry="9"/>
      <ellipse cx="44" cy="32" rx="12" ry="9"/>
      <ellipse cx="32" cy="44" rx="9" ry="12"/>
    </g>
    <path d="M32 44c0 8 6 14 10 16" stroke="#2A7A44" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  `);
}
function daisy() {
  return g(`
    <g fill="#FFF6D8">
      <ellipse cx="32" cy="16" rx="6" ry="12"/>
      <ellipse cx="32" cy="48" rx="6" ry="12"/>
      <ellipse cx="16" cy="32" rx="12" ry="6"/>
      <ellipse cx="48" cy="32" rx="12" ry="6"/>
      <ellipse cx="20" cy="20" rx="7" ry="11" transform="rotate(-45 20 20)"/>
      <ellipse cx="44" cy="44" rx="7" ry="11" transform="rotate(-45 44 44)"/>
      <ellipse cx="44" cy="20" rx="7" ry="11" transform="rotate(45 44 20)"/>
      <ellipse cx="20" cy="44" rx="7" ry="11" transform="rotate(45 20 44)"/>
    </g>
    <circle cx="32" cy="32" r="8" fill="#F0A202"/>
  `);
}
function peach() {
  return g(`
    <ellipse cx="30" cy="36" rx="16" ry="18" fill="#F4A27A"/>
    <ellipse cx="38" cy="36" rx="14" ry="17" fill="#E8614A"/>
    <ellipse cx="26" cy="30" rx="5" ry="7" fill="#FFD0B8" opacity="0.55"/>
    <path d="M34 16c6-2 10-8 10-12-8 2-12 6-14 12z" fill="#3D8B5A"/>
    <rect x="31" y="12" width="3" height="8" rx="1.4" fill="#6B4423"/>
  `);
}
function cherry() {
  return g(`
    <circle cx="23" cy="40" r="11" fill="#D63C3C"/>
    <circle cx="41" cy="42" r="11" fill="#C62828"/>
    <circle cx="20" cy="36" r="3.2" fill="#FF9A8B" opacity="0.55"/>
    <path d="M23 30c4-12 12-18 20-20" stroke="#3D8B5A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M41 32c-2-10-6-16-10-18" stroke="#3D8B5A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  `);
}
function plum() {
  return g(`
    <ellipse cx="32" cy="36" rx="16" ry="18" fill="#7A4B9A"/>
    <ellipse cx="32" cy="36" rx="12" ry="15" fill="#9160B0"/>
    <ellipse cx="25" cy="30" rx="5" ry="7" fill="#D4B4EA" opacity="0.5"/>
    <rect x="30.4" y="12" width="3.2" height="9" rx="1.5" fill="#6B4423"/>
    <path d="M34 14c4 0 7-6 7-9-5 1-8 5-8 9z" fill="#3D8B5A"/>
  `);
}
function tulip() {
  return g(`
    <path d="M32 50V28" stroke="#2F9E6B" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 40c-8 2-12 8-12 12" stroke="#2F9E6B" stroke-width="2.2" fill="none"/>
    <path d="M20 28c0-12 8-18 12-20 4 2 12 8 12 20-4-4-8-2-12 2-4-4-8-6-12-2z" fill="#E46AA0"/>
    <path d="M26 26c2-8 6-12 6-16 4 4 8 10 8 16" fill="#F4A3C4"/>
  `);
}
function pot() {
  return g(`
    <path d="M22 28h20l-2 24H24z" fill="#C46A3A"/>
    <path d="M24 28h16l-1.6 20H25.6z" fill="#D9844E"/>
    <rect x="18" y="22" width="28" height="8" rx="2" fill="#A6562E"/>
    <path d="M32 22c0-8 8-12 10-16-8 1-14 6-14 16z" fill="#2F9E6B"/>
    <circle cx="28" cy="16" r="3" fill="#E46AA0"/>
  `);
}
function sunflower() {
  return g(`
    <g fill="#F0A202">
      <ellipse cx="32" cy="14" rx="6" ry="11"/>
      <ellipse cx="32" cy="50" rx="6" ry="11"/>
      <ellipse cx="14" cy="32" rx="11" ry="6"/>
      <ellipse cx="50" cy="32" rx="11" ry="6"/>
      <ellipse cx="19" cy="19" rx="6" ry="10" transform="rotate(-45 19 19)"/>
      <ellipse cx="45" cy="45" rx="6" ry="10" transform="rotate(-45 45 45)"/>
      <ellipse cx="45" cy="19" rx="6" ry="10" transform="rotate(45 45 19)"/>
      <ellipse cx="19" cy="45" rx="6" ry="10" transform="rotate(45 19 45)"/>
    </g>
    <circle cx="32" cy="32" r="10" fill="#6B4423"/>
    <circle cx="32" cy="32" r="6" fill="#3E2A16"/>
  `);
}
function lily() {
  return g(`
    <ellipse cx="32" cy="44" rx="20" ry="8" fill="#7EC2A0"/>
    <ellipse cx="32" cy="44" rx="10" ry="4" fill="#4E9E7A"/>
    <path d="M22 40c-2-16 6-26 10-28 4 2 12 12 10 28-6-6-14-6-20 0z" fill="#F6F0FF"/>
    <path d="M32 14v26" stroke="#E46AA0" stroke-width="1.6"/>
    <circle cx="32" cy="14" r="3" fill="#E6B017"/>
  `);
}
function reed() {
  return g(`
    <path d="M22 56c2-20 2-32-2-44" stroke="#2F7A4A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M32 56c0-22 4-34 8-44" stroke="#3D8B5A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M42 56c-2-18 4-30 8-42" stroke="#2F7A4A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="20" cy="12" rx="5" ry="8" fill="#8FBF3F"/>
    <ellipse cx="40" cy="10" rx="5" ry="8" fill="#6FAF4A"/>
    <ellipse cx="50" cy="12" rx="5" ry="8" fill="#8FBF3F"/>
  `);
}
function fish() {
  return g(`
    <ellipse cx="30" cy="32" rx="16" ry="11" fill="#3A8FD4"/>
    <path d="M46 32l12-10v20z" fill="#2B6FAE"/>
    <circle cx="24" cy="30" r="2.4" fill="#14324A"/>
    <path d="M20 32c6 4 14 4 20 0" stroke="#7EC2F2" stroke-width="1.6" fill="none"/>
    <path d="M30 21c-4 0-6-6-4-8" stroke="#2B6FAE" stroke-width="2" fill="none"/>
  `);
}
function pebble() {
  return g(`
    <ellipse cx="24" cy="40" rx="14" ry="10" fill="#7A8B9A"/>
    <ellipse cx="42" cy="36" rx="12" ry="9" fill="#93A4B3"/>
    <ellipse cx="32" cy="24" rx="11" ry="8" fill="#6B7C8C"/>
    <ellipse cx="20" cy="38" rx="4" ry="2.4" fill="#C5D0D8" opacity="0.5"/>
  `);
}
function pine() {
  return g(`
    <path d="M32 6l16 18H16z" fill="#1E7A52"/>
    <path d="M32 16l18 20H14z" fill="#2F9E6B"/>
    <path d="M32 28l20 22H12z" fill="#1E5C3A"/>
    <rect x="29" y="48" width="6" height="10" fill="#6B4423"/>
  `);
}
function acorn() {
  return g(`
    <path d="M22 28h20c1 2 2 4 2 6 0 12-6 22-12 22S20 46 20 34c0-2 1-4 2-6z" fill="#C46A3A"/>
    <path d="M18 24c0-8 6-14 14-14s14 6 14 14H18z" fill="#6B4423"/>
    <rect x="30" y="8" width="4" height="8" rx="2" fill="#4A2E18"/>
    <ellipse cx="26" cy="36" rx="4" ry="6" fill="#E8A070" opacity="0.4"/>
  `);
}
function mushroom() {
  return g(`
    <path d="M12 30c0-14 9-22 20-22s20 8 20 22H12z" fill="#E85D4C"/>
    <circle cx="22" cy="22" r="4" fill="#FFF6E8"/>
    <circle cx="34" cy="16" r="3.2" fill="#FFF6E8"/>
    <circle cx="42" cy="24" r="3.6" fill="#FFF6E8"/>
    <rect x="26" y="30" width="12" height="22" rx="6" fill="#F3E2C8"/>
  `);
}
function fern() {
  return g(`
    <path d="M32 56V10" stroke="#1E7A52" stroke-width="2.4" fill="none"/>
    <g stroke="#2F9E6B" stroke-width="2" fill="none" stroke-linecap="round">
      <path d="M32 16l-12-4M32 16l12-4"/>
      <path d="M32 24l-14 0M32 24l14 0"/>
      <path d="M32 32l-14 4M32 32l14 4"/>
      <path d="M32 40l-12 6M32 40l12 6"/>
      <path d="M32 48l-8 6M32 48l8 6"/>
    </g>
  `);
}
function pinecone() {
  return g(`
    <ellipse cx="32" cy="34" rx="14" ry="20" fill="#8B5A2B"/>
    <g fill="#6B4423">
      <ellipse cx="32" cy="18" rx="8" ry="5"/>
      <ellipse cx="24" cy="26" rx="7" ry="5"/>
      <ellipse cx="40" cy="26" rx="7" ry="5"/>
      <ellipse cx="24" cy="36" rx="7" ry="5"/>
      <ellipse cx="40" cy="36" rx="7" ry="5"/>
      <ellipse cx="32" cy="44" rx="8" ry="5"/>
    </g>
    <ellipse cx="32" cy="30" rx="4" ry="3" fill="#C48A4A" opacity="0.5"/>
  `);
}
function seed() {
  return g(`
    <ellipse cx="32" cy="34" rx="12" ry="18" fill="#C4A35A"/>
    <ellipse cx="32" cy="34" rx="8" ry="14" fill="#E6C97A"/>
    <path d="M32 16v36" stroke="#8A6A2A" stroke-width="1.4"/>
    <path d="M26 22c4 4 8 4 12 0M26 32c4 4 8 4 12 0M26 42c4 4 8 4 12 0" stroke="#8A6A2A" stroke-width="1.2" fill="none"/>
  `);
}

const BASE_DRAW = [apple, pear, citrus, berry, leaf, bloom, star, sun, moon, drop, gem, shell];
const BASE_NAMES = ICON_NAMES.slice();
const BASE_TINTS = TINTS.slice();

const SETS = {
  meadow: {
    names: ['leaf', 'bloom', 'daisy', 'clover', 'berry', 'apple', 'sun', 'drop', 'seed', 'star', 'pear', 'shell'],
    tints: ['#2F9E6B', '#E46AA0', '#F0A202', '#3BA55C', '#5B6FD6', '#E85D4C', '#F28C28', '#3A8FD4', '#C4A35A', '#E6B017', '#8FBF3F', '#2A9D8F'],
    draw: [leaf, bloom, daisy, clover, berry, apple, sun, drop, seed, star, pear, shell],
  },
  orchard: {
    names: ['apple', 'pear', 'citrus', 'peach', 'cherry', 'plum', 'berry', 'leaf', 'sun', 'bloom', 'seed', 'star'],
    tints: ['#E85D4C', '#8FBF3F', '#F0A202', '#F4A27A', '#D63C3C', '#7A4B9A', '#5B6FD6', '#2F9E6B', '#F28C28', '#E46AA0', '#C4A35A', '#E6B017'],
    draw: [apple, pear, citrus, peach, cherry, plum, berry, leaf, sun, bloom, seed, star],
  },
  garden: {
    names: ['bloom', 'tulip', 'daisy', 'sunflower', 'pot', 'leaf', 'berry', 'seed', 'clover', 'sun', 'gem', 'drop'],
    tints: ['#E46AA0', '#C85A8A', '#F0A202', '#E6B017', '#C46A3A', '#2F9E6B', '#5B6FD6', '#C4A35A', '#3BA55C', '#F28C28', '#8B5CF6', '#3A8FD4'],
    draw: [bloom, tulip, daisy, sunflower, pot, leaf, berry, seed, clover, sun, gem, drop],
  },
  pond: {
    names: ['drop', 'lily', 'reed', 'fish', 'shell', 'pebble', 'moon', 'bloom', 'gem', 'leaf', 'star', 'sun'],
    tints: ['#3A8FD4', '#7EC2A0', '#2F7A4A', '#2B6FAE', '#2A9D8F', '#7A8B9A', '#6B7C9A', '#E46AA0', '#8B5CF6', '#2F9E6B', '#E6B017', '#F28C28'],
    draw: [drop, lily, reed, fish, shell, pebble, moon, bloom, gem, leaf, star, sun],
  },
  forest: {
    names: ['pine', 'acorn', 'mushroom', 'fern', 'pinecone', 'leaf', 'moon', 'berry', 'gem', 'drop', 'star', 'seed'],
    tints: ['#1E7A52', '#C46A3A', '#E85D4C', '#2F9E6B', '#8B5A2B', '#1E5C3A', '#6B7C9A', '#5B6FD6', '#8B5CF6', '#3A8FD4', '#E6B017', '#C4A35A'],
    draw: [pine, acorn, mushroom, fern, pinecone, leaf, moon, berry, gem, drop, star, seed],
  },
};

function setFor(world) {
  return SETS[world] || SETS.meadow;
}

export function iconTint(type, world = 'meadow') {
  const set = setFor(world);
  return set.tints[type % set.tints.length];
}

export function iconName(type, world = 'meadow') {
  const set = setFor(world);
  return set.names[type % set.names.length];
}

export function iconSvg(type, size = 64, world = 'meadow') {
  const set = setFor(world);
  const inner = set.draw[type % set.draw.length]();
  return `<svg xmlns="http://www.w3.org/1996/svg" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;
}

export function worldIconSet(world) {
  return setFor(world);
}

export { BASE_DRAW, BASE_NAMES, BASE_TINTS };
