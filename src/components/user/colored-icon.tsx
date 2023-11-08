import { getMonoContrast } from '@/lib/colors'
import UserIcon from '@heroicons/react/24/outline/UserIcon'
import chroma from 'chroma-js'
import classNames from 'classnames'
import { useMemo } from 'react'

type IconSize = 'inline' | number

type ColoredUserIconProps<Size extends IconSize> = Extend<
  {
    color?: string
    size?: Size
    content?: string
  },
  Size extends number
    ? {
        sizeUnit?: 'px' | 'rem' | 'em'
      }
    : {
        sizeUnit?: never
      }
>

const ColoredUserIcon = <Size extends IconSize>({
  color,
  size = 'inline' as Size,
  sizeUnit = 'px',
  content,
}: ColoredUserIconProps<Size>) => {
  const backgroundColor = useMemo(
    () => (color && chroma.valid(color) ? color : chroma.random().hex()),
    [color],
  )

  return (
    <div
      className={classNames(
        'inline-flex items-center justify-center rounded-full',
        size === 'inline' && 'h-auto w-auto',
      )}
      style={{
        backgroundColor,
        ...(typeof size === 'number'
          ? {
              height: size + sizeUnit,
              width: size + sizeUnit,
            }
          : {}),
      }}
    >
      {content ? (
        <span
          style={{
            color: getMonoContrast(backgroundColor),
            fontSize:
              size === 'inline'
                ? '0.75em'
                : `${(size as number) * 0.5}${sizeUnit}`,
          }}
        >
          {content?.charAt(0)}
        </span>
      ) : (
        <UserIcon
          aria-hidden="true"
          style={{
            color: getMonoContrast(backgroundColor),
            height:
              size === 'inline'
                ? '100%'
                : `${(size as number) * 0.5}${sizeUnit}`,
            width:
              size === 'inline'
                ? 'auto'
                : `${(size as number) * 0.5}${sizeUnit}`,
          }}
        />
      )}
    </div>
  )
}

export default ColoredUserIcon
