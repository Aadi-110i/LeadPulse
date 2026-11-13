/** Small shared helpers used across routes and services. */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Guards UUID path parameters before they reach Postgres.
 * Without this, a malformed id raises a 22P02 driver error instead of a 404.
 */
export function isUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

/** Trims and clamps free text before it is stored. */
export function cleanText(value, maxLength = 20_000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export default { isUuid, cleanText };
