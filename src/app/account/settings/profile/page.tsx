'use client'

import Loading from '@/app/my/loading'
import Disclaimer, { DisclaimerSeverity } from '@/components/misc/disclaimer'
import { fetcher } from '@/lib/fetcher'
import { TUserProfile } from '@/schemas/user'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import useSWR from 'swr'
import type { Merge } from 'type-fest'

const ProfileForm = dynamic(() => import('@/components/settings/profile/form'))

const ProfileSettingsPage = () => {
  const { data: userProfile, mutate } = useSWR<
    Merge<
      TUserProfile,
      {
        email: string
      }
    >
  >('/api/session/user/profile', fetcher)

  return (
    <section className="flex flex-col flex-grow gap-8 w-full pb-24">
      <Disclaimer severity={DisclaimerSeverity.Note}>
        This information will be displayed to other people, please be
        respectful.
      </Disclaimer>

      {userProfile?.email && (
        <Suspense fallback={<Loading />}>
          <ProfileForm profile={userProfile} onUpdateSuccess={() => mutate()} />
        </Suspense>
      )}
    </section>
  )
}

export default ProfileSettingsPage
