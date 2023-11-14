import { CookiesConsenting } from '@/lib/enumerators'
import type { IronSessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

/**
 * @server-side-only
 */
export const createCookieString = (
  name: string,
  data: string,
  cookieOptions: NonNullable<IronSessionOptions['cookieOptions']>,
) =>
  [
    `${name}=${data}`,
    `Path=${cookieOptions.path}`,
    'SameSite=Strict',
    `Expires=${cookieOptions.expires!.toUTCString()}`,
    cookieOptions.priority ? `Priority=${cookieOptions.priority}` : undefined,
    cookieOptions.secure ? 'Secure' : undefined,
    cookieOptions.httpOnly ? 'HttpOnly' : undefined,
  ]
    .filter(Boolean)
    .join('; ')

/**
 * @server-side-only
 */
export const parseConsentingConfig = () => {
  const storedCookies = cookies()

  const doesConsentCookies = storedCookies.get(process.env.COOKIES_CONSENTING)

  const cookieConsentingConfig = new Set<CookiesConsenting>()

  if (doesConsentCookies) {
    if (doesConsentCookies.value.includes(','))
      doesConsentCookies.value
        .split(',')
        .filter((cookieConsenting) =>
          Object.values(CookiesConsenting).includes(
            cookieConsenting as CookiesConsenting,
          ),
        )
        .forEach((cookieConsenting) => {
          cookieConsentingConfig.add(cookieConsenting as CookiesConsenting)
        })
    else if (
      Object.values(CookiesConsenting).includes(
        doesConsentCookies.value.trim() as CookiesConsenting,
      )
    )
      cookieConsentingConfig.add(doesConsentCookies.value as CookiesConsenting)
  }

  return cookieConsentingConfig
}
