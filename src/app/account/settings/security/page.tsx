import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import type { TUserSecurity } from '@/schemas/user'
import { cookies } from 'next/headers'

const getUserSecuritySettings = async (): Promise<Unset<TUserSecurity>> => {
  const user = await checkSession(cookies())

  if (!user) return undefined

  const foundUser = await Users.getUserById(user.id)

  if (!foundUser) return undefined

  return foundUser.settings.security
}

const SecuritySettingsPage = async () => {
  const userSecuritySettings = await getUserSecuritySettings()

  return (
    <section className="flex flex-col flex-grow w-full gap-4">
      <pre>
        <code>
          {JSON.stringify(Object.keys(userSecuritySettings), null, 2)}
        </code>
      </pre>
    </section>
  )
}

export default SecuritySettingsPage
