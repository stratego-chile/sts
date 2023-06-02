import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'

type IdSelectorProps = {
  label: string
  id: string
}

const IdSelector: React.FC<IdSelectorProps> = ({ label, id }) => {
  return (
    <span className="flex flex-col lg:flex-row lg:items-center gap-x-4 gap-y-2 text-sm text-gray-500">
      <span>{label}:</span>

      <span className="inline-flex justify-between items-center bg-gray-200 text-gray-500 rounded">
        <span className="px-2 select-all">{id}</span>

        <button
          className={classNames(
            'inline px-1.5 py-1 rounded-r border-l border-gray-300',
            'hover:bg-gray-600 hover:text-gray-50',
            'transition duration-200 ease-in-out'
          )}
          onClick={() =>
            navigator?.clipboard?.writeText && navigator.clipboard.writeText(id)
          }
        >
          <span>
            <ClipboardDocumentIcon className="h-4 w-4" />
          </span>
        </button>
      </span>
    </span>
  )
}

export default IdSelector
