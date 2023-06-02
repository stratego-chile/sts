import { AccountRole, AccountStatus } from '@/lib/enumerators'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { IronSessionOptions, sealData, unsealData } from 'iron-session'
import { cookies } from 'next/headers'

/**
 * @server-side-only
 */
export const createSealedCookieData = async (
  data: Extend<
    Stratego.STS.User.CookieData,
    {
      __cookieConfig?: IronSessionOptions['cookieOptions']
    }
  >
) =>
  await sealData(
    { data },
    {
      password: process.env.SESSION_COOKIE_PASSWORD,
    }
  )

/**
 * @server-side-only
 */
export const getSessionCookie = async (
  $cookies: ReturnType<typeof cookies>
): Promise<Extend<
  Stratego.STS.User.CookieData,
  {
    __cookieConfig?: IronSessionOptions['cookieOptions']
  }
> | null> => {
  const found = $cookies.get(process.env.SESSION_COOKIE_NAME)

  if (!found) return null

  const unsealedData = await unsealData(found.value, {
    password: process.env.SESSION_COOKIE_PASSWORD,
  })

  return unsealedData.data as Extend<
    Stratego.STS.User.CookieData,
    {
      __cookieConfig?: IronSessionOptions['cookieOptions']
    }
  >
}

export const getStoreData = () => {
  const storedData = localStorage.getItem(process.env.SESSION_STORE_KEY)

  return storedData
    ? (JSON.parse(storedData) as Stratego.STS.User.StoreData)
    : null
}

/**
 * @server-side-only
 */
export const checkSession = async (
  $cookies: ReturnType<typeof cookies>,
  allowedRoles: Array<AccountRole> = []
) => {
  const cookie = await getSessionCookie($cookies)

  if (
    !cookie ||
    cookie.status === AccountStatus.Inactive ||
    (cookie?.__cookieConfig?.expires &&
      differenceInSeconds(new Date(cookie.__cookieConfig.expires), new Date()) <
        300) // Expiring in less than 5 minutes
  )
    return null

  if (allowedRoles.length > 0 && !allowedRoles.includes(cookie.role))
    return null

  return cookie
}

/**
 * @server-side-only
 */
export const checkAdminSession = async ($cookies: ReturnType<typeof cookies>) =>
  await checkSession($cookies, [AccountRole.Admin])

export const setStoreData = (data: Stratego.STS.User.StoreData) =>
  localStorage.setItem(process.env.SESSION_STORE_KEY, JSON.stringify(data))
