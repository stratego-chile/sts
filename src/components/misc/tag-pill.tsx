import { getMonoContrast } from '@/lib/colors'
import chroma from 'chroma-js'
import classNames from 'classnames'

type TagPillProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  label: string
  value: string
}

const TagPill = ({
  className,
  color,
  label,
  size = 'md',
  value,
}: TagPillProps) => {
  const emphasisColor = color ?? chroma('lightgray').hex()

  const resolvedSize = {
    sm: 'p-1 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  }[size]

  return (
    <span
      className={classNames(
        'flex rounded overflow-hidden items-center capitalize',
        className,
      )}
    >
      <span
        className={classNames(
          'inline-flex h-full bg-gray-600 text-gray-50',
          resolvedSize,
        )}
      >
        {label}
      </span>

      <span
        className={classNames('inline-flex h-full', resolvedSize)}
        style={{
          backgroundColor: emphasisColor,
          color: getMonoContrast(emphasisColor),
        }}
      >
        {value}
      </span>
    </span>
  )
}

export default TagPill
