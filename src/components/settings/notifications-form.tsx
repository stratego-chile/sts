'use client'

import Spinner from '@/components/misc/spinner'
import type { TUserNotifications } from '@/schemas/user'
import { Switch } from '@headlessui/react'
import classNames from 'classnames'
import { useFormik } from 'formik'
import { useMemo } from 'react'

type NotificationsFormProps = {
  notificationsSettings: TUserNotifications
}

const NotificationsForm = ({
  notificationsSettings: fetchedNotificationsSettings,
}: NotificationsFormProps) => {
  const notificationsSettings = useMemo(
    () => fetchedNotificationsSettings,
    [fetchedNotificationsSettings]
  )

  const { handleSubmit, isSubmitting, setValues, values } =
    useFormik<TUserNotifications>({
      initialValues: {
        email: false,
        inApp: true,
        ...notificationsSettings,
      },
      onSubmit: (result) => {
        console.log(result)
      },
    })

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Switch.Group>
        <div className="flex items-center gap-2 text-sm">
          <Switch
            name="email"
            checked={!!values.email}
            onChange={(checked) =>
              setValues(($values) => {
                $values.email = checked
                return $values
              })
            }
            className={classNames(
              values.email ? 'bg-blue-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 items-center rounded-full'
            )}
            disabled={isSubmitting}
          >
            <span
              className={classNames(
                values.email ? 'translate-x-6' : 'translate-x-1',
                'inline-block h-4 w-4 transform rounded-full bg-white transition'
              )}
            />
          </Switch>

          <Switch.Label>Email</Switch.Label>
        </div>
      </Switch.Group>

      <Switch.Group>
        <div className="flex items-center gap-2 text-sm">
          <Switch
            name="inApp"
            checked={!!values.inApp}
            onChange={(checked) =>
              setValues(($values) => {
                $values.inApp = checked
                return $values
              })
            }
            className={classNames(
              values.inApp ? 'bg-blue-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 items-center rounded-full'
            )}
            disabled
          >
            <span
              className={classNames(
                values.inApp ? 'translate-x-6' : 'translate-x-1',
                'inline-block h-4 w-4 transform rounded-full bg-white transition'
              )}
            />
          </Switch>

          <Switch.Label>In-app</Switch.Label>
        </div>
      </Switch.Group>

      <div className="flex justify-center lg:justify-start">
        <button
          type="submit"
          className="px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner size={1} sizeUnit="em" /> : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default NotificationsForm
