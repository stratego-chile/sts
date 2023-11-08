import { redirect } from 'next/navigation'

export const GET = async (request: Request) => {
  redirect(new URL('/account/settings', request.url).href)
}
