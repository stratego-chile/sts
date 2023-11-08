import { getPageTitle } from '@/lib/format'
import { Fragment } from 'react'

export const metadata = {
  title: getPageTitle('Profile Settings'),
}

const ProfileSettingsLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  return <Fragment>{children}</Fragment>
}

export default ProfileSettingsLayout
