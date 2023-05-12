import { PlusIcon } from '@heroicons/react/24/outline'

const NewTicketButton = () => {
  return (
    <button className="px-2 py-2 rounded text-white bg-zinc-800 hover:bg-zinc-700">
      <PlusIcon className="inline-flex h-4 w-4" /> New ticket
    </button>
  )
}

export default NewTicketButton
