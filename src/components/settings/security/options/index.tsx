import {
  OTPStatus,
  RecoveryTokenStatus,
  type TUserSecurity,
} from '@/schemas/user'
import dynamic from 'next/dynamic'

const TOTPSetup = dynamic(
  () => import('@/components/settings/security/options/totp'),
)

const ChangePassword = dynamic(
  () => import('@/components/settings/security/options/change-password'),
)

type SecurityOptionsProps = {
  settings?: TUserSecurity
}

const SecurityOptions = ({ settings }: SecurityOptionsProps) => {
  const recoveryKeysStats = settings?.mfa?.totp?.recoveryKeys?.reduce(
    (stats, current) => {
      if (current.status === RecoveryTokenStatus.Active) ++stats.used
      else ++stats.available

      return stats
    },
    {
      used: 0,
      available: 0,
    },
  )

  return (
    <div className="flex flex-col gap-6">
      <TOTPSetup
        isConfigured={settings?.mfa?.totp?.status === OTPStatus.Active}
        recoveryKeysStats={recoveryKeysStats}
      />

      <ChangePassword />
    </div>
  )
}

export default SecurityOptions
