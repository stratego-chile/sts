'use client'

import { fetcher } from '@/lib/fetcher'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const LogoutPage = () => {
  const router = useRouter()

  useEffect(() => {
    fetcher('/api/session/logout', {
      method: 'HEAD',
    })
      .then(() => {
        localStorage.removeItem(process.env.SESSION_STORE_KEY)
      })
      .catch(() => router.replace('/'))
      .finally(() => router.replace('/'))
  }, [router])

  return <p>Logging out...</p>
}

export default LogoutPage
