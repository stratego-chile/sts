import { checkSession } from '@stratego-sts/lib/session'
import { Users } from '@stratego-sts/models/users'
import { TUserProfile } from '@stratego-sts/schemas/user'
import dynamic from 'next/dynamic'
import { cookies } from 'next/headers'

const ProfileForm = dynamic(
  () => import('@stratego-sts/components/settings/profile-form')
)

const getUserProfile = async (): Promise<
  Unset<
    TUserProfile & {
      email: string
    }
  >
> => {
  const user = await checkSession(cookies())

  if (!user) return undefined

  const foundUser = await Users.getUserById(user.id)

  if (!foundUser) return undefined

  return {
    ...foundUser.settings.profile,
    email: foundUser.email satisfies Stratego.STS.Auth.Email,
  }
}

const ProfileSettingsPage = async () => {
  const userProfile = await getUserProfile()

  return (
    <section className="flex flex-col flex-grow gap-4 w-full pb-24">
      <p className="mt-1 text-sm leading-6 text-gray-600">
        This information will be displayed to other people, please be
        respectful.
      </p>

      {userProfile && (
        <ProfileForm email={userProfile.email} profile={userProfile} />
      )}
    </section>
  )
}

export default ProfileSettingsPage
