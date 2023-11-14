import { getPageTitle } from '@/lib/format'
import { Fragment } from 'react'

export const metadata = {
  title: getPageTitle('Security Settings'),
}

const SecuritySettingsLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  return <Fragment>{children}</Fragment>
}

export default SecuritySettingsLayout
