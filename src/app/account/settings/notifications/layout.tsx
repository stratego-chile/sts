import { getPageTitle } from '@/lib/format'
import { Fragment } from 'react'

export const metadata = {
  title: getPageTitle('Notifications Settings'),
}

const NotificationSettingsLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  return <Fragment>{children}</Fragment>
}

export default NotificationSettingsLayout
