import { GoogleReCaptchaProvider } from '@stratego-sts/app/providers'
import { checkSession } from '@stratego-sts/lib/session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const LoginTemplate = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  const user = await checkSession(cookies())

  if (user) {
    redirect('/account')
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
