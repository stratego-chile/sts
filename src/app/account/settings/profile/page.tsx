'use client'

import Loading from '@/app/account/loading'
import { fetcher } from '@/lib/fetcher'
import { TUserProfile } from '@/schemas/user'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import useSWR from 'swr'

const ProfileForm = dynamic(() => import('@/components/settings/profile-form'))

const ProfileSettingsPage = () => {
  const { data: userProfile, mutate } = useSWR<
    Extend<
      TUserProfile,
      {
        email: string
      }
    >
  >('/api/session/user/profile', fetcher)

  return (
    <section className="flex flex-col flex-grow gap-4 w-full pb-24">
      <p className="mt-1 text-sm leading-6 text-gray-600">
        This information will be displayed to other people, please be
        respectful.
      </p>

      {userProfile?.email && (
        <Suspense fallback={<Loading />}>
          <ProfileForm profile={userProfile} onUpdateSuccess={() => mutate()} />
        </Suspense>
      )}
    </section>
  )
}

export default ProfileSettingsPage
