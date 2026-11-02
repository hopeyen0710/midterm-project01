const ICONS = {
  book: '<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',
  settings: '<path d="m10 3-1 3-3 1-3 3 2 3-1 3 3 3 3-1 3 2 3-2 3-1-1-4 2-3-3-3-3-1-1-3z"/><circle cx="12" cy="12" r="3"/>',
  hourglass: '<path d="M6 3h12M6 21h12M8 3c0 8 8 8 8 15v3M16 3c0 8-8 8-8 15v3"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>',
  sound: '<path d="m11 4-5 4H3v8h3l5 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  pendant: '<path d="M5 3c0 10 14 10 14 0M12 11l5 7-5 5-5-5z"/><path d="m12 11 1 7-1 5-1-5z"/>',
  key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9M16 16l3-3M19 19l3-3"/>',
  crown: '<path d="m3 7 5 4 4-7 4 7 5-4-2 12H5zM5 22h14"/>',
  gear: '<path d="m9 3-1 3-3 1 1 4-3 2 2 4 4-1 2 5 4-2v-3l4-1 2-4-3-2V5l-4 1-2-3z"/><circle cx="12" cy="12" r="3"/>',
  play: '<path d="m8 4 12 8-12 8z"/>',
  flip: '<path d="M4 9a8 8 0 0 1 14-4l2 3M20 3v5h-5M20 15a8 8 0 0 1-14 4l-2-3M4 21v-5h5"/>',
};
export const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;
