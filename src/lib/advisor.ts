import chalk, { type ChalkInstance } from 'chalk'

/**
 * Create a security advisory for the browser console
 *
 * This is useful for warning users about security issues when trying to use the console in developer mode.
 */
export class Advisor {
  private logger = console.info

  messages: Array<
    [
      formatter: ChalkInstance | Array<ChalkInstance>,
      message: string,
      customFormat?: (msg: string) => Array<string>,
    ]
  > = [
    [
      [chalk.gray, chalk.bgBlueBright],
      `⚠️ Security Advisory ⚠️`,
      (msg) => [`%c${msg}`, 'font-size: large'],
    ],
    [
      chalk.bold,
      `This is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone's account, it is a scam and will give them access to your account.`,
    ],
    [
      [chalk.white, chalk.bgGray],
      `See ${chalk.underline(
        'https://en.wikipedia.org/wiki/Self-XSS',
      )} for more information.`,
    ],
  ]

  emit() {
    for (const [formatter, message, custom = (msg: string) => [msg]] of this
      .messages)
      this.logger(
        ...custom(
          formatter instanceof Array
            ? formatter.reduce(
                (formatted, format) => format(formatted),
                message,
              )
            : formatter(message),
        ),
      )
  }
}
