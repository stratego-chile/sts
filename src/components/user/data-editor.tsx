'use client'

import IdSelector from '@/components/misc/id-selector'
import Spinner from '@/components/misc/spinner'
import { filteredUserParameters } from '@/helpers/user-edit'
import { isSerializable } from '@/lib/assert'
import { fetcher } from '@/lib/fetcher'
import { type TEditableUser, type TUser } from '@/schemas/user'
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon'
import classNames from 'classnames'
import isEqual from 'lodash.isequal'
import type { OptionalId, WithId } from 'mongodb/mongodb'
import dynamic from 'next/dynamic'
import { Fragment, Suspense, useMemo, useState } from 'react'
import useBeforeUnload from 'react-use/lib/useBeforeUnload'
import useSWR from 'swr'

const CodeEditor = dynamic(() => import('@monaco-editor/react'))

function filteredUser(user: OptionalId<WithId<TUser>>) {
  const $user = { ...user }

  filteredUserParameters().forEach((prop) => {
    delete $user[prop]
  })

  return $user as unknown as TEditableUser
}

type UserDataEditorProps = {
  userId: Stratego.STS.Utils.UUID
  mode: 'edit' | 'view'
  onExit?: (changed?: boolean) => void
}

const UserDataEditor = ({ userId, mode, onExit }: UserDataEditorProps) => {
  const userSchemaURI = '/api/schemas/user.json?variant=editable'

  const userGetPath = useMemo(() => `/api/user/${userId}`, [userId])

  const { data: userSchema, isLoading } = useSWR(userSchemaURI, fetcher)

  const { data: userWithMongoId } = useSWR<OptionalId<WithId<TUser>>>(
    userGetPath,
    fetcher,
  )

  const user = useMemo(() => {
    if (!userWithMongoId) return undefined

    return filteredUser(userWithMongoId)
  }, [userWithMongoId])

  const [updatedUser, setUpdatedUser] = useState(user)

  const hasPendingChanges = useMemo(
    () => (mode === 'edit' ? !isEqual(user, updatedUser) : false),
    [mode, updatedUser, user],
  )

  useBeforeUnload(hasPendingChanges, 'You have unsaved changes, are you sure?')

  return (
    <div className="flex flex-col gap-4 w-full">
      {isLoading && (
        <span className="flex w-full justify-center">
          <Spinner />
        </span>
      )}

      {user && (
        <Fragment>
          <section className="flex flex-col flex-wrap gap-3 lg:gap-1 justify-center lg:justify-between">
            <span className="flex flex-col lg:flex-row gap-3 justify-center lg:justify-between">
              <span className="flex gap-1 order-2 lg:order-1 font-bold">
                <span>{mode === 'edit' ? 'Editing' : 'Viewing'}:</span>

                {userWithMongoId && (
                  <span className="inline-flex gap-1">
                    <span>{userWithMongoId.settings.profile.firstName}</span>
                    <span>{userWithMongoId.settings.profile.lastName}</span>
                  </span>
                )}
              </span>

              {mode === 'edit' && hasPendingChanges && (
                <span
                  className={classNames(
                    'inline-flex order-1 lg:order-2 items-center gap-1 py-1 px-1.5',
                    'rounded text-sm font-bold bg-orange-400 bg-opacity-80 text-black',
                  )}
                >
                  <ExclamationTriangleIcon className="inline-flex h-5 w-5" />

                  <span className="inline-flex">You have unsaved changes</span>
                </span>
              )}
            </span>

            <IdSelector id={userId} label="User UUID" />
          </section>

          <Suspense
            fallback={
              <span className="flex w-full justify-center">
                <Spinner />
              </span>
            }
          >
            <CodeEditor
              className="border border-gray-200 rounded-lg"
              options={{
                minimap: {
                  enabled: false,
                },
                readOnly: mode === 'view',
                renderLineHighlight: 'all',
                wordWrap: 'on',
                wordWrapColumn: 80,
                wrappingIndent: 'deepIndent',
                wrappingStrategy: 'advanced',
              }}
              beforeMount={(monaco) => {
                monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                  validate: true,
                  schemas: [
                    {
                      uri: userSchemaURI,
                      fileMatch: ['*'],
                      schema: userSchema ? userSchema : undefined,
                    },
                  ],
                })
              }}
              height="70vh"
              language="json"
              value={JSON.stringify(user, null, 2)}
              onChange={(value) => {
                if (value && isSerializable<TEditableUser>(value)) {
                  try {
                    const $updatedUser = JSON.parse(value)
                    setUpdatedUser($updatedUser)
                  } catch {
                    // NOP
                  }
                }
              }}
            />
          </Suspense>
        </Fragment>
      )}

      <section className="flex flex-row-reverse lg:flex-row lg:justify-end gap-2 lg:gap-0">
        {mode === 'edit' && hasPendingChanges && (
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
            onClick={() => onExit?.(true)}
          >
            Proceed
          </button>
        )}

        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-400 sm:ml-3 sm:w-auto"
          onClick={() => onExit?.(false)}
        >
          Close
        </button>
      </section>
    </div>
  )
}

export default UserDataEditor
