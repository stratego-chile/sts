import Image from 'next/image'

type SizeUnit = 'px' | 'em' | 'rem'

type UserImageIconProps<S extends SizeUnit> = {
  imageURI: string
  size?: number
  sizeUnit?: S
  ssr?: S extends 'px' ? boolean : never
}

const DEFAULT_SIZE = 128

const UserImageIcon = <S extends SizeUnit>({
  imageURI,
  size = DEFAULT_SIZE,
  sizeUnit = 'px' as S,
  ssr = (sizeUnit === 'px' ? true : undefined) as UserImageIconProps<S>['ssr'],
}: UserImageIconProps<S>) => {
  return ssr ? (
    <Image
      className="relative rounded-full"
      alt="user-icon-image"
      src={imageURI}
      width={sizeUnit === 'px' ? size : DEFAULT_SIZE}
      height={sizeUnit === 'px' ? size : DEFAULT_SIZE}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="relative rounded-full"
      alt="user-icon-image"
      src={imageURI}
      style={{
        width: `${size}${sizeUnit}`,
        height: 'auto',
      }}
    />
  )
}

export default UserImageIcon
