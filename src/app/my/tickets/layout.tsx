import { getPageTitle } from '@/lib/format'
import { Fragment } from 'react'

export const metadata = {
  title: getPageTitle('Tickets'),
}

const TicketsOverviewLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  return <Fragment>{children}</Fragment>
}

export default TicketsOverviewLayout
