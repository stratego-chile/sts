'use client' // Prevents errors when being called from client-side

import classNames from 'classnames'
import dynamic from 'next/dynamic'

export enum DisclaimerSeverity {
  Note = 'note',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}

const colors: Record<DisclaimerSeverity, string> = {
  [DisclaimerSeverity.Note]: 'bg-gray-50 ring-gray-300',
  [DisclaimerSeverity.Info]: 'bg-blue-50 ring-blue-400',
  [DisclaimerSeverity.Warning]: 'bg-yellow-50 ring-yellow-400',
  [DisclaimerSeverity.Error]: 'bg-red-50 ring-red-400',
}

const icons: Record<
  DisclaimerSeverity,
  React.ComponentType<
    Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string | undefined
      titleId?: string | undefined
    } & React.RefAttributes<SVGSVGElement>
  >
> = {
  [DisclaimerSeverity.Note]: dynamic(
    () => import('@heroicons/react/24/outline/InformationCircleIcon'),
  ),
  [DisclaimerSeverity.Info]: dynamic(
    () => import('@heroicons/react/24/outline/InformationCircleIcon'),
  ),
  [DisclaimerSeverity.Warning]: dynamic(
    () => import('@heroicons/react/24/outline/ExclamationTriangleIcon'),
  ),
  [DisclaimerSeverity.Error]: dynamic(
    () => import('@heroicons/react/24/outline/XCircleIcon'),
  ),
}

type DisclaimerProps = React.PropsWithChildren<{
  severity?: DisclaimerSeverity
}>

const Disclaimer = ({
  children,
  severity = DisclaimerSeverity.Info,
}: DisclaimerProps) => {
  return (
    <div
      className={classNames(
        'flex flex-wrap items-center gap-2 rounded p-4 ring-1',
        colors[severity],
      )}
    >
      {((Icon) => (
        <Icon className="h-8 w-8 text-gray-400" />
      ))(icons[severity])}

      <span>{children}</span>
    </div>
  )
}

export default Disclaimer
