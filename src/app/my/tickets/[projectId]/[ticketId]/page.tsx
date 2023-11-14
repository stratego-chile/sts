import Loading from '@/app/my/loading'
import dynamic from 'next/dynamic'
import { Fragment, Suspense } from 'react'

const TicketDetailsWrapper = dynamic(
  () => import('@/components/ticket/details-wrapper'),
)

const TicketDetailsPage = () => {
  return (
    <Fragment>
      <Suspense fallback={<Loading />}>
        <TicketDetailsWrapper mode="client" />
      </Suspense>
    </Fragment>
  )
}

export default TicketDetailsPage
