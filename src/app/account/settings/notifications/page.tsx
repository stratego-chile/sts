import { SettingId } from '@stratego-sts/lib/enumerators'
import { checkSession } from '@stratego-sts/lib/session'
import { Users } from '@stratego-sts/models/users'
import { TUserNotifications } from '@stratego-sts/schemas/user'
import { cookies } from 'next/headers'

const getUserNotificationSettings = async (): Promise<
  Unset<TUserNotifications>
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
      <span>{SettingId.Notifications}</span>
      <pre>
        <code>
          {JSON.stringify(Object.keys(userNotificationSettings), null, 2)}
        </code>
      </pre>
    </section>
  )
}

export default NotificationSettingsPage
