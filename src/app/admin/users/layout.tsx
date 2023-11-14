import { getPageTitle } from '@/lib/format'
import { Fragment } from 'react'

export const metadata = {
  title: getPageTitle('Users administration'),
}

const UsersLayout = ({ children }: React.PropsWithChildren<WithoutProps>) => {
  return <Fragment>{children}</Fragment>
}

export default UsersLayout
