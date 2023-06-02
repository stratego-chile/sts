import { IconType } from '@/lib/enumerators'
import type { TUserProfileIcon } from '@/schemas/user'
import dynamic from 'next/dynamic'

const UserImage = dynamic(() => import('@/components/user/image-icon'))

const UserColoredIcon = dynamic(() => import('@/components/user/colored-icon'))

type UserIconProps = {
  icon?: TUserProfileIcon
  size?: number
  sizeUnit?: 'px' | 'em' | 'rem'
  userInitialLetter?: string
}

const UserIcon = ({
  icon,
  size = 1.8,
  sizeUnit = 'em',
  userInitialLetter,
}: UserIconProps) => {
  const { color, prefer = IconType.Image, url } = icon ?? {}

  return (
    <span>
      {prefer === IconType.Image && url && (
        <UserImage imageURI={url} size={size} sizeUnit={sizeUnit} ssr={false} />
      )}

      {prefer === IconType.Color && color && (
        <UserColoredIcon
          size={size}
          sizeUnit={sizeUnit}
          color={color}
          content={userInitialLetter}
        />
      )}
    </span>
  )
}

export default UserIcon
