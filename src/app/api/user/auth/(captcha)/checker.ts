export const checkCaptchaToken = async (token: string) => {
  const destinationURL = new URL(process.env.CAPTCHA_VERIFIER_API)

  destinationURL.searchParams.append('secret', process.env.CAPTCHA_SECRET)
  destinationURL.searchParams.append('response', token)

  const captchaValidationResponse = await fetch(destinationURL.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json; charset=utf-8',
    },
  })

  const data: {
    success: boolean
    score: number
    action: string
    challenge_ts: string
    hostname: string
    'error-codes'?: string[]
  } = await captchaValidationResponse.json()

  return data.success && data.score > parseFloat(process.env.CAPTCHA_MIN_SCORE)
}
