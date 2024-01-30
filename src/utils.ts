import {
  isValidPrivate
} from '@ethereumjs/util';

import randombytes from "randombytes";

/**
 * Generate and validate a new random key of 32 bytes.
 *
 * @returns Buffer The generated key.
 */
export function generateKey(): Buffer {
  const privateKey = randombytes(32);

  if (!isValidPrivate(privateKey)) {
    throw new Error(
      "Private key does not satisfy the curve requirements (ie. it is invalid)"
    );
  }
  return privateKey;
}