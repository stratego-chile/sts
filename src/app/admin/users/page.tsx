'use client'

import { columnsFactory } from '@/components/user/helpers/columns'
import { ActionMode, optionsFactory } from '@/components/user/helpers/options'
import { fetcher } from '@/lib/fetcher'
import { getJaroWinkler } from '@/lib/similarity'
import { AccountRole, AccountStatus, type TUser } from '@/schemas/user'
import ArrowPathIcon from '@heroicons/react/20/solid/ArrowPathIcon'
import ChevronDoubleLeftIcon from '@heroicons/react/20/solid/ChevronDoubleLeftIcon'
import ChevronDoubleRightIcon from '@heroicons/react/20/solid/ChevronDoubleRightIcon'
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon'
import ChevronLeftIcon from '@heroicons/react/20/solid/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/react/20/solid/ChevronRightIcon'
import ChevronUpIcon from '@heroicons/react/20/solid/ChevronUpIcon'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import useDelayedState from 'use-delayed-state'

const DataEditorModal = dynamic(
  () => import('@/components/user/data-editor-modal'),
)

const UserCreationModal = dynamic(
  () => import('@/components/user/creation-modal'),
)

const FloatingLabel = dynamic(() => import('@/components/misc/floating-label'))

const StatusListSelect = dynamic(
  () => import('@/components/misc/status-list-select'),
)

const FloatingLabelSelect = dynamic(
  () => import('@/components/misc/floating-label-select'),
)

const UsersPage = () => {
  const router = useRouter()

  const searchParams = useSearchParams()

  const emailToSearch = useMemo(
    () => searchParams.get('search'),
    [searchParams],
  )

  const role = useMemo(() => searchParams.get('role'), [searchParams])

  const status = useMemo(() => searchParams.get('status'), [searchParams])

  const [email, setEmail] = useState('')

  const [createUser, setCreateUser] = useState<
    [state: boolean, parentId?: Stratego.STS.Utils.UUID]
  >([false, undefined])

  const [delayedEmailToSearch, setEmailToSearch, cancelEmailToSearchSet] =
    useDelayedState<Nullable<string>>(null)

  const {
    data: rawUsers = [],
    mutate: fetchUsers,
    isLoading,
  } = useSWR<Array<TUser>>('/api/user/list', fetcher)

  const [activeUser, setActiveUser] = useState<{
    id: Stratego.STS.Utils.UUID
    editingMode: boolean
  }>()

  const users = useMemo(
    () =>
      rawUsers.filter((user) => {
        let valid = true

        if (
          delayedEmailToSearch &&
          !getJaroWinkler(user.email as string, delayedEmailToSearch, {
            syntheticPercentage: 60,
          })
        )
          valid = false

        if (role && user.role !== role) valid = false

        if (status && user.status !== status) valid = false

        return valid
      }),
    [delayedEmailToSearch, rawUsers, role, status],
  )

  const userOptions = useCallback((props: CellContext<TUser, TUser>) => {
    return optionsFactory({
      id: props.row.original.id,
      role: props.row.original.role,
      onUserActionSelect: (id, mode) => {
        if (mode === ActionMode.Create) setCreateUser([true, id])
        else
          setActiveUser({
            id,
            editingMode: mode === ActionMode.Edit,
          })
      },
    })
  }, [])

  const columns = useMemo<Array<ColumnDef<TUser>>>(
    () =>
      columnsFactory({ userSelectionOptions: (props) => userOptions(props) }),
    [userOptions],
  )

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: users,
    enablePinning: true,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  useEffect(() => {
    if (emailToSearch) setEmail(decodeURIComponent(emailToSearch))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const url = new URL(location.href)

    if (email) url.searchParams.set('search', encodeURIComponent(email))
    else url.searchParams.delete('search')

    router.replace(url.toString())
  }, [email, router])

  useEffect(() => {
    cancelEmailToSearchSet()

    setEmailToSearch(email, 600)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  useEffect(() => {
    table.setColumnPinning({
      left: ['email'],
    })
  }, [table])

  return (
    <div>
      <header className="bg-white border-b border-b-gray-200">
        <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <span className="flex flex-col md:flex-row justify-between gap-4">
            <span className="inline-flex gap-2 md:items-center text-3xl font-bold tracking-tight text-gray-900">
              <span>Users</span>
            </span>

            <div className="flex flex-wrap gap-2 justify-end md:items-center">
              <Suspense>
                <FloatingLabel
                  label="Search by email"
                  className="inline-flex w-full md:w-auto order-3 md:order-none"
                  type="search"
                  role="search"
                  value={email}
                  name="userEmailSearch"
                  id="userEmailSearch"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Suspense>

              <Suspense>
                <StatusListSelect
                  className="inline-flex w-full md:w-auto order-4 md:order-none"
                  showControlLabel
                  statusType={AccountStatus}
                />
              </Suspense>

              <Suspense>
                <StatusListSelect
                  className="inline-flex w-full md:w-auto order-5 md:order-none"
                  pathLabel="role"
                  showControlLabel
                  statusType={AccountRole}
                />
              </Suspense>

              <section className="relative inline-flex w-full md:w-auto order-6 md:order-none">
                <Suspense>
                  <FloatingLabelSelect
                    label="Items per page"
                    className="inline-flex bg-white whitespace-nowrap w-full"
                    wrap="preserve"
                    options={[10, 20, 30, 40, 50].map((pageSize) => ({
                      label: pageSize.toString(),
                      value: pageSize,
                    }))}
                    value={table.getState().pagination.pageSize}
                    onChange={(event) =>
                      table.setPageSize(Number(event.target.value))
                    }
                    disabled={users.length <= 10}
                  />
                </Suspense>
              </section>

              <button
                className="inline-flex whitespace-nowrap order-1 md:order-last p-2 rounded text-sm bg-gray-900 text-gray-50 [&:not(disabled)]:hover:bg-gray-700"
                onClick={() => setCreateUser([true])}
              >
                Create user
              </button>

              <button
                className="inline-flex order-2 md:order-last p-2 rounded text-sm bg-blue-600 text-white [&:not(disabled)]:hover:bg-blue-500"
                onClick={async () => !isLoading && (await fetchUsers())}
                disabled={isLoading}
              >
                <ArrowPathIcon
                  className={classNames('h-5 w-5', isLoading && 'animate-spin')}
                  aria-hidden="true"
                />
              </button>
            </div>
          </span>
        </div>
      </header>

      <main className="grid mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex lg:justify-end mb-4">
          <span className="inline-flex font-bold space-x-1">
            <span className="whitespace-nowrap">Total users:</span>

            <span className="font-normal">
              {isLoading ? '--' : users.length}
            </span>
          </span>
        </div>

        <div className="grid h-auto overflow-x-auto overflow-y-hidden">
          {users.length > 0 ? (
            <table className="table-fixed border-collapse text-sm -ms-2 divide-y-2">
              <thead>
                {table.getHeaderGroups().map((headerGroup, headerGroupKey) => (
                  <tr key={headerGroupKey} className="bg-gray-50">
                    {headerGroup.headers.map((header, headerKey) => (
                      <th
                        scope="col"
                        key={headerKey}
                        className="text-start font-bold p-2 whitespace-nowrap"
                      >
                        {!header.isPlaceholder && (
                          <span
                            className={classNames(
                              'inline-flex gap-1 items-center',
                              header.column.getCanSort() &&
                                'cursor-pointer select-none',
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}

                            {{
                              asc: (
                                <ChevronUpIcon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              ),
                              desc: (
                                <ChevronDownIcon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y border-b overflow-y-visible">
                {table.getRowModel().rows.map((row, rowKey) => (
                  <tr key={rowKey}>
                    {row.getVisibleCells().map((cell, cellKey) => (
                      <td key={cellKey} className="p-2 overflow-y-visible">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span>No users found</span>
          )}
        </div>

        {users.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-end gap-2 mt-4">
            <section className="flex order-2 md:order-1 items-center gap-1 text-gray-400 text-xs">
              <span>Page</span>

              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </strong>
            </section>

            <section className="flex order-1 md:order-2 items-center gap-2 [&>:disabled]:opacity-25">
              <button
                className="border rounded p-1"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              </button>

              <button
                className="border rounded p-1"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              <button
                className="border rounded p-1"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>

              <button
                className="border rounded p-1"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronDoubleRightIcon className="h-4 w-4" />
              </button>
            </section>
          </div>
        )}
      </main>

      <Suspense>
        <UserCreationModal
          open={createUser[0]}
          parentId={createUser[1]}
          onClose={() => setCreateUser([false])}
          selectableParentUsers={users.filter(
            ({ role: $role }) => $role === AccountRole.Client,
          )}
        />
      </Suspense>

      <Suspense>
        {activeUser && (
          <DataEditorModal
            userId={activeUser.id}
            mode={activeUser.editingMode ? 'edit' : 'view'}
            open={!!activeUser}
            onExit={() => setActiveUser(undefined)}
          />
        )}
      </Suspense>
    </div>
  )
}

export default UsersPage
