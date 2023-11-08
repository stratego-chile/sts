'use client'

import {
  AccountRole,
  AccountSpecsVersion,
  AccountStatus,
  type TEditableUser,
  type TUserProfile,
} from '@/schemas/user'
import classNames from 'classnames'
import { useFormik } from 'formik'
import merge from 'lodash.merge'
import dynamic from 'next/dynamic'
import { Suspense, useCallback, useEffect, useId } from 'react'
import type { Merge } from 'type-fest'

const FloatingLabel = dynamic(() => import('@/components/misc/floating-label'))

const FloatingLabelSelect = dynamic(
  () => import('@/components/misc/floating-label-select'),
)

const FloatingLabelCombobox = dynamic(
  () => import('@/components/misc/floating-label-combobox'),
)

type UserCreationFormProps = {
  parentId?: Stratego.STS.Utils.UUID
  selectableParentUsers?: Array<{
    id: Stratego.STS.Utils.UUID
    name: string
  }>
  onSubmit?: (values: Merge<TEditableUser, Omit<TUserProfile, 'icon'>>) => void
  onCancel?: () => void
}

const UserCreationForm = ({
  parentId,
  selectableParentUsers,
  onSubmit,
  onCancel,
}: UserCreationFormProps) => {
  const controlIdSuffix = useId()

  const getControlId = useCallback(
    (name: string) => name.concat(' ', controlIdSuffix),
    [controlIdSuffix],
  )

  const { handleChange, handleSubmit, setValues, values } = useFormik<
    Merge<TEditableUser, Omit<TUserProfile, 'icon'>>
  >({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: AccountRole.Client,
      status: AccountStatus.Inactive,
      parentId: '' as Stratego.STS.Utils.UUID,
      accountSpecs: {
        version: AccountSpecsVersion.Default,
        allowedMembers: 0,
        allowedProjects: 0,
        allowedTickets: 0,
      },
    },
    onSubmit: ($values) => onSubmit?.($values),
  })

  useEffect(() => {
    if (parentId)
      setValues(($values) =>
        merge($values, {
          parentId,
          role: AccountRole.ClientPeer,
        }),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId])

  return (
    <form className="flex flex-col p-4 gap-4" onSubmit={handleSubmit}>
      <div className="inline-flex flex-col gap-4">
        <span className="text-lg font-medium">Account profile</span>

        <code>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </code>

        <section className="grid grid-cols-2 gap-4">
          <FloatingLabel
            name="firstName"
            label="First name"
            id={getControlId('firstName')}
            className="inline-flex col-span-2 lg:col-span-1"
            value={values.firstName}
            onChange={handleChange}
          />

          <FloatingLabel
            name="lastName"
            label="Last name"
            id={getControlId('lastName')}
            className="inline-flex col-span-2 lg:col-span-1"
            value={values.lastName}
            onChange={handleChange}
          />

          <FloatingLabel
            name="email"
            label="Email"
            id={getControlId('email')}
            type="email"
            className="inline-flex col-span-2"
            value={values.email as string}
            onChange={handleChange}
          />

          <FloatingLabelSelect
            name="role"
            label="Role"
            id={getControlId('role')}
            className="inline-flex bg-white col-span-2 lg:col-span-1"
            options={[
              { value: AccountRole.Client, label: 'Client' },
              { value: AccountRole.ClientPeer, label: 'Client peer' },
              { value: AccountRole.Admin, label: 'Admin' },
              { value: AccountRole.Auditor, label: 'Auditor' },
            ]}
            value={values.role}
            onChange={handleChange}
            disabled={!!parentId}
          />

          {values.role === AccountRole.ClientPeer && (
            <FloatingLabelCombobox
              name="parentId"
              label="Parent client"
              className="inline-flex col-span-2 lg:col-span-1"
              initialValue={values.parentId}
              options={selectableParentUsers?.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              onChange={(value) => {
                setValues(($values) =>
                  merge($values, {
                    parentId: value,
                  }),
                )
              }}
              value={values.parentId}
              disabled={!!parentId}
              readOnly={!!parentId}
            />
          )}

          <FloatingLabelSelect
            name="status"
            label="Status"
            id={getControlId('status')}
            className="inline-flex bg-white col-span-2 lg:col-span-1"
            options={[
              { value: AccountStatus.Active, label: 'Active' },
              { value: AccountStatus.Inactive, label: 'Inactive' },
            ]}
            value={values.status}
            onChange={handleChange}
          />
        </section>
      </div>

      {[AccountRole.Admin, AccountRole.Client].includes(values.role) && (
        <div className="inline-flex flex-col gap-4">
          <span className="text-lg font-medium">Account specs</span>

          <section className="grid grid-cols-2 gap-4">
            <Suspense>
              <FloatingLabelSelect
                name="accountSpecs.version"
                label="Version"
                id={getControlId('accountSpecs.version')}
                className="inline-flex bg-white col-span-2 lg:col-span-1"
                options={Array.from(
                  new Set(Object.values(AccountSpecsVersion)).values(),
                ).map((version) => ({ value: version, label: version }))}
                value={values.accountSpecs?.version}
                onChange={handleChange}
                disabled
              />
            </Suspense>

            <Suspense>
              <FloatingLabel
                name="accountSpecs.allowedMembers"
                label="Allowed members"
                id={getControlId('accountSpecs.allowedMembers')}
                type="number"
                className="inline-flex col-span-2 lg:col-span-1"
                value={values.accountSpecs?.allowedMembers ?? 0}
                onChange={handleChange}
              />
            </Suspense>

            <Suspense>
              <FloatingLabel
                name="accountSpecs.allowedProjects"
                label="Allowed projects"
                id={getControlId('accountSpecs.allowedProjects')}
                type="number"
                className="inline-flex col-span-2 lg:col-span-1"
                value={values.accountSpecs?.allowedProjects ?? 0}
                onChange={handleChange}
              />
            </Suspense>

            <Suspense>
              <FloatingLabel
                name="accountSpecs.allowedTickets"
                label="Allowed tickets"
                id={getControlId('accountSpecs.allowedTickets')}
                type="number"
                className="inline-flex col-span-2 lg:col-span-1"
                value={values.accountSpecs?.allowedTickets ?? 0}
                onChange={handleChange}
              />
            </Suspense>
          </section>

          <p className="italic text-sm text-gray-400">
            By default, the allowed value for each of the above specs is 0,
            which means there is no limit.
          </p>
        </div>
      )}

      <div
        className={classNames(
          'inline-flex flex-col lg:flex-row justify-end gap-2 p-4 -m-4 mt-2',
          'bg-gray-50 border-t border-gray-200',
        )}
      >
        <button
          type="submit"
          className={classNames(
            'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm',
            'focus:outline-none focus:ring-0 focus:ring-offset-2  disabled:opacity-50 disabled:cursor-not-allowed',
            'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-600',
          )}
        >
          Create
        </button>

        <button
          type="button"
          className={classNames(
            'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm',
            'focus:outline-none focus:ring-0 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
            'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-100',
          )}
          onClick={() => onCancel?.()}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default UserCreationForm
