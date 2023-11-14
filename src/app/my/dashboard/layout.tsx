import { getPageTitle } from '@/lib/format'

export const metadata = {
  title: getPageTitle('Dashboard'),
}

const AccountDashboardLayout = ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  return children
}

export default AccountDashboardLayout
