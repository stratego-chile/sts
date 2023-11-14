import Loading from '@/app/admin/loading'
import dynamic from 'next/dynamic'
import { Fragment, Suspense } from 'react'

const TicketDetailsWrapper = dynamic(
  () => import('@/components/ticket/details-wrapper'),
)

const AdminTicketDetailsPage = () => {
  return (
    <Fragment>
      <Suspense fallback={<Loading />}>
        <TicketDetailsWrapper mode="admin" />
      </Suspense>
    </Fragment>
  )
}

export default AdminTicketDetailsPage
