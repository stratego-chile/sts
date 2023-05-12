'use client'

import { removeCookies } from 'cookies-next'
import { IronSessionOptions } from 'iron-session'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type ClientLogoutProps = {
  user?: Stratego.STS.User.CookieData
  config?: IronSessionOptions['cookieOptions']
}

const ClientLogout = ({ user, config }: ClientLogoutProps) => {
  const router = useRouter()

  useEffect(() => {
    if (user && config) {
      removeCookies(process.env.SESSION_COOKIE_NAME, {
        ...config,
        expires: config.expires ? new Date(config.expires) : undefined,
      })
    }

    router.push('/')

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, user])

  return <p>Logging out...</p>
}

export default ClientLogout
