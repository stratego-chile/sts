'use client'

import IdSelector from '@/components/misc/id-selector'
import Spinner from '@/components/misc/spinner'
import { fetcher } from '@/lib/fetcher'
import { Dialog, Tab, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import OTPInput from 'react-otp-input'
import QRCode from 'react-qr-code'
import useAsyncFn from 'react-use/lib/useAsyncFn'
import useSWR from 'swr'

type TOTPSetupModalProps = {
  open?: boolean
  onSuccessful?: () => void
  onCancel?: () => void
}

type OTPSetupRequestResult = {
  url: string
  key: string
}

type OTPSetupResultType = {
  success: boolean
  recoveryCodes?: Array<string>
}

enum SetupSteps {
  Register = 0,
  Confirm = 1,
  Finish = 2,
}

const steps = Object.values(SetupSteps) as Array<SetupSteps>

const TOTPSetupModal = ({
  open,
  onSuccessful,
  onCancel,
}: TOTPSetupModalProps) => {
  const [setupStep, setSetupStep] = useState(
    steps.find((step) => step === SetupSteps.Register)!,
  )

  const recoveryCodesTableRef = useRef<HTMLDivElement>(null)

  const [token, setToken] = useState<string>()

  const {
    data: OTPAuthSetupRequest,
    mutate: requestOTPAuthSetup,
    isLoading: isRequestingOTPAuthSetup,
  } = useSWR<OTPSetupRequestResult>(
    '/api/session/user/mfa/totp/setup',
    fetcher,
    {
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      refreshInterval: 0,
    },
  )

  const [tokenValidationResult, validateToken] = useAsyncFn(async () => {
    const result = await fetcher<OTPSetupResultType>(
      '/api/session/user/mfa/totp/setup',
      {
        method: 'POST',
        body: JSON.stringify({
          token: token,
        }),
      },
    )
    return result
  }, [token])

  const { value: OTPSetupResult, loading: isValidatingOTPToken } = useMemo(
    () => tokenValidationResult,
    [tokenValidationResult],
  )

  const handleTOTPActivation = async () => {
    const result = await fetcher('/api/session/user/mfa/totp/setup', {
      method: 'PATCH',
    })

    if (result.success) onSuccessful?.()
  }

  useEffect(() => {
    if (open) requestOTPAuthSetup()

    return () => {
      requestOTPAuthSetup(undefined, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (token && token.length === 6 && !OTPSetupResult?.success) validateToken()
  }, [OTPSetupResult?.success, token, validateToken])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => void 0}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={classNames(
                  'relative transform overflow-hidden transition-all sm:my-8 sm:w-full max-w-lg lg:max-w-prose',
                  'space-y-6 px-6 text-left rounded-lg bg-white shadow-xl',
                )}
              >
                <Tab.Group
                  selectedIndex={setupStep}
                  onChange={setSetupStep}
                  manual
                >
                  <Tab.List className="hidden">
                    {steps.map((step, key) => (
                      <Tab key={key}>{step}</Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels>
                    <Tab.Panel>
                      {OTPAuthSetupRequest?.url && (
                        <div className="flex flex-col items-center gap-6">
                          {(!(OTPSetupResult?.recoveryCodes instanceof Array) ||
                            (OTPSetupResult?.recoveryCodes ?? []).length ===
                              0) && (
                            <Fragment>
                              <Dialog.Title
                                as="h3"
                                className="inline-flex text-base text-center font-semibold leading-6 text-gray-900"
                              >
                                Scan the QR code below with your authenticator
                                app
                              </Dialog.Title>

                              <Dialog.Description className="text-gray-400 text-sm text-center">
                                You can use{' '}
                                <a
                                  href="https://authy.com/"
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  Authy
                                </a>
                                ,{' '}
                                <a
                                  href="https://support.google.com/accounts/answer/1066447?hl=en&co=GENIE.Platform"
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  Google Authenticator
                                </a>{' '}
                                or any other TOTP-compatible app.
                              </Dialog.Description>

                              <QRCode
                                className="p-4"
                                bgColor="white"
                                value={OTPAuthSetupRequest.url}
                              />

                              <span className="flex gap-4 w-full justify-center text-sm text-gray-400">
                                Or use the code bellow into your authenticator
                                app
                              </span>

                              <span>
                                <IdSelector
                                  id={OTPAuthSetupRequest.key}
                                  className="break-all text-xs"
                                />
                              </span>
                            </Fragment>
                          )}
                        </div>
                      )}

                      {open && isRequestingOTPAuthSetup && (
                        <span className="flex justify-center">
                          <Spinner size={3} sizeUnit="em" />
                        </span>
                      )}

                      <div className="flex flex-row-reverse lg:flex-row lg:justify-end gap-2 lg:gap-0 py-6">
                        <button
                          type="button"
                          role="button"
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                          onClick={() => setSetupStep(SetupSteps.Confirm)}
                        >
                          Continue
                        </button>

                        <button
                          type="button"
                          role="button"
                          className="inline-flex w-full justify-center rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 sm:ml-3 sm:w-auto"
                          onClick={() => onCancel?.()}
                        >
                          Cancel
                        </button>
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <Dialog.Title
                        as="h3"
                        className="inline-flex text-base text-center font-semibold leading-6 text-gray-900"
                      >
                        Enter the 6-digit generated token shown in your app
                      </Dialog.Title>

                      <div className="inline-flex flex-col max-w-full mt-6 gap-y-2">
                        <OTPInput
                          containerStyle="flex gap-3 lg:gap-6"
                          inputStyle={classNames(
                            'block w-full rounded border-0 ring-1 py-1 lg:py-3 ring-inset ring-gray-300 !w-full',
                            'text-gray-900 lg:text-4xl sm:leading-6 placeholder:text-gray-400 arrows-none',
                            'focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600',
                          )}
                          inputType="number"
                          value={token}
                          onChange={setToken}
                          numInputs={6}
                          renderInput={(props) => <input {...props} />}
                        />

                        {token?.length === 6 &&
                          !OTPSetupResult?.success &&
                          !isValidatingOTPToken && (
                            <span className="text-red-400">
                              Wrong token, please go back an try again
                            </span>
                          )}
                      </div>

                      {OTPSetupResult?.recoveryCodes instanceof Array && (
                        <Fragment>
                          <div className="flex flex-col lg:flex-row gap-4 py-6">
                            <div
                              ref={recoveryCodesTableRef}
                              className="table table-auto"
                            >
                              <div className="table-row-group">
                                {(OTPSetupResult?.recoveryCodes ?? [])
                                  .reduce(
                                    (accumulator, current, currentIndex) => {
                                      if (
                                        !currentIndex ||
                                        currentIndex % 2 === 0
                                      )
                                        accumulator.push([current])
                                      else
                                        accumulator[
                                          accumulator.length - 1
                                        ].push(current)

                                      return accumulator
                                    },
                                    [] as Array<[string, string?]>,
                                  )
                                  .map((group, key) => (
                                    <div key={key} className="table-row">
                                      {group.map((code, groupKey) => (
                                        <div
                                          key={groupKey}
                                          className={classNames(
                                            'lg:table-cell whitespace-nowrap w-full text-center py-2 lg:p-2',
                                            'text-xs lg:text-sm font-medium font-mono text-gray-700',
                                          )}
                                        >
                                          {code}
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 place-content-center flex-grow">
                              <button
                                type="button"
                                role="button"
                                className="inline-flex w-full justify-center rounded-md bg-gray-900 py-1.5 text-sm font-semibold text-white hover:bg-gray-800"
                                onClick={() => {
                                  if (OTPSetupResult?.recoveryCodes) {
                                    const element = document.createElement('a')
                                    element.setAttribute(
                                      'href',
                                      `data:plain/text;charset=utf-8,${encodeURIComponent(
                                        OTPSetupResult?.recoveryCodes!.join(
                                          '\n',
                                        ),
                                      )}`,
                                    )
                                    element.setAttribute(
                                      'download',
                                      'sts-recovery-codes.txt',
                                    )
                                    element.style.display = 'none'
                                    document.body.appendChild(element)
                                    element.click()
                                    document.body.removeChild(element)
                                  }
                                }}
                              >
                                Download
                              </button>

                              <button
                                type="button"
                                role="button"
                                className="inline-flex w-full justify-center rounded-md bg-gray-900 py-1.5 text-sm font-semibold text-white hover:bg-gray-800"
                                onClick={() => {
                                  if (
                                    recoveryCodesTableRef.current &&
                                    OTPSetupResult?.recoveryCodes
                                  ) {
                                    const range = document.createRange()
                                    range.selectNodeContents(
                                      recoveryCodesTableRef.current,
                                    )
                                    const selection = window.getSelection()
                                    selection?.removeAllRanges()
                                    selection?.addRange(range)
                                    navigator?.clipboard?.writeText?.(
                                      OTPSetupResult?.recoveryCodes!.join('\n'),
                                    )
                                  }
                                }}
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-400 text-center text-sm">
                            Save these codes in a safe place. These will no
                            longer be visible in the application.
                          </p>
                        </Fragment>
                      )}

                      <div className="flex flex-row-reverse lg:flex-row lg:justify-end gap-2 lg:gap-0 py-6">
                        <button
                          type="button"
                          role="button"
                          className="inline-flex w-full justify-center rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 sm:ml-3 sm:w-auto"
                          onClick={() => setSetupStep(SetupSteps.Register)}
                        >
                          Back
                        </button>

                        {OTPSetupResult?.recoveryCodes instanceof Array && (
                          <button
                            type="button"
                            role="button"
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                            onClick={() => setSetupStep(SetupSteps.Finish)}
                          >
                            Continue
                          </button>
                        )}

                        <button
                          type="button"
                          role="button"
                          className="inline-flex w-full justify-center rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 sm:ml-3 sm:w-auto"
                          onClick={() => onCancel?.()}
                        >
                          Cancel
                        </button>
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <Dialog.Title>Successful setup</Dialog.Title>

                      <div className="flex flex-row-reverse lg:flex-row lg:justify-end gap-2 lg:gap-0 py-6">
                        <button
                          type="button"
                          role="button"
                          className="inline-flex w-full justify-center rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 sm:ml-3 sm:w-auto"
                          onClick={() => setSetupStep(SetupSteps.Confirm)}
                        >
                          Back
                        </button>

                        <button
                          type="button"
                          role="button"
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                          onClick={handleTOTPActivation}
                        >
                          Got it
                        </button>

                        <button
                          type="button"
                          role="button"
                          className="inline-flex w-full justify-center rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 sm:ml-3 sm:w-auto"
                          onClick={() => onCancel?.()}
                        >
                          Cancel
                        </button>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

TOTPSetupModal.displayName = 'TOTPSetupModal'

export default TOTPSetupModal
