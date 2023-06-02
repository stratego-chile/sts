'use client'

import '@/styles/components/profile.sass'

import Spinner from '@/components/misc/spinner'
import { IconType } from '@/lib/enumerators'
import type { TUserProfile } from '@/schemas/user'
import { Listbox } from '@headlessui/react'
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import capitalize from '@stdlib/string/capitalize'
import chroma from 'chroma-js'
import classNames from 'classnames'
import { useFormik } from 'formik'
import isEqual from 'lodash.isequal'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import * as Yup from 'yup'

const HexColorPicker = dynamic(() =>
  import('react-colorful').then((mod) => mod.HexColorPicker)
)

const ColoredUserIcon = dynamic(() => import('@/components/user/colored-icon'))

const ProfileImageUploader = dynamic(
  () => import('@/components/settings/image-uploader')
)

const ImageRemovalModal = dynamic(
  () => import('@/components/settings/image-removal-modal')
)

type SubmissionResult = 'error' | 'success'

type ProfileFormProps = {
  profile: Extend<
    Unset<TUserProfile>,
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
    [fetchedProfile]
  )

  const initialValues = useMemo(
    () => ({
      firstName: profilePreset.firstName ?? '',
      lastName: profilePreset.lastName ?? '',
      alias: profilePreset.alias ?? '',
      icon: {
        prefer: profilePreset.icon?.prefer ?? IconType.None,
        color: profilePreset.icon?.color ?? chroma.random().hex(),
        url: profilePreset.icon?.url ?? '',
      },
    }),
    [profilePreset]
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
            Unset<TUserProfile>
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
    <form onSubmit={handleSubmit}>
      {submission && (
        <div
          className={classNames(
            'rounded-b px-4 py-3 border-t-4 shadow-md',
            submission.result === 'success'
              ? 'bg-teal-100 border-teal-500 text-teal-900'
              : 'bg-red-100 border-red-500 text-red-900'
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
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            First name
          </label>

          <div className="mt-2">
            <input
              type="text"
              name="firstName"
              id="firstName"
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 shadow-sm sm:text-sm sm:leading-6',
                'text-gray-900 placeholder:text-gray-400 ring-1 ring-inset ring-gray-300',
                'focus:ring-2 focus:ring-inset focus:ring-blue-600'
              )}
              value={values.firstName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Last name
          </label>

          <div className="mt-2">
            <input
              type="text"
              name="lastName"
              id="lastName"
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 shadow-sm sm:text-sm sm:leading-6',
                'text-gray-900 placeholder:text-gray-400 ring-1 ring-inset ring-gray-300',
                'focus:ring-2 focus:ring-inset focus:ring-blue-600'
              )}
              value={values.lastName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Email address
          </label>

          <div className="mt-2">
            <input
              name="email"
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 px-3 sm:text-sm sm:leading-6 shadow-sm',
                'text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 bg-gray-100'
              )}
              defaultValue={email}
              disabled
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label
            htmlFor="alias"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Alias (optional)
          </label>

          <div className="mt-2">
            <input
              type="text"
              name="alias"
              id="alias"
              autoComplete="family-name"
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 shadow-sm sm:text-sm sm:leading-6',
                'text-gray-900 placeholder:text-gray-400 ring-1 ring-inset ring-gray-300',
                'focus:ring-2 focus:ring-inset focus:ring-blue-600'
              )}
              value={values.alias}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-3">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            User icon (optional)
          </label>

          <Listbox
            value={values.icon?.prefer ?? IconType.None}
            onChange={(iconPreference) => {
              setValues(($values) => {
                $values.icon!.prefer = iconPreference
                return $values
              })
            }}
            disabled={isSubmitting}
          >
            <div className="relative mt-1 z-10">
              <Listbox.Button
                className={classNames(
                  'relative w-full cursor-default rounded py-2 pl-3 pr-10 text-left shadow-sm sm:text-sm',
                  'bg-white ring-1 ring-inset ring-gray-300',
                  'focus-visible:border-blue-600 focus-visible:ring-white focus-visible:ring-offset-blue-300',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-offset-2'
                )}
              >
                <span className="block truncate">
                  {capitalize(
                    Object.entries(IconType).find(
                      ([, iconTypeValue]) =>
                        iconTypeValue === (values.icon?.prefer ?? IconType.None)
                    )![0]
                  )}
                </span>

                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Listbox.Options
                className={classNames(
                  'absolute mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base sm:text-sm',
                  'shadow-sm bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'
                )}
              >
                {Object.entries(IconType).map(
                  ([iconTypeKey, iconTypeValue], key) => (
                    <Listbox.Option
                      key={key}
                      className={({ active }) =>
                        classNames(
                          'relative cursor-default select-none py-2 pl-10 pr-4',
                          active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                        )
                      }
                      value={iconTypeValue}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {capitalize(iconTypeKey)}
                          </span>

                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  )
                )}
              </Listbox.Options>
            </div>
          </Listbox>

          {values.icon?.prefer === IconType.Image && (
            <span className="flex justify-center lg:justify-start text-xs text-gray-400 mt-2">
              {values.icon?.url
                ? 'Click the circle image to change the image.'
                : 'Click the circle to upload a new image'}
            </span>
          )}

          {values.icon?.prefer === IconType.Image && values.icon?.url && (
            <span className="flex justify-center lg:justify-start">
              <button
                className={classNames(
                  'inline-block px-2 py-1 rounded text-xs mt-4',
                  'bg-red-400 text-gray-50 hover:bg-red-500 transition ease-in-out duration-200'
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
        </div>

        <div className="col-span-full lg:col-span-4">
          <div className="flex flex-col gap-4 mt-6 lg:mt-0">
            {values.icon?.prefer === IconType.Image && (
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

            {values.icon?.prefer === IconType.Color && (
              <div className="flex flex-col lg:flex-row gap-16">
                <div className="flex flex-col items-center gap-4">
                  <HexColorPicker
                    color={values.icon?.color}
                    onChange={(newColor) =>
                      setValues(($values) => {
                        $values.icon!.color = newColor.toUpperCase()
                        return $values
                      })
                    }
                    aria-disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    className={classNames(
                      'text-sm px-2 py-1 rounded text-gray-50 bg-gray-900',
                      'hover:bg-gray-700 transition ease-in-out duration-200'
                    )}
                    onClick={() =>
                      setValues(($values) => {
                        $values.icon!.color = chroma
                          .random()
                          .hex()
                          .toUpperCase()
                        return $values
                      })
                    }
                    disabled={isSubmitting}
                  >
                    Random color
                  </button>
                </div>

                <div className="flex flex-col gap-4 items-center justify-center">
                  <ColoredUserIcon
                    color={values.icon?.color}
                    content={values.firstName}
                    size={8}
                    sizeUnit="em"
                  />

                  {values?.icon?.color && (
                    <span className="inline-flex justify-between items-center p-1 bg-gray-200 text-gray-500 rounded">
                      <span className="px-2 select-all text-xs">
                        {values.icon.color.toUpperCase()}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        {!isEqual(initialValues, values) && (
          <div className="inline-flex col-span-full lg:col-span-5 gap-2 justify-center lg:justify-start">
            <button
              className={classNames(
                'px-2 py-1 rounded text-gray-50 bg-blue-600',
                'hover:bg-blue-500 transition ease-in-out duration-200'
              )}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner size={1} sizeUnit="em" /> : 'Save'}
            </button>

            <button
              className={classNames(
                'px-2 py-1 rounded text-gray-900 bg-gray-300',
                'hover:bg-gray-200 transition ease-in-out duration-200'
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
