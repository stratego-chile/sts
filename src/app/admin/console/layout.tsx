import { getPageTitle } from '@/lib/format'

export const metadata = {
  title: getPageTitle('Admin console'),
}

const ConsoleLayout = ({ children }: React.PropsWithChildren<WithoutProps>) => {
  return children
}

export default ConsoleLayout
