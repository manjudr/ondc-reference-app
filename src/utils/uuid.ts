import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return uuidv4();
}

