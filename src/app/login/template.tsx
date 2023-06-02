import { GoogleReCaptchaProvider } from '@/app/providers'
import { AccountRole } from '@/lib/enumerators'
import { checkSession } from '@/lib/session'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

const LoginTemplate = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  const headersList = headers()

  const user = await checkSession(cookies())

  if (user) {
    let returnPath = '/account'

    if ([AccountRole.Admin, AccountRole.Auditor].includes(user.role)) {
      returnPath = '/admin'
    }

    const returnPathSearchParams = headersList.get('x-invoke-query')

    if (returnPathSearchParams) {
      const searchParams = JSON.parse(
        decodeURIComponent(returnPathSearchParams)
      ) as Record<string, string>

      const parsedSearchParams = new URLSearchParams(searchParams)

      const returnUrl = parsedSearchParams.get('returnUrl')

      if (returnUrl) {
        returnPath = Buffer.from(returnUrl, 'base64').toString('utf-8')
        console.log(returnPath)
      }
    }

    redirect(returnPath)
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.CAPTCHA_KEY}
      useRecaptchaNet
    >
      {children}
    </GoogleReCaptchaProvider>
  )
}

export default LoginTemplate
