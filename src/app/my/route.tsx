import { redirect } from 'next/navigation'

export const GET = async (request: Request) => {
  redirect(new URL('/my/dashboard', request.url).href)
}
