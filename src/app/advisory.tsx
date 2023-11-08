'use client'

import { Advisor } from '@/lib/advisor'
import { useEffect } from 'react'

const Advisory = () => {
  useEffect(() => new Advisor().emit(), [])

  return null as React.ReactNode
}

export default Advisory
