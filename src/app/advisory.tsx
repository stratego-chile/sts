'use client'

import { Advisor } from '@/lib/advisor'
// import { useEffect } from 'react'
import useEffectOnce from 'react-use/lib/useEffectOnce'

const Advisory = () => {
  useEffectOnce(() => {
    const advisor = new Advisor()

    advisor.emit()
  })

  return null as React.ReactNode
}

export default Advisory
