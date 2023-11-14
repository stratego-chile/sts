'use client'

import Spinner from '@/components/misc/spinner'
import { fetcher } from '@/lib/fetcher'
import CheckIcon from '@heroicons/react/24/outline/CheckIcon'
import { useFormik } from 'formik'
import dynamic from 'next/dynamic'
import { Fragment, useEffect, useState } from 'react'
import createSaltedSHA512 from 'salted-sha512'
import * as Yup from 'yup'

const PasswordInput = dynamic(() => import('@/components/misc/password-input'))

const ChangePassword = () => {
  const [isEditing, setInEditMode] = useState(false)

  const [isPasswordResetOk, setPasswordResetState] = useState(false)

  const {
    dirty,
    errors,
    handleChange,
    isSubmitting,
    resetForm,
    submitForm,
    submitCount,
    values,
  } = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    onSubmit: async ({ currentPassword, newPassword, confirmNewPassword }) => {
      const formattedData = {
        currentPassword: await createSaltedSHA512(
          currentPassword,
          process.env.PASSWORD_SECURITY_CLIENT_SALT,
          true,
        ),
        newPassword: await createSaltedSHA512(
          newPassword,
          process.env.PASSWORD_SECURITY_CLIENT_SALT,
          true,
        ),
        confirmNewPassword: await createSaltedSHA512(
          confirmNewPassword,
          process.env.PASSWORD_SECURITY_CLIENT_SALT,
          true,
        ),
      }

      const response = await fetcher<Nullable<{ success: boolean }>>(
        '/api/session/user/password',
        {
          method: 'PATCH',
          body: JSON.stringify(formattedData),
        },
      )

      if (response) setPasswordResetState(response.success)
    },
    onReset: () => {
      setInEditMode(false)
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('This field is required'),
      newPassword: Yup.string()
        .required('This field is required')
        .notOneOf(
          [Yup.ref<string>('currentPassword')],
          'New password must be different from current password',
        ),
      confirmNewPassword: Yup.string()
        .required('This field is required')
        .oneOf([Yup.ref<string>('newPassword')], 'Passwords must match'),
    }),
  })

  useEffect(() => {
    if (isPasswordResetOk && isEditing) setInEditMode(false)
  }, [isEditing, isPasswordResetOk, setInEditMode])

  return (
    <div className="flex flex-col gap-4">
      <span className="text-lg font-bold tracking-tight text-gray-900">
        Change password
      </span>

      {!isPasswordResetOk &&
        (isEditing ? (
          <Fragment>
            <div className="flex flex-col gap-4 lg:max-w-xs">
              <PasswordInput
                name="currentPassword"
                autoComplete="off"
                autoFocus={false}
                required
                className="block w-full rounded border-0 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                floatingLabel="Current password"
                wrapperClassName="relative"
                onChange={handleChange}
                value={values.currentPassword}
                warningMessage={errors.currentPassword}
              />

              <PasswordInput
                name="newPassword"
                autoComplete="off"
                autoFocus={false}
                required
                className="block w-full rounded border-0 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                floatingLabel="New password"
                wrapperClassName="relative"
                onChange={handleChange}
                value={values.newPassword}
                warningMessage={errors.newPassword}
              />

              <PasswordInput
                name="confirmNewPassword"
                autoComplete="off"
                autoFocus={false}
                required
                className="block w-full rounded border-0 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                floatingLabel="Confirm new password"
                wrapperClassName="relative"
                onChange={handleChange}
                value={values.confirmNewPassword}
                warningMessage={errors.confirmNewPassword}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="block text-sm px-2 py-1 rounded text-white bg-blue-600 [&:not(:disabled)]:hover:bg-blue-500"
                type="button"
                onClick={submitForm}
                disabled={
                  !dirty ||
                  !!Object.keys<keyof typeof errors>(errors).find((fieldName) =>
                    Object.prototype.hasOwnProperty.call(errors, fieldName),
                  )
                }
              >
                {isSubmitting ? <Spinner size={1} sizeUnit="em" /> : 'Update'}
              </button>

              <button
                className="block text-sm px-2 py-1 rounded text-white bg-gray-600 hover:bg-gray-500"
                type="button"
                onClick={() => resetForm()}
              >
                Cancel
              </button>
            </div>
          </Fragment>
        ) : (
          <div className="flex flex-col gap-4 lg:max-w-fit">
            <button
              className="block text-sm px-2 py-1 rounded text-white bg-blue-600 hover:bg-blue-500"
              type="button"
              onClick={() => setInEditMode(true)}
            >
              Change current password
            </button>
          </div>
        ))}

      {!isSubmitting && submitCount > 0 && !isPasswordResetOk && (
        <span className="inline-flex gap-2 text-sm text-red-600 items-center">
          <span>
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>
            Failed to change password. Provided password is not valid.
          </span>
        </span>
      )}

      {!isEditing && isPasswordResetOk && (
        <span className="inline-flex gap-2 text-sm text-green-600 items-center">
          <span>
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>Password successfully changed</span>
        </span>
      )}
    </div>
  )
}

export default ChangePassword
