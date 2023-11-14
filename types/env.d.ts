export {}

declare global {
  module NodeJS {
    interface ProcessEnv {
      // Cookies
      COOKIES_CONSENTING: string

      // Session
      /**
       * @server-side-only
       */
      SESSION_COOKIE_NAME: string
      /**
       * @server-side-only
       */
      SESSION_COOKIE_PASSWORD: string

      SESSION_STORE_KEY: string
      SESSION_FINGERPRINT_KEY: string

      /**
       * @server-side-only
       * Time in seconds
       */
      SESSION_DEFAULT_TTL: `${number}`
      /**
       * @server-side-only
       * Time in seconds
       */
      SESSION_EXTENDED_TTL: `${number}`

      /**
       * @server-side-only
       */
      MFA_TOTP_SECRET: string
      /**
       * @server-side-only
       */
      MFA_TOTP_SECRET_HASH: string
      /**
       * @server-side-only
       */
      MFA_TOTP_USER_SECRET_KEY: string
      /**
       * @server-side-only
       */
      MFA_TOTP_USER_SECRET_KEY_HASH: string
      /**
       * @server-side-only
       **/
      MFA_TOTP_APP_LABEL: string
      /**
       * @server-side-only
       */
      MFA_RECOVERY_TOKENS_SECRET: string

      // App identity
      BRAND_NAME: string
      BRAND_JURIDICAL_NAME: string
      BRAND_DESCRIPTION: string

      // ReCaptcha config keys
      CAPTCHA_VERIFIER_API: string
      CAPTCHA_KEY: string
      /**
       * @server-side-only
       */
      CAPTCHA_SECRET: string
      CAPTCHA_MIN_SCORE: `${number}`

      // MongoDB config
      /**
       * @server-side-only
       */
      MONGODB_URI: string
      /**
       * @server-side-only
       */
      MONGODB_NAME: string

      // Session handling
      PASSWORD_SECURITY_CLIENT_SALT: string
      /**
       * @server-side-only
       */
      PASSWORD_SECURITY_SERVER_SALT: string

      // Global security keys
      /**
       * @server-side-only
       */
      ACCESS_TOKEN_HASH_ALGORITHM: string
      /**
       * @server-side-only
       */
      ACCESS_TOKEN_HASH_SERVER_SALT: string

      /**
       * @server-side-only
       */
      SECURE?: 'true' | 'false'
    }
  }
}
