import type { ActionMenuProps } from '@/components/misc/action-menu'
import { userRoleColors, userStatusColors } from '@/helpers/default-colors'
import { getMonoContrast } from '@/lib/colors'
import {
  OTPStatus,
  type AccountRole,
  type AccountStatus,
  type TUser,
} from '@/schemas/user'
import CheckIcon from '@heroicons/react/20/solid/CheckIcon'
import EllipsisHorizontalIcon from '@heroicons/react/20/solid/EllipsisHorizontalIcon'
import capitalize from '@stdlib/string/capitalize'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import classNames from 'classnames'
import fromUnixTime from 'date-fns/fromUnixTime'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const ActionMenu = dynamic(() => import('@/components/misc/action-menu'))

type ColumnsFactoryConfig = {
  userSelectionOptions: (
    props: CellContext<TUser, TUser>,
  ) => Array<NonNullable<Flatten<ActionMenuProps['options']>>>
}

export function columnsFactory({
  userSelectionOptions,
}: ColumnsFactoryConfig): Array<ColumnDef<TUser>> {
  return [
    {
      header: 'Email',
      accessorKey: 'email',
      enablePinning: true,
      cell: (props) => (
        <div className="flex justify-between gap-4 items-center">
          <section className="inline-flex flex-col">
            <span className="select-all">{props.getValue<string>()}</span>
          </section>

          <section className="inline-flex gap-2 items-center">
            <Suspense>
              <ActionMenu
                className={classNames(
                  'rounded whitespace-nowrap p-1 border',
                  'bg-white text-gray-900 hover:bg-gray-100 border-gray-100',
                  'transition-colors ease-in-out duration-200',
                )}
                content={
                  <EllipsisHorizontalIcon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                }
                options={userSelectionOptions(
                  props as CellContext<TUser, TUser>,
                )}
                showArrow={false}
              />
            </Suspense>
          </section>
        </div>
      ),
      footer: (props) => props.column.id,
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (props) => (
        <div
          className="py-1 px-2 lg:py-0.5 rounded text-center"
          style={{
            backgroundColor: userRoleColors[props.getValue<AccountRole>()],
            color: getMonoContrast(
              userRoleColors[props.getValue<AccountRole>()],
            ),
          }}
        >
          {capitalize(props.getValue<AccountRole>().toLowerCase())}
        </div>
      ),
      footer: (props) => props.column.id,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (props) => (
        <div
          className="py-1 px-2 lg:py-0.5 rounded text-center"
          style={{
            backgroundColor: userStatusColors[props.getValue<AccountStatus>()],
            color: getMonoContrast(
              userStatusColors[props.getValue<AccountStatus>()],
            ),
          }}
        >
          {capitalize(props.getValue<AccountStatus>().toLowerCase())}
        </div>
      ),
      footer: (props) => props.column.id,
    },
    {
      header: '2FA',
      accessorKey: 'settings.security.mfa',
      cell: (props) => (
        <div className="flex items-center justify-start h-full">
          <section className="inline-flex items-center">
            {props.getValue<TUser['settings']['security']['mfa']>()?.totp
              .status === OTPStatus.Active && (
              <CheckIcon className="h-4 w-4 text-green-500" />
            )}
          </section>
        </div>
      ),
      footer: (props) => props.column.id,
    },
    {
      header: 'Created at',
      accessorKey: 'createdAt',
      cell: (props) => fromUnixTime(props.getValue<number>()).toLocaleString(),
      footer: (props) => props.column.id,
    },
    {
      header: 'Updated at',
      accessorKey: 'updatedAt',
      cell: (props) => fromUnixTime(props.getValue<number>()).toLocaleString(),
      footer: (props) => props.column.id,
    },
    {
      header: 'Access attempts',
      accessorKey: 'accessAttempts',
      cell: (props) => props.getValue<Unset<[]>>()?.length ?? 0,
      footer: (props) => props.column.id,
    },
  ]
}
