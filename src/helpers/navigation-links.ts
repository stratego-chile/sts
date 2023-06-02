import { SettingId } from '@/lib/enumerators'
import {
  ArrowLeftOnRectangleIcon,
  BellAlertIcon,
  DocumentMagnifyingGlassIcon,
  FingerPrintIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

export const adminNavigationLinks = [
  { name: 'Console', href: '/admin/console' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Projects', href: '/admin/projects' },
  { name: 'Tickets', href: '/admin/tickets' },
]

export const clientNavigationLinks = [
  { name: 'Dashboard', href: '/account/dashboard' },
  { name: 'Projects', href: '/account/projects' },
  { name: 'Tickets', href: '/account/tickets' },
]

export const settingsLinks: Array<{
  name: SettingId
  description: string
  href: string
  icon: React.ForwardRefExoticComponent<
    Extend<
      Extend<
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
        Extend<
          Omit<React.SVGProps<SVGSVGElement>, 'ref'>,
          Extend<
            {
              title?: string | undefined
              titleId?: string | undefined
            },
            React.RefAttributes<SVGSVGElement>
          >
        >
      >
    },
    Exclusive<
      {
        href: string
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
  },
  {
    name: 'Logout',
    href: '/logout',
    icon: ArrowLeftOnRectangleIcon,
  },
]
