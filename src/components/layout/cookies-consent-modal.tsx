'use client'

import { CookiesConsenting } from '@/lib/enumerators'
import { fetcher } from '@/lib/fetcher'
import { Dialog, Switch, Transition } from '@headlessui/react'
import capitalize from '@stdlib/string/capitalize'
import classNames from 'classnames'
import { useFormik } from 'formik'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import useAsyncFn from 'react-use/lib/useAsyncFn'
import * as Yup from 'yup'

type CookiesConsentModalProps = {
  open?: boolean
}

const CookiesTypesDescription: Record<CookiesConsenting, string> = {
  [CookiesConsenting.Necessary]:
    'These cookies are used to store your session and preferences.',
  [CookiesConsenting.Analytics]:
    'These cookies are used to get anonymous analytics which help us to improve the application.',
}

const CookiesConsentModal = ({ open }: CookiesConsentModalProps) => {
  const router = useRouter()

  const [mustShowModal, setMustShowModal] = useState(false)

  const [cookiesConsentingSavingResult, saveCookiesConsentingConfig] =
    useAsyncFn(
      async (config: Record<CookiesConsenting, boolean>) =>
        await fetcher<{
          accepted: boolean
          expiration: number
        }>('/api/cookies/consenting', {
          method: 'POST',
          body: JSON.stringify(config),
        }),
      [],
    )

  const { values, handleSubmit, setValues, submitForm } = useFormik({
    initialValues: Object.values(CookiesConsenting).reduce(
      (options, option) => ({
        ...options,
        [option]: option === CookiesConsenting.Necessary,
      }),
      {} as Record<CookiesConsenting, boolean>,
    ),
    validationSchema: Yup.object({
      ...Object.values(CookiesConsenting).reduce(
        (options, option) => ({
          ...options,
          [option]:
            option === CookiesConsenting.Necessary
              ? Yup.boolean().required()
              : Yup.boolean(),
        }),
        {} as Record<CookiesConsenting, Yup.BooleanSchema>,
      ),
    }),
    onSubmit: async ($values) => {
      await saveCookiesConsentingConfig($values)
    },
  })

  useEffect(() => {
    if (open) setMustShowModal(true)

    return () => setMustShowModal(false)
  }, [open])

  useEffect(() => {
    if (cookiesConsentingSavingResult.value?.accepted) router.refresh()
  }, [cookiesConsentingSavingResult.value, router])

  return (
    <Transition.Root show={mustShowModal} as={Fragment}>
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

        <div className="fixed inset-x-0 bottom-0 z-10 overflow-y-auto">
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
                  'relative transform overflow-hidden transition-all sm:my-8 sm:w-full max-w-lg lg:max-w-screen-xl',
                  'space-y-6 p-4 text-left rounded-lg bg-white shadow-xl',
                )}
              >
                <form
                  className="flex flex-col lg:flex-row justify-between gap-4"
                  onSubmit={handleSubmit}
                >
                  <div className="inline-flex flex-col gap-4">
                    <Dialog.Title
                      as="h1"
                      className="inline-flex font-bold text-gray-900"
                    >
                      This application use cookies, please configure your
                      preferences to continue using the application
                    </Dialog.Title>

                    {Object.values(CookiesConsenting).map((option, key) => (
                      <Switch.Group key={key}>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="inline-flex min-w-fit">
                            <Switch
                              name={option}
                              checked={!!values[option]}
                              onChange={(checked) => {
                                setValues(($values) => {
                                  $values[option] = checked
                                  return $values
                                })
                              }}
                              className={classNames(
                                values[option] ? 'bg-blue-600' : 'bg-gray-200',
                                'relative inline-flex h-6 w-14 items-center rounded-full mix-w-max',
                              )}
                              disabled={option === CookiesConsenting.Necessary}
                            >
                              <span
                                className={classNames(
                                  values[option]
                                    ? 'translate-x-9'
                                    : 'translate-x-1',
                                  'inline-block h-4 w-4 transform rounded-full bg-white transition',
                                )}
                              />
                            </Switch>
                          </div>

                          <div className="inline-flex flex-col max-w-fit">
                            <Switch.Label>{capitalize(option)}</Switch.Label>

                            <Switch.Description className="text-xs text-gray-400">
                              {CookiesTypesDescription[option]}
                            </Switch.Description>
                          </div>
                        </div>
                      </Switch.Group>
                    ))}
                  </div>

                  <div className="inline-flex flex-col gap-2">
                    <button
                      type="submit"
                      role="button"
                      onClick={async () => {
                        await setValues(($values) => {
                          return Object.keys($values).reduce(
                            ($$values, key) => ({
                              ...$$values,
                              [key]: true,
                            }),
                            {} as Record<CookiesConsenting, boolean>,
                          )
                        })

                        await submitForm()
                      }}
                      className={classNames(
                        'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md',
                        'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                      )}
                    >
                      Accept all
                    </button>

                    <button
                      type="submit"
                      role="button"
                      className={classNames(
                        'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md',
                        'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                      )}
                    >
                      Confirm my choices
                    </button>

                    <button
                      type="button"
                      role="button"
                      onClick={() => {
                        const reload = confirm(
                          [
                            'Since you rejected the use of all cookies, you cannot use this app.',
                            'This page is not allowed to use the browser storage.',
                          ].join(' '),
                        )

                        if (reload) router.refresh()
                      }}
                      className={classNames(
                        'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md',
                        'text-gray-50 bg-gray-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                      )}
                    >
                      I reject all
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default CookiesConsentModal
