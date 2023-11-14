'use client'

import '@/styles/components/profile.sass'

import Spinner from '@/components/misc/spinner'
import { IconType, type TUserProfile } from '@/schemas/user'
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon'
import capitalize from '@stdlib/string/capitalize'
import classNames from 'classnames'
import { useFormik } from 'formik'
import isEqual from 'lodash.isequal'
import dynamic from 'next/dynamic'
import { Fragment, useEffect, useMemo, useState } from 'react'
import * as Yup from 'yup'

const FloatingLabel = dynamic(() => import('@/components/misc/floating-label'))

const FloatingLabelSelect = dynamic(
  () => import('@/components/misc/floating-label-select'),
)

const ProfileIconColorPicker = dynamic(
  () => import('@/components/settings/profile/icon-color-picker'),
)

const ProfileImageUploader = dynamic(
  () => import('@/components/settings/profile/image-uploader'),
)

const ImageRemovalModal = dynamic(
  () => import('@/components/settings/profile/image-removal-modal'),
)

type SubmissionResult = 'error' | 'success'

type ProfileFormProps = {
  profile: Extend<
    PossiblyDefined<TUserProfile>,
    {
      email: string
    }
  >
  onUpdateSuccess?: () => void
}

const ProfileForm = ({
  profile: fetchedProfile,
  onUpdateSuccess,
}: ProfileFormProps) => {
  const { email, ...profilePreset } = useMemo(
    () => fetchedProfile,
    [fetchedProfile],
  )

  const initialValues = useMemo(
    () => ({
      firstName: profilePreset.firstName ?? '',
      lastName: profilePreset.lastName ?? '',
      alias: profilePreset.alias ?? '',
      icon: {
        prefer: profilePreset.icon?.prefer ?? IconType.None,
        color: profilePreset.icon?.color,
        url: profilePreset.icon?.url ?? '',
      },
    }),
    [profilePreset],
  )

  const [isRemovingImage, removeImage] = useState(false)

  const [submission, setSubmitState] = useState<{
    result: SubmissionResult
    message?: string
  }>()

  const { handleChange, handleSubmit, isSubmitting, setValues, values } =
    useFormik<TUserProfile>({
      initialValues,
      validationSchema: Yup.object().shape({
        firstName: Yup.string().required(),
        lastName: Yup.string().required(),
        alias: Yup.string().optional(),
        icon: Yup.object().shape({
          prefer: Yup.mixed().oneOf(Object.values(IconType)),
          url: Yup.string(),
          color: Yup.string(),
        }),
      }),
      onSubmit: async (profileSettings) => {
        try {
          const updateResponse = await fetch('/api/session/user/profile', {
            method: 'PATCH',
            body: JSON.stringify(profileSettings),
            cache: 'no-cache',
          })

          const result: Assume<
            TUserProfile,
            PossiblyDefined<TUserProfile>
          > = await updateResponse.json()

          if (result) {
            setSubmitState({
              result: 'success',
              message:
                'Profile data submitted, this change will be reflected soon',
            })

            onUpdateSuccess?.()
          }
        } catch (error) {
          setSubmitState({
            result: 'error',
            message:
              error instanceof Error ? error.message : JSON.stringify(error),
          })
        }
      },
    })

  useEffect(() => {
    if (!values.icon?.url) removeImage(false)
  }, [values.icon?.url])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-8">
      {submission && (
        <div
          className={classNames(
            'rounded-b px-4 py-3 border-t-4 shadow-md',
            submission.result === 'success'
              ? 'bg-teal-100 border-teal-500 text-teal-900'
              : 'bg-red-100 border-red-500 text-red-900',
          )}
          role="alert"
        >
          <div className="flex">
            <div className="w-full">
              <p className="font-bold">
                {submission.result === 'error'
                  ? 'Unexpected error'
                  : 'Profile updated'}
              </p>

              {submission.message && (
                <p className="text-sm">{submission.message}</p>
              )}
            </div>

            <button
              className="inline-flex"
              type="button"
              onClick={() => setSubmitState(undefined)}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:max-w-md">
        <FloatingLabel
          className="col-span-2 lg:col-span-1"
          id="firstName"
          name="firstName"
          label="First name"
          value={values.firstName}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <FloatingLabel
          className="col-span-2 lg:col-span-1"
          id="lastName"
          name="lastName"
          label="Last name"
          value={values.lastName}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <FloatingLabel
          className="col-span-2"
          id="email"
          name="email"
          label="Email address"
          type="email"
          defaultValue={email}
          disabled
          readOnly
        />

        <FloatingLabel
          className="col-span-2"
          id="alias"
          name="alias"
          label="Alias (optional)"
          value={values.alias}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-4 gap-x-10 gap-y-8">
        <div className="col-span-full lg:col-span-2">
          <FloatingLabelSelect
            className="bg-white"
            label="User icon (optional)"
            options={Object.entries(IconType).map(
              ([iconTypeKey, iconTypeValue]) => ({
                label: capitalize(iconTypeKey),
                value: iconTypeValue,
              }),
            )}
            value={values?.icon?.prefer ?? IconType.None}
            onChange={(event) => {
              setValues(($values) => {
                $values.icon!.prefer = event.target.value as IconType
                return $values
              })
            }}
            disabled={isSubmitting}
          />

          {values?.icon?.prefer === IconType.Image && (
            <Fragment>
              <span className="flex justify-center lg:justify-start text-xs text-gray-400 mt-2">
                {values.icon?.url
                  ? 'Click the circle image to change the image.'
                  : 'Click the circle to upload a new image'}
              </span>

              {values?.icon?.url && (
                <span className="flex justify-center lg:justify-start">
                  <button
                    className={classNames(
                      'inline-block px-2 py-1 rounded text-xs mt-4',
                      'bg-red-400 text-gray-50 hover:bg-red-500 transition ease-in-out duration-200',
                    )}
                    type="button"
                    rel="button"
                    onClick={() => removeImage(true)}
                    disabled={isSubmitting}
                  >
                    Remove image
                  </button>
                </span>
              )}
            </Fragment>
          )}
        </div>

        {values?.icon?.prefer && values?.icon?.prefer !== IconType.None && (
          <span
            className={classNames(
              'inline-flex col-span-full lg:col-span-2 justify-center',
              values?.icon?.prefer === IconType.Color && 'lg:justify-start',
            )}
          >
            {values.icon.prefer === IconType.Image && (
              <ProfileImageUploader
                imageURI={values.icon?.url}
                onImageUpload={(fileURI) =>
                  setValues(($values) => {
                    $values.icon!.url = fileURI
                    return $values
                  })
                }
              />
            )}

            {values.icon.prefer === IconType.Color && (
              <ProfileIconColorPicker
                value={values.icon?.color}
                onChange={(newColor) => {
                  setValues(($values) => {
                    $values.icon!.color = newColor.toUpperCase()
                    return $values
                  })
                }}
                coloredIconCharacter={values.firstName.charAt(0)}
                submitting={isSubmitting}
              />
            )}
          </span>
        )}
      </div>

      <div className="flex gap-x-6 gap-y-8 justify-center lg:justify-start">
        {!isEqual(initialValues, values) && (
          <div className="inline-flex gap-2">
            <button
              className={classNames(
                'px-2 py-1 rounded text-gray-50 bg-blue-600',
                'hover:bg-blue-500 transition ease-in-out duration-200',
              )}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner size={1} sizeUnit="em" /> : 'Save'}
            </button>

            <button
              className={classNames(
                'px-2 py-1 rounded text-gray-900 bg-gray-300',
                'hover:bg-gray-200 transition ease-in-out duration-200',
              )}
              type="button"
              onClick={() => setValues(initialValues)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <ImageRemovalModal
        open={isRemovingImage}
        onConfirmation={(accepted) =>
          accepted
            ? setValues(($values) => {
                $values.icon!.url = ''
                return $values
              })
            : removeImage(false)
        }
      />
    </form>
  )
}

export default ProfileForm
