import Loading from '@/app/my/loading'
import { getSessionCookie } from '@/lib/session'
import { Users } from '@/models/users'
import dynamic from 'next/dynamic'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

const SecurityOptions = dynamic(
  () => import('@/components/settings/security/options'),
)

const SecuritySettingsPage = async () => {
  const user = await getSessionCookie(cookies())

  const userSecuritySettings = await Users.getUserById(user!.id)

  return (
    <section className="flex flex-col flex-grow w-full gap-4">
      <Suspense fallback={<Loading />}>
        <SecurityOptions settings={userSecuritySettings?.settings?.security} />
      </Suspense>
    </section>
  )
}

export default SecuritySettingsPage
