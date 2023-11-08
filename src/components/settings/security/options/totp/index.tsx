'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Fragment, Suspense, useState } from 'react'

const TOTPSetupModal = dynamic(
  () => import('@/components/settings/security/options/totp/setup-modal'),
)

type TOTPSetupProps = {
  isConfigured?: boolean
  recoveryKeysStats?: {
    used: number
    available: number
  }
}

const TOTPSetup = ({ isConfigured, recoveryKeysStats }: TOTPSetupProps) => {
  const [openTOTPSetup, setOpenTOTPSetup] = useState(false)

  const router = useRouter()

  return (
    <section className="flex flex-col gap-4">
      <span className="text-lg font-bold tracking-tight text-gray-900">
        Multi-factor authentication (MFA)
      </span>

      {isConfigured ? (
        <Fragment>
          <p>Second authenticator factor (TOTP) configured.</p>

          {recoveryKeysStats && (
            <p>
              Recovery keys available {recoveryKeysStats.available}/
              {recoveryKeysStats.available + recoveryKeysStats.used}
            </p>
          )}
        </Fragment>
      ) : (
        <Fragment>
          <Suspense>
            <TOTPSetupModal
              open={openTOTPSetup}
              onSuccessful={() => router.refresh()}
              onCancel={() => setOpenTOTPSetup(false)}
            />
          </Suspense>

          <div className="flex gap-2">
            <button
              className="block text-sm px-2 py-1 rounded text-white bg-blue-600 hover:bg-blue-500"
              type="button"
              onClick={() => setOpenTOTPSetup(true)}
            >
              Set up OTP 2FA
            </button>
          </div>
        </Fragment>
      )}
    </section>
  )
}

export default TOTPSetup
