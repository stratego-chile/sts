import {
  ArrowLeftOnRectangleIcon,
  BellAlertIcon,
  DocumentMagnifyingGlassIcon,
  FingerPrintIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { SettingId } from '@stratego-sts/lib/enumerators'

export const navigationLinks = [
  { name: 'Dashboard', href: '/account/dashboard' },
  { name: 'Projects', href: '/account/projects' },
  { name: 'Tickets', href: '/account/tickets' },
]

export const settingsLinks: Array<{
  name: SettingId
  description: string
  href: string
  icon: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
      title?: string
      titleId?: string
    } & React.RefAttributes<SVGSVGElement>
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

export const settingsQuickActions = [
  {
    name: 'User guide',
    href: '/user-guide',
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: 'Logout',
    action: () => {
      window.location.href = '/logout'
    },
    icon: ArrowLeftOnRectangleIcon,
  },
]
