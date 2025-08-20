/**
 * Type definitions for bcryptjs
 * Provides type information for bcryptjs functions
 */

declare module 'bcryptjs' {
  /**
   * Synchronously generates a hash for the given string.
   * @param s The string to hash
   * @param salt The salt to use, or the number of rounds to generate a salt
   * @returns The hashed string
   */
  export function hashSync(s: string, salt: string | number): string;

  /**
   * Synchronously tests a string against a hash.
   * @param s The string to compare
   * @param hash The hash to test against
   * @returns true if matching, false otherwise
   */
  export function compareSync(s: string, hash: string): boolean;

  /**
   * Asynchronously generates a hash for the given string.
   * @param s The string to hash
   * @param salt The salt to use, or the number of rounds to generate a salt
   * @param callback Callback receiving the error, if any, and the resulting hash
   * @returns void
   */
  export function hash(s: string, salt: string | number, callback: (err: Error | null, hash: string) => void): void;

  /**
   * Asynchronously compares the given data against the given hash.
   * @param s The string to compare
   * @param hash The hash to test against
   * @param callback Callback receiving the error, if any, and whether the strings match
   * @returns void
   */
  export function compare(s: string, hash: string, callback: (err: Error | null, match: boolean) => void): void;

  /**
   * Generates a salt synchronously.
   * @param rounds The number of rounds to use, defaults to 10
   * @returns The generated salt
   */
  export function genSaltSync(rounds?: number): string;

  /**
   * Generates a salt asynchronously.
   * @param rounds The number of rounds to use, defaults to 10
   * @param callback Callback receiving the error, if any, and the resulting salt
   * @returns void
   */
  export function genSalt(rounds: number, callback: (err: Error | null, salt: string) => void): void;
  export function genSalt(callback: (err: Error | null, salt: string) => void): void;

  /**
   * Gets the number of rounds used to encrypt a hash.
   * @param hash The hash to extract rounds from
   * @returns The number of rounds used
   */
  export function getRounds(hash: string): number;

  /**
   * Gets the salt portion from a hash.
   * @param hash The hash to extract salt from
   * @returns The salt portion of the hash
   */
  export function getSalt(hash: string): string;
}
