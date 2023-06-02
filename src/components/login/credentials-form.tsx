'use client'

import { LockClosedIcon } from '@heroicons/react/20/solid'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import capitalize from '@stdlib/string/capitalize'
import Spinner from '@/components/misc/spinner'
import { setStoreData } from '@/lib/session'
import classNames from 'classnames'
import { useFormik } from 'formik'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import createSaltedSHA512 from 'salted-sha512'
import * as Yup from 'yup'

const WrongCredentialsModal = dynamic(
  () => import('@/components/login/wrong-credentials-modal')
)

const ForgotPasswordModal = dynamic(
  () => import('@/components/login/forgot-password-modal')
)

type CredentialsFormProps = {
  returnUrl?: string
}

const CredentialsForm = ({ returnUrl }: CredentialsFormProps) => {
  const router = useRouter()

  const { executeRecaptcha } = useGoogleReCaptcha()

  const [isPasswordVisible, setPasswordVisibility] = useState(false)

  const [isForgotPasswordModalOpen, setForgotPasswordVisibility] =
    useState(false)

  const [wrongCredentials, setWrongCredentials] = useState(false)

  const [isWrongCredentialsModalOpen, setWrongCredentialsVisibility] =
    useState(false)

  const { errors, handleChange, isSubmitting, handleSubmit, values } =
    useFormik({
      initialValues: {
        email: '',
        password: '',
        remember: false,
      },
      onSubmit: async ({ remember, ...credentials }) => {
        credentials.password = createSaltedSHA512(
          credentials.password,
          process.env.PASSWORD_SECURITY_CLIENT_SALT
        )

        const recaptchaToken = await executeRecaptcha?.('login')

        if (recaptchaToken) {
          const response = await fetch('/api/user/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept-Language': 'en',
              authorization: recaptchaToken,
            },
            body: JSON.stringify({ ...credentials, rememberMe: remember }),
            cache: 'no-cache',
          })

          const authAttempt: Stratego.STS.Auth.Response<boolean> =
            await response.json()

          if (authAttempt.authorized && authAttempt.storeData) {
            setStoreData(authAttempt.storeData)

            if (returnUrl) {
              const decodedReturnUrl = Buffer.from(
                returnUrl,
                'base64'
              ).toString('utf-8')

              router.replace(decodedReturnUrl)
            } else router.refresh()
          } else {
            setWrongCredentials(true)
          }
        }
      },
      validationSchema: Yup.object({
        email: Yup.string().email().required(),
        password: Yup.string().required(),
        remember: Yup.boolean(),
      }),
    })

  useEffect(
    () => (wrongCredentials ? setWrongCredentialsVisibility(true) : void 0),
    [wrongCredentials]
  )

  useEffect(
    () => (!isWrongCredentialsModalOpen ? setWrongCredentials(false) : void 0),
    [isWrongCredentialsModalOpen]
  )

  return (
    <form className="flex flex-col gap-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm">
        <div>
          <label htmlFor="email-address" className="sr-only">
            Email address
          </label>

          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="off"
            autoFocus={false}
            onChange={handleChange}
            value={values.email}
            required
            className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 !z-0 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Email address"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium leading-6 text-gray-900 sr-only"
          >
            Password
          </label>

          <div className="relative shadow-sm">
            <input
              id="password"
              name="password"
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete="off"
              autoFocus={false}
              onChange={handleChange}
              value={values.password}
              required
              className="block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Password"
              disabled={isSubmitting}
            />

            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                className="h-full rounded-br-md border-0 bg-transparent py-0 px-3 text-gray-500 focus:ring-0 sm:text-sm"
                type="button"
                role="button"
                onClick={() =>
                  setPasswordVisibility((visibility) => !visibility)
                }
              >
                {((Icon) => (
                  <Icon className="text-gray-400 h-6 w-6" aria-hidden="true" />
                ))(isPasswordVisible ? EyeSlashIcon : EyeIcon)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {Object.values(errors).length > 0 && (
        <div className="rounded bg-red-100 ring-1 ring-red-600 p-2">
          {Object.values(errors).map((error, key) => (
            <div key={key} className="py-1 text-red-500 text-sm">
              {capitalize(error)}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            onChange={handleChange}
            value={String(values.remember ?? 'false')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-800"
            disabled={isSubmitting}
          />

          <label
            htmlFor="remember"
            className="ml-2 block text-sm text-gray-900"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <button
            type="button"
            role="button"
            onClick={() => setForgotPasswordVisibility(true)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className={classNames(
            'group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold',
            'bg-blue-600 text-white',
            'hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-blue-600 transition ease-in-out duration-200'
          )}
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <LockClosedIcon
              className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition ease-in-out duration-200"
              aria-hidden="true"
            />
          </span>

          {isSubmitting ? (
            <Spinner size={1.5} sizeUnit="em" />
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </div>

      <WrongCredentialsModal
        open={isWrongCredentialsModalOpen}
        onClose={() => setWrongCredentialsVisibility(false)}
      />

      <ForgotPasswordModal
        open={isForgotPasswordModalOpen}
        onClose={() => setForgotPasswordVisibility(false)}
      />
    </form>
  )
}

export default CredentialsForm
