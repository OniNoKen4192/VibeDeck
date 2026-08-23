/**
 * @file utils/validation.ts
 * @description Input validation utilities for user-provided data.
 */

/** Maximum length for tag names */
export const MAX_TAG_NAME_LENGTH = 100;

/** Maximum length for button names */
export const MAX_BUTTON_NAME_LENGTH = 100;

/** Maximum length for track metadata strings */
export const MAX_METADATA_LENGTH = 500;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a tag name.
 * - Must not be empty or whitespace-only
 * - Must not exceed MAX_TAG_NAME_LENGTH characters
 */
export function validateTagName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Give the tag a name first.' };
  }

  if (trimmed.length > MAX_TAG_NAME_LENGTH) {
    return { isValid: false, error: `Tag name is too long — ${MAX_TAG_NAME_LENGTH} characters max.` };
  }

  return { isValid: true };
}

/**
 * Validates a button name.
 * - Must not be empty or whitespace-only
 * - Must not exceed MAX_BUTTON_NAME_LENGTH characters
 */
export function validateButtonName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Give the button a name first.' };
  }

  if (trimmed.length > MAX_BUTTON_NAME_LENGTH) {
    return { isValid: false, error: `Button name is too long — ${MAX_BUTTON_NAME_LENGTH} characters max.` };
  }

  return { isValid: true };
}

/**
 * Sanitizes a metadata string (title, artist, album, etc.).
 * - Trims whitespace
 * - Truncates to MAX_METADATA_LENGTH
 * - Returns null if empty after trim
 */
export function sanitizeMetadata(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.length > MAX_METADATA_LENGTH) {
    return trimmed.slice(0, MAX_METADATA_LENGTH);
  }

  return trimmed;
}
