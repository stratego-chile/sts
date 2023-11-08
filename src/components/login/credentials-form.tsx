'use client'

import Spinner from '@/components/misc/spinner'
import { MFAMode } from '@/lib/enumerators'
import Fingerprint from '@fingerprintjs/fingerprintjs'
import LockClosedIcon from '@heroicons/react/20/solid/LockClosedIcon'
import capitalize from '@stdlib/string/capitalize'
import classNames from 'classnames'
import { useFormik } from 'formik'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import useAsyncFn from 'react-use/lib/useAsyncFn'
import createSaltedSHA512 from 'salted-sha512'
import * as Yup from 'yup'

const WrongCredentialsModal = dynamic(
  () => import('@/components/login/wrong-credentials-modal'),
  { ssr: false },
)

const ForgotPasswordModal = dynamic(
  () => import('@/components/login/forgot-password-modal'),
  { ssr: false },
)

const PasswordInput = dynamic(() => import('@/components/misc/password-input'))

const OTPInput = dynamic(() => import('react-otp-input'))

type CredentialsFormProps = {
  returnUrl?: string
}

const CredentialsForm = ({ returnUrl }: CredentialsFormProps) => {
  const router = useRouter()

  const { executeRecaptcha } = useGoogleReCaptcha()

  const [formattedCredentials, setFormattedCredentials] =
    useState<Stratego.STS.Auth.Login>()

  const [MFAToken, setMFAToken] = useState('')

  const [authorizedMFA, setMFAAuthorization] = useState<boolean>()

  const [MFA, setMFA] = useState<{
    required: boolean
    type: MFAMode
  }>()

  const [isForgotPasswordModalOpen, setForgotPasswordVisibility] =
    useState(false)

  const [wrongCredentials, setWrongCredentials] = useState(false)

  const [isWrongCredentialsModalOpen, setWrongCredentialsVisibility] =
    useState(false)

  const [{ loading: submittingCredentials }, submitCredentials] =
    useAsyncFn(async () => {
      if (!formattedCredentials) return void 0

      if (MFA?.required && MFAToken.length === 6) {
        const reCaptchaMFAValidationToken =
          await executeRecaptcha?.('mfa_validation')

        if (reCaptchaMFAValidationToken) {
          const OTPValidationResponse = await fetch('/api/user/auth/mfa', {
            method: 'POST',
            headers: {
              authorization: reCaptchaMFAValidationToken,
            },
            body: JSON.stringify({
              ref: Buffer.from(formattedCredentials.email as string).toString(
                'base64',
              ),
              token: MFAToken,
              mode: MFA.type,
            }),
          })

          const OTPValidationAttempt: { authorized: boolean } =
            await OTPValidationResponse.json()

          setMFAAuthorization(!!OTPValidationAttempt?.authorized)

          if (!OTPValidationAttempt?.authorized) return void 0
        }
      }

      const reCaptchaLoginToken = await executeRecaptcha?.('login')

      if (reCaptchaLoginToken) {
        const fingerprintAgent = await Fingerprint.load()

        const browserFingerprint = await fingerprintAgent.get()

        const { visitorId, version, confidence } = browserFingerprint

        const geolocation = await (async () =>
          new Promise<PossiblyDefined<GeolocationPosition>>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (coordinates) => resolve(coordinates),
              () => resolve(undefined),
            )
          }))()

        const authResponse = await fetch('/api/user/auth', {
          method: 'POST',
          headers: {
            authorization: reCaptchaLoginToken,
            geolocation: geolocation
              ? [
                  geolocation.coords.longitude,
                  geolocation.coords.latitude,
                ].join(',')
              : '',
            fingerprint: visitorId,
          },
          body: JSON.stringify({ ...formattedCredentials }),
          cache: 'no-cache',
        })

        const authAttempt: Stratego.STS.Auth.Response<boolean> =
          await authResponse.json()

        if (authAttempt.authorized && authAttempt.storeData) {
          if (process.env.SESSION_FINGERPRINT_KEY)
            localStorage.setItem(
              process.env.SESSION_FINGERPRINT_KEY,
              JSON.stringify({ visitorId, version, confidence }),
            )

          localStorage.setItem(
            process.env.SESSION_STORE_KEY,
            JSON.stringify(authAttempt.storeData),
          )

          if (returnUrl) {
            const decodedReturnUrl = Buffer.from(returnUrl, 'base64').toString(
              'utf-8',
            )

            router.replace(decodedReturnUrl)
          } else window.location.reload()
        } else setWrongCredentials(true)
      }
    }, [
      MFA,
      MFAToken,
      executeRecaptcha,
      formattedCredentials,
      returnUrl,
      router,
    ])

  const requestLogin = useCallback(async () => {
    const reCaptchaCredentialsCheckToken =
      await executeRecaptcha?.('credentials_check')

    if (reCaptchaCredentialsCheckToken && formattedCredentials?.email) {
      const credentialsCheckResponse = await fetch('/api/user/auth', {
        method: 'HEAD',
        headers: {
          authorization: reCaptchaCredentialsCheckToken,
          credentials: JSON.stringify(formattedCredentials),
        },
      })

      if (credentialsCheckResponse.headers.get('valid') !== 'true')
        return setWrongCredentials(true)
    } else return

    const reCaptchaMFAToken = await executeRecaptcha?.('mfa_check')

    if (reCaptchaMFAToken && formattedCredentials?.email) {
      const MFAConfigResponse = await fetch('/api/user/auth', {
        method: 'GET',
        headers: {
          authorization: reCaptchaMFAToken,
          'user-ref': formattedCredentials.email as string,
        },
      })

      const MFAConfig: {
        mfa: boolean
        alternatives: Array<MFAMode>
      } = await MFAConfigResponse.json()

      if (MFAConfig.mfa) {
        setMFA({
          required: true,
          type: MFAMode.TOTP,
        })
      } else await submitCredentials()
    } else return
  }, [executeRecaptcha, formattedCredentials, submitCredentials])

  const {
    errors,
    handleChange,
    isSubmitting: isSubmittingForm,
    handleSubmit,
    values,
  } = useFormik<Stratego.STS.Auth.Login>({
    initialValues: {
      email: '',
      password: '',
      remember: true,
    },
    onSubmit: () => requestLogin(),
    validationSchema: Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
      remember: Yup.boolean(),
    }),
  })

  const submitting = useMemo(
    () => submittingCredentials || isSubmittingForm,
    [isSubmittingForm, submittingCredentials],
  )

  useEffect(() => {
    const credentials = { ...values }

    credentials.password = createSaltedSHA512(
      credentials.password as string,
      process.env.PASSWORD_SECURITY_CLIENT_SALT,
    )

    setFormattedCredentials(credentials)
  }, [values])

  useEffect(
    () => (wrongCredentials ? setWrongCredentialsVisibility(true) : void 0),
    [wrongCredentials],
  )

  useEffect(
    () => (!isWrongCredentialsModalOpen ? setWrongCredentials(false) : void 0),
    [isWrongCredentialsModalOpen],
  )

  useEffect(() => {
    if (MFA?.type === MFAMode.TOTP && MFAToken.length === 6) submitCredentials()
  }, [MFA, MFAToken, submitCredentials, values])

  useEffect(() => {
    setMFAToken('')
  }, [MFA])

  return MFA?.required ? (
    <div className="flex flex-col gap-4">
      {MFA.type === MFAMode.TOTP && (
        <Fragment>
          {!authorizedMFA && (
            <h3 className="inline-flex text-center font-semibold leading-6 text-gray-900">
              Enter the 6-digit generated token shown in your authentication app
            </h3>
          )}

          {!authorizedMFA && (
            <div className="inline-flex flex-col max-w-full mt-6 gap-y-2">
              <OTPInput
                containerStyle="flex gap-3 lg:gap-6"
                inputStyle={classNames(
                  'block w-full rounded border-0 ring-1 py-1 lg:py-3 ring-inset ring-gray-300 !w-full',
                  'text-gray-900 lg:text-4xl sm:leading-6 placeholder:text-gray-400 arrows-none',
                  'focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600',
                )}
                inputType="number"
                value={MFAToken}
                onChange={setMFAToken}
                numInputs={6}
                renderInput={(props) => (
                  <input {...props} disabled={submitting} />
                )}
                shouldAutoFocus
              />
            </div>
          )}

          {MFAToken.length === 6 && authorizedMFA === false && !submitting && (
            <span className="inline text-red-600 text-sm text-center">
              The provided token is not valid, please try again.
            </span>
          )}

          {!authorizedMFA && (
            <span className="inline text-gray-600 text-sm text-center">
              If you cannot access to your authenticator app, you can use{''}
              <button
                type="button"
                role="button"
                onClick={() => {
                  setMFA({
                    required: true,
                    type: MFAMode.Recovery,
                  })
                }}
                className="text-blue-400 hover:text-blue-600 background-transparent font-bold outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              >
                one of your recovery keys
              </button>
            </span>
          )}

          {submitting && (
            <span className="text-center justify-center">
              <Spinner size={1.5} sizeUnit="em" />
            </span>
          )}
        </Fragment>
      )}
      {MFA.type === MFAMode.Recovery && (
        <Fragment>
          <h3 className="inline-flex justify-center font-semibold leading-6 text-gray-900">
            Enter one of your unused recovery keys
          </h3>

          <div className="inline-flex flex-col max-w-full mt-6 gap-y-2">
            <PasswordInput
              id="recoveryKey"
              name="recoveryKey"
              required
              autoComplete="off"
              autoFocus={false}
              value={MFAToken}
              onChange={(event) => {
                setMFAToken(event.target.value)
              }}
              className="block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Recovery key"
              disabled={submitting}
              wrapperClassName="relative shadow-sm"
            />
          </div>

          {authorizedMFA === false && !submitting && (
            <span className="inline text-red-600 text-sm text-center">
              The provided recovery key is not valid, please try again with
              another one.
            </span>
          )}

          <span className="inline text-gray-600 text-sm text-center">
            Your recovery keys were provided in your MFA configuration setup,
            these are one-time use keys. If you can&apos;t find them, you will
            not be able to access to your account. Please contact with your
            administrator for further assistance.
          </span>

          {MFAToken.length > 0 && (
            <div>
              <button
                type="button"
                role="button"
                onClick={submitCredentials}
                className={classNames(
                  'group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold',
                  'bg-blue-600 text-white',
                  'hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  'focus-visible:outline-blue-600 transition ease-in-out duration-200',
                )}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon
                    className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition ease-in-out duration-200"
                    aria-hidden="true"
                  />
                </span>

                {submitting ? (
                  <Spinner size={1.5} sizeUnit="em" />
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </div>
          )}
        </Fragment>
      )}
    </div>
  ) : (
    <form className="flex flex-col gap-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm">
        <section>
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
            value={values.email as string}
            required
            className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 !z-0 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Email address"
            disabled={submitting}
          />
        </section>

        <section>
          <label htmlFor="password" className="sr-only">
            Password
          </label>

          <PasswordInput
            id="password"
            name="password"
            autoComplete="off"
            autoFocus={false}
            onChange={handleChange}
            value={values.password as string}
            required
            className="block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Password"
            disabled={submitting}
            wrapperClassName="relative shadow-sm"
          />
        </section>
      </div>

      {Object.values(errors).length > 0 && (
        <div className="rounded bg-red-100 ring-1 ring-red-600 p-2">
          {Object.values(errors).map((error, key) => (
            <section key={key} className="py-1 text-red-500 text-sm">
              {capitalize(error as string)}
            </section>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <section className="flex items-center">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            onChange={handleChange}
            value={String(values.remember ?? 'false')}
            checked={!!values.remember}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-800"
            disabled={submitting}
          />

          <label
            htmlFor="remember"
            className="ml-2 block text-sm text-gray-900"
          >
            Remember me
          </label>
        </section>

        <section className="text-sm">
          <button
            type="button"
            role="button"
            onClick={() => setForgotPasswordVisibility(true)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </button>
        </section>
      </div>

      <div>
        <button
          type="submit"
          className={classNames(
            'group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold',
            'bg-blue-600 text-white',
            '[&:not(:disabled)]:hover:bg-blue-500 transition ease-in-out duration-200',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
          )}
          disabled={submitting}
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <LockClosedIcon
              className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition ease-in-out duration-200"
              aria-hidden="true"
            />
          </span>

          {submitting ? (
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
