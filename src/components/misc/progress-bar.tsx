import { Transition } from '@headlessui/react'
import dynamic from 'next/dynamic'
import { useCallback, useMemo } from 'react'

const ProgressBarFragment = dynamic(
  () => import('@/components/misc/progress-bar-fragment')
)

export type RewriteMode = 'path' | 'query'

export type LinkConfig<S extends RewriteMode> = Extend<
  {
    rewriteMode?: S
    pathTemplate?: string
  },
  S extends 'path'
    ? {
        /**
         * @default ':search'
         */
        paramName?: `:${string}`
        queryParamName?: never
      }
    : {
        /**
         * @default 'search'
         */
        queryParamName?: S extends 'query' ? string : undefined | never
        paramName?: never
      }
>

export type ProgressBarProps<
  Keys extends keyof T,
  T extends Record<Keys, number>,
  AsLink extends boolean,
  LinkUsage extends RewriteMode
> = Extend<
  {
    stats?: T
    colors?: Record<Keys, string>
    customTotal?: number
    asLink?: AsLink
  },
  AsLink extends true
    ? {
        linkConfig: LinkConfig<LinkUsage>
        onStatClick?: never
      }
    : {
        linkConfig?: never
        onStatClick?: (stat: keyof T) => void
      }
>

const ProgressBar = <
  Keys extends string,
  T extends Record<Keys, number>,
  AsLink extends boolean,
  LinkUsage extends RewriteMode
>({
  asLink = false as AsLink,
  linkConfig,
  onStatClick,
  stats = {} as T,
  customTotal,
  colors,
}: ProgressBarProps<Keys, T, AsLink, LinkUsage>) => {
  const total = useMemo(
    () =>
      customTotal ??
      (Object.values(stats) as Array<T[keyof T]>).reduce(
        (previous, current) => previous + current,
        0
      ),
    [customTotal, stats]
  )

  const getHref = useCallback(
    (statName: Keys) => {
      if (asLink && !onStatClick) {
        const defaultParamName = 'search'
        const {
          paramName = ':' + defaultParamName,
          queryParamName = defaultParamName,
        } = linkConfig ?? {}

        if (
          linkConfig?.rewriteMode === 'path' &&
          linkConfig.pathTemplate &&
          linkConfig.pathTemplate.includes(paramName)
        ) {
          return linkConfig.pathTemplate.replace(paramName, String(statName))
        } else {
          const searchParams = new URLSearchParams()
          searchParams.set(queryParamName, String(statName))
          return linkConfig?.pathTemplate?.concat('?', searchParams.toString())
        }
      }

      return undefined
    },
    [asLink, linkConfig, onStatClick]
  )

  return (
    <Transition
      appear
      show
      enter="transition=[width] duration-[860ms] overflow-hidden"
      enterFrom="w-0"
      enterTo="w-full"
    >
      <div className="relative">
        <div className="overflow-hidden h-4 flex rounded bg-gray-100 shadow-sm">
          {Object.keys<Keys>(stats)
            .filter((statName) => stats[statName] > 0)
            .map((statName, key) => {
              const ratio =
                stats[statName] > 0 ? (stats[statName] / total) * 100 : 0

              const fragmentProps = asLink
                ? {
                    href: getHref(statName),
                  }
                : {
                    onClick: () => onStatClick?.(statName),
                  }

              return (
                <ProgressBarFragment
                  key={key}
                  type={asLink ? 'a' : onStatClick ? 'button' : 'div'}
                  label={statName}
                  ratio={ratio}
                  color={colors?.[statName]}
                  {...fragmentProps}
                />
              )
            })}
        </div>
      </div>
    </Transition>
  )
}

export default ProgressBar
