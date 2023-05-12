declare module 'salted-sha512' {
  /**
   * Hash data using salt.
   * @param {string} data Data to hash.
   * @param {string} [salt] Salt.
   * @param {boolean} [isAsync] Is async indicator. Promise returned if this parameter defined as true.
   * @returns {string|Promise<string>} Salted SHA512 hash.
   */
  export default function hash<IsAsync extends boolean = false>(
    data?: string,
    salt?: string,
    isAsync?: IsAsync
  ): IsAsync extends true ? Promise<string> : string
}
