import { SettingId } from '@/lib/enumerators'
import ArrowLeftOnRectangleIcon from '@heroicons/react/24/outline/ArrowLeftOnRectangleIcon'
import BellAlertIcon from '@heroicons/react/24/outline/BellAlertIcon'
import DocumentMagnifyingGlassIcon from '@heroicons/react/24/outline/DocumentMagnifyingGlassIcon'
import FingerPrintIcon from '@heroicons/react/24/outline/FingerPrintIcon'
import UserCircleIcon from '@heroicons/react/24/outline/UserCircleIcon'
import type { Merge, MergeExclusive } from 'type-fest'

export type NavigationLinkConfig = {
  name: string
  href: string
}

export const adminNavigationLinks: Array<NavigationLinkConfig> = [
  { name: 'Console', href: '/admin/console' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Projects', href: '/admin/projects' },
  { name: 'Tickets', href: '/admin/tickets' },
]

export const clientNavigationLinks: Array<NavigationLinkConfig> = [
  { name: 'Dashboard', href: '/my/dashboard' },
  { name: 'Projects', href: '/my/projects' },
  { name: 'Tickets', href: '/my/tickets' },
]

export const settingsLinks: Array<{
  name: SettingId
  description: string
  href: string
  icon: React.ForwardRefExoticComponent<
    Merge<
      Merge<
        React.PropsWithoutRef<React.SVGProps<SVGSVGElement>>,
        React.RefAttributes<SVGSVGElement>
      >,
      {
        title?: string
        titleId?: string
      }
    >
  >
}> = [
  {
    name: SettingId.Profile,
    description: 'View or update your account settings',
    href: '/account/settings/profile',
    icon: UserCircleIcon,
  },
  {
    name: SettingId.Notifications,
    description: 'Configure how your notifications are sent',
    href: '/account/settings/notifications',
    icon: BellAlertIcon,
  },
  {
    name: SettingId.Security,
    description: 'Check your security settings',
    href: '/account/settings/security',
    icon: FingerPrintIcon,
  },
]

export const settingsQuickActions: Array<
  Extend<
    {
      name: string
      icon: React.ForwardRefExoticComponent<
        Merge<
          Omit<React.SVGProps<SVGSVGElement>, 'ref'>,
          Merge<
            {
              title?: string | undefined
              titleId?: string | undefined
            },
            React.RefAttributes<SVGSVGElement>
          >
        >
      >
    },
    MergeExclusive<
      {
        href: string
        newTab?: boolean
      },
      {
        action: () => void
      }
    >
  >
> = [
  {
    name: 'User guide',
    href: '/user-guide',
    icon: DocumentMagnifyingGlassIcon,
    newTab: true,
  },
  {
    name: 'Logout',
    href: '/logout',
    icon: ArrowLeftOnRectangleIcon,
  },
]
