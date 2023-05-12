import Image from 'next/image'

type UserImageIconProps = {
  imageURI: string
  ssr?: boolean
}

const UserImageIcon = ({ imageURI, ssr = true }: UserImageIconProps) => {
  return ssr ? (
    <Image
      className="relative w-full rounded-full"
      alt="user-icon-image"
      src={imageURI}
      width={128}
      height={128}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="relative w-full rounded-full"
      alt="user-icon-image"
      src={imageURI}
    />
  )
}

export default UserImageIcon
