'use client'

import classNames from 'classnames'
import { useFormik } from 'formik'

const UserCreationForm = () => {
  const { handleSubmit } = useFormik({
    initialValues: {},
    onSubmit: async () => void 0,
  })

  return (
    <form
      className="flex flex-col lg:flex-row justify-between gap-4"
      onSubmit={handleSubmit}
    >
      <div className="inline-flex flex-col gap-4"></div>

      <div className="inline-flex flex-col gap-2">
        <button
          type="submit"
          role="button"
          className={classNames(
            'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md',
            'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          )}
        >
          Create
        </button>

        <button
          type="button"
          role="button"
          onClick={() => void 0}
          className={classNames(
            'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md',
            'text-gray-50 bg-gray-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          )}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default UserCreationForm
