import { getSessionCookie } from '@stratego-sts/lib/session'
import { cookies } from 'next/headers'
import ClientLogout from './(client)/logout'

const ServerLogout = async () => {
  const { __cookieConfig: cookieConfig, ...user } =
    (await getSessionCookie(cookies())) ?? {}

  return cookieConfig ? (
    <ClientLogout
      user={user as Stratego.STS.User.CookieData}
      config={cookieConfig}
    />
  ) : null
}

export default ServerLogout
