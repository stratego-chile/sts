import Loading from '@/app/my/loading'
import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import { TUserNotifications } from '@/schemas/user'
import dynamic from 'next/dynamic'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

const NotificationsForm = dynamic(
  () => import('@/components/settings/notifications/form'),
)

const getUserNotificationSettings = async (): Promise<
  PossiblyDefined<TUserNotifications>
> => {
  const user = await checkSession(cookies())

  if (!user) return undefined

  const foundUser = await Users.getUserById(user.id)

  if (!foundUser) return undefined

  return foundUser.settings.notifications
}

const NotificationSettingsPage = async () => {
  const userNotificationSettings = await getUserNotificationSettings()

  return (
    <section className="flex flex-col flex-grow w-full gap-4">
      <p className="mt-1 text-sm leading-6 text-gray-600">
        Receive notifications by:
      </p>

      {userNotificationSettings && (
        <Suspense fallback={<Loading />}>
          <NotificationsForm notificationsSettings={userNotificationSettings} />
        </Suspense>
      )}
    </section>
  )
}

export default NotificationSettingsPage
