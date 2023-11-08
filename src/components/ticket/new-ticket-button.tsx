'use client'

import PlusIcon from '@heroicons/react/24/outline/PlusIcon'
import dynamic from 'next/dynamic'
import { Fragment, Suspense, useState } from 'react'

const NewTicketModal = dynamic(
  () => import('@/components/ticket/new-ticket-modal'),
)

const NewTicketButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <Fragment>
      <button
        className="px-2 py-2 rounded text-white bg-zinc-800 hover:bg-zinc-700"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="inline-flex h-4 w-4" aria-hidden="true" /> New
        ticket
      </button>

      <Suspense>
        <NewTicketModal open={open} onClose={() => setOpen(false)} />
      </Suspense>
    </Fragment>
  )
}

export default NewTicketButton
