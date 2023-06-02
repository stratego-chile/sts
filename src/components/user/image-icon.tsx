import Image from 'next/image'

type UserImageIconProps = {
  imageURI: string
  size?: number
  sizeUnit?: 'px' | 'em' | 'rem'
  ssr?: boolean
}

const DEFAULT_SIZE = 128

const UserImageIcon = ({
  imageURI,
  size = 128,
  sizeUnit = 'px',
  ssr = true,
}: UserImageIconProps) => {
  return ssr ? (
    <Image
      className="relative w-full rounded-full"
      alt="user-icon-image"
      src={imageURI}
      width={sizeUnit === 'px' && size ? size : DEFAULT_SIZE}
      height={sizeUnit === 'px' && size ? size : DEFAULT_SIZE}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="relative w-full rounded-full"
      alt="user-icon-image"
      src={imageURI}
      style={{
        width: size ? `${size}${sizeUnit}` : DEFAULT_SIZE,
        height: size ? `${size}${sizeUnit}` : DEFAULT_SIZE,
      }}
    />
  )
}

export default UserImageIcon
