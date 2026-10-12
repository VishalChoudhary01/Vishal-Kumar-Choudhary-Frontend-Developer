/**
 * Centralized easing curves.
 * Reference: motion/timing spec — "fast start → controlled expansion → soft settle"
 */

/** Standard — general UI transitions */
export const easeStandard = [0.22, 1, 0.36, 1];

/** Smooth — richer, slower start, settles softly */
export const easeSmooth = [0.16, 1, 0.3, 1];

/** Linear — scroll-linked raw mapping */
export const easeLinear = "linear";

/** Ease-out — element entering */
export const easeOut = [0, 0, 0.2, 1];

/** Ease-in — element leaving */
export const easeIn = [0.4, 0, 1, 1];

/**
 * Convert a cubic-bezier array to a CSS-compatible string.
 * @param {number[]} coords - [x1, y1, x2, y2]
 * @returns {string}
 */
export function toCSSBezier(coords) {
  return `cubic-bezier(${coords.join(", ")})`;
}
