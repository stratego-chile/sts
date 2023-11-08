import { createCookieString } from '@/helpers/cookies'
import { maintainerRoles } from '@/helpers/roles'
import { Users } from '@/models/users'
import { AccountRole, AccountStatus } from '@/schemas/user'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { IronSessionOptions, sealData, unsealData } from 'iron-session'
import { cookies } from 'next/headers'

/**
 * @server-side-only
 */
export async function createSealedCookieData(
  data: Extend<
    Stratego.STS.User.CookieData,
    {
      __cookieConfig: IronSessionOptions['cookieOptions']
    }
  >,
) {
  return await sealData(
    { data },
    {
      password: process.env.SESSION_COOKIE_PASSWORD,
    },
  )
}

export function createSessionCookieString(
  cookieOptions: NonNullable<IronSessionOptions['cookieOptions']>,
  seal?: string,
) {
  return createCookieString(
    process.env.SESSION_COOKIE_NAME,
    seal ?? '',
    cookieOptions,
  )
}

/**
 * @server-side-only
 */
export async function getSessionCookie(
  $cookies: ReturnType<typeof cookies>,
): Promise<
  Nullable<
    Extend<
      Stratego.STS.User.CookieData,
      {
        __cookieConfig: IronSessionOptions['cookieOptions']
      }
    >
  >
> {
  const found = $cookies.get(process.env.SESSION_COOKIE_NAME)

  if (!found) return null

  const unsealedData = await unsealData(found.value, {
    password: process.env.SESSION_COOKIE_PASSWORD,
  })

  return unsealedData.data as Extend<
    Stratego.STS.User.CookieData,
    {
      __cookieConfig: IronSessionOptions['cookieOptions']
    }
  >
}

export function getStoreData() {
  const storedData = localStorage.getItem(process.env.SESSION_STORE_KEY)

  return storedData
    ? (JSON.parse(storedData) as Stratego.STS.User.StoreData)
    : null
}

/**
 * @server-side-only
 */
export async function checkSession(
  $cookies: ReturnType<typeof cookies>,
  allowedRoles: OptionalReadonly<Array<AccountRole>> = [],
) {
  const cookie = await getSessionCookie($cookies)

  if (!cookie) return null

  const updatedUserData = await Users.getUserByEmail(cookie.email)

  if (!updatedUserData) return null

  if (
    [AccountStatus.Inactive].includes(updatedUserData.status) ||
    (cookie?.__cookieConfig?.expires &&
      differenceInSeconds(new Date(cookie.__cookieConfig.expires), new Date()) <
        150) // Expiring in less than 5 minutes
  )
    return null

  if (allowedRoles.length > 0 && !allowedRoles.includes(cookie.role))
    return null

  return cookie
}

/**
 * @server-side-only
 */
export async function checkAdminSession($cookies: ReturnType<typeof cookies>) {
  return await checkSession($cookies, maintainerRoles)
}
