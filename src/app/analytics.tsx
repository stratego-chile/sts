import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import { Fragment } from 'react'

const Analytics = () => {
  return (
    <Fragment>
      <VercelAnalytics />
    </Fragment>
  )
}

export default Analytics
