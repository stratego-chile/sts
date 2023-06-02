import { redirect } from 'next/navigation'

export const GET = async (request: Request) => {
  redirect(new URL('/admin/console', request.url).href)
}
