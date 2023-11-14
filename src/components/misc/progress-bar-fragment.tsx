import chroma from 'chroma-js'
import classNames from 'classnames'
import Link from 'next/link'
import { createElement, useMemo } from 'react'

type GenericExtract<T, U extends T> = T extends U ? T : never

type ProgressBarFragmentType = GenericExtract<
  keyof React.ReactHTML,
  'a' | 'button' | 'div'
>

type ProgressBarFragmentProps<T extends ProgressBarFragmentType> = Extend<
  {
    label?: string
    ratio?: number
    color?: string
    type?: T
  },
  T extends 'a'
    ? { href?: string; onClick?: never }
    : T extends 'button'
    ? { onClick?: () => void; href?: never }
    : {
        href?: never
        onClick?: never
      }
>

const ProgressBarFragment = <T extends ProgressBarFragmentType>({
  type: fragmentType,
  label = '',
  ratio = 0,
  color = chroma.random().hex(),
  href,
  onClick,
}: ProgressBarFragmentProps<T>) => {
  const props = useMemo(
    () => ({
      className: classNames(
        'inline-flex ring-2 ring-white rounded h-full',
        (href || !!onClick) && 'cursor-pointer',
      ),
      style: {
        backgroundColor: color,
        width: `${ratio.toFixed(2)}%`,
      },
      'aria-label': label,
      onClick,
    }),
    [color, href, label, onClick, ratio],
  )

  return fragmentType === 'a' ? (
    <Link href={href ?? '#'} {...props} />
  ) : (
    createElement(fragmentType ?? 'div', props)
  )
}

export default ProgressBarFragment
