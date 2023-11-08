import { GoogleReCaptchaProvider } from '@/app/providers'
import { parseConsentingConfig } from '@/helpers/cookies'
import { maintainerRoles } from '@/helpers/roles'
import { CookiesConsenting } from '@/lib/enumerators'
import { getPageTitle } from '@/lib/format'
import { checkSession } from '@/lib/session'
import { RedirectType } from 'next/dist/client/components/redirect'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: getPageTitle('Login'),
}

const LoginLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  const headersList = headers()

  const user = await checkSession(cookies())

  if (user) {
    let returnPath = '/my'

    if (maintainerRoles.includes(user.role)) returnPath = '/admin'

    const returnPathSearchParams = headersList.get('x-invoke-query')

    if (returnPathSearchParams) {
      const searchParams = JSON.parse(
        decodeURIComponent(returnPathSearchParams),
      ) as Record<string, string>

      const parsedSearchParams = new URLSearchParams(searchParams)

      const returnUrl = parsedSearchParams.get('returnUrl')

      if (returnUrl) {
        returnPath = Buffer.from(returnUrl, 'base64').toString('utf-8')
      }
    }

    redirect(returnPath, RedirectType.replace)
  }

  const cookiesConsenting = parseConsentingConfig()

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.CAPTCHA_KEY}
      useRecaptchaNet
    >
      <div className="grid min-h-full">
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          {cookiesConsenting.has(CookiesConsenting.Necessary) && (
            <div className="flex flex-col w-full max-w-md gap-y-8">
              <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                Sign in with your Stratego STS account
              </h2>

              {children}
            </div>
          )}
        </div>
      </div>
    </GoogleReCaptchaProvider>
  )
}

export default LoginLayout
