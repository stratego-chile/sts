'use client'

import '@stratego-sts/styles/profile.sass'
import 'antd/es/modal/style'
import 'antd/es/slider/style'

import { Listbox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import capitalize from '@stdlib/string/capitalize'
import { IconType } from '@stratego-sts/lib/enumerators'
import { formatFileSize } from '@stratego-sts/lib/format'
import { TUserProfile } from '@stratego-sts/schemas/user'
import chroma from 'chroma-js'
import classNames from 'classnames'
import { useFormik } from 'formik'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const HexColorPicker = dynamic(() =>
  import('react-colorful').then((mod) => mod.HexColorPicker)
)

const ColoredUserIcon = dynamic(
  () => import('@stratego-sts/components/user/colored-icon')
)

const ProfileImageUploader = dynamic(
  () => import('@stratego-sts/components/settings/image-uploader')
)

type ProfileFormProps = {
  email: Stratego.STS.Auth.Email
  profile?: TUserProfile
}

const ProfileForm = ({ email, profile }: ProfileFormProps) => {
  const [iconType, setIconType] = useState<IconType>(IconType.None)

  const [iconFile, setIconFile] = useState<{
    imageURI: string
    size: number
  }>()

  const { handleChange, handleSubmit, setValues, values } =
    useFormik<TUserProfile>({
      initialValues: profile ?? {
        alias: '',
        firstName: '',
        lastName: '',
        icon: {
          color: '',
          url: '',
        },
      },
      onSubmit: () => {},
    })

  useEffect(() => {
    if (iconType === IconType.Color) {
      setValues(($values) => ({
        ...$values,
        icon: {
          color: chroma.random().hex(),
        },
      }))
    }
  }, [iconType, setValues])

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-10 grid grid-cols-1 gap-x-6 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            User icon
          </label>

          <Listbox value={iconType} onChange={setIconType}>
            <div className="relative mt-1">
              <Listbox.Button
                className={classNames(
                  'relative w-full cursor-default rounded py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset sm:text-sm',
                  'bg-white ring-gray-300 focus-visible:border-blue-600 focus-visible:ring-white focus-visible:ring-offset-blue-300',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-offset-2'
                )}
              >
                <span className="block truncate">
                  {capitalize(
                    Object.entries(IconType).find(
                      ([, iconTypeValue]) => iconTypeValue === iconType
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

              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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

          {iconType === IconType.Image && (
            <small className="inline-flex gap-1 text-gray-500">
              <span>Maximum size: 2MB</span>
              {iconFile && (
                <>
                  <span>&middot;</span>
                  <span>
                    Current size: {formatFileSize(iconFile.size).human('si')}
                  </span>
                </>
              )}
            </small>
          )}
        </div>

        <div className="sm:col-span-3">
          <div className="flex flex-col gap-4 mt-6">
            {iconType === IconType.Color && (
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col items-center gap-4">
                  <HexColorPicker
                    className=""
                    color={values?.icon?.color}
                    onChange={(newColor) =>
                      setValues(($values) => {
                        $values!.icon!.color = newColor
                        return $values
                      })
                    }
                  />

                  <button
                    type="button"
                    className={classNames(
                      'text-sm px-2 py-1 rounded text-gray-50 bg-gray-900',
                      'hover:bg-gray-700 transition ease-in-out duration-200'
                    )}
                    onClick={() =>
                      setValues(($values) => {
                        $values!.icon!.color = chroma.random().hex()
                        return $values
                      })
                    }
                  >
                    Random color
                  </button>
                </div>

                <div className="flex items-center justify-center w-full">
                  <ColoredUserIcon
                    color={values.icon?.color}
                    content={values.firstName}
                    size={128}
                  />
                </div>
              </div>
            )}

            {iconType === IconType.Image && (
              <ProfileImageUploader
                preloadedImageURI={values.icon?.url}
                onImageUpload={(fileURI, fileSize) =>
                  setIconFile({
                    imageURI: fileURI,
                    size: fileSize,
                  })
                }
              />
            )}
          </div>
        </div>
      </div>

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
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              value={values.firstName}
              onChange={handleChange}
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
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              value={values.lastName}
              onChange={handleChange}
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
              autoComplete="email"
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 bg-gray-100"
              defaultValue={email as string}
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
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              value={values.alias}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <button
            className="px-2 py-1 rounded text-gray-50 bg-blue-600 hover:bg-blue-500 transition ease-in-out duration-200"
            type="submit"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  )
}

export default ProfileForm
