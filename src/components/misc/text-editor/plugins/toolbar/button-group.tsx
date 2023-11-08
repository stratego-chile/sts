'use client'

import classNames from 'classnames'

type ToolbarButtonGroupProps = {
  controls: Array<{
    action: () => void
    icon: React.ReactNode
    label: string
    title?: string | undefined
    isActive?: boolean
  }>
}

const ToolbarButtonGroup = ({ controls }: ToolbarButtonGroupProps) => {
  return (
    <span className="inline-flex flex-wrap w-full lg:w-auto items-center lg:gap-2">
      {controls.map((control, key) => (
        <button
          key={key}
          onClick={control.action}
          className={classNames(
            'block p-2 justify-between items-center rounded w-auto shadow',
            'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
            control.isActive && 'bg-gray-200 bg-opacity-60',
          )}
          aria-label={control.label}
          title={control.title}
        >
          {control.icon}
        </button>
      ))}
    </span>
  )
}

export default ToolbarButtonGroup
