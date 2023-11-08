import { packageManager, scripts } from '../package.json'
import childProcess, { type ChildProcess } from 'child_process'
;((async () => {
  try {
    const VERSION_SEPARATOR = '@'

    const KNOWN_PKG_MANAGERS = ['pnpm', 'npm', 'yarn']

    const DEFAULT_PKG_MANAGER = KNOWN_PKG_MANAGERS[0]

    const currentPackageManager = (() => {
      let providedPackageManager = String(packageManager ?? '')

      if (/^([a-z]*)(@\d+(\.\d+){2})?$/i.test(providedPackageManager)) {
        if (providedPackageManager.includes(VERSION_SEPARATOR))
          providedPackageManager =
            providedPackageManager.split(VERSION_SEPARATOR)[0]

        if (KNOWN_PKG_MANAGERS.includes(providedPackageManager))
          return providedPackageManager
      }
      return DEFAULT_PKG_MANAGER
    })()

    const execList = Object.keys(scripts).filter((key) =>
      /^(lint:)([\w|-]*)$/i.test(key)
    )

    const onExit = ($childProcess: ChildProcess) =>
      new Promise((resolve, reject) => {
        $childProcess.once('exit', (code) => {
          if (code === 0) resolve(undefined)
          else reject(new Error('Exit with error code: ' + code))
        })
        $childProcess.once('error', (err) => reject(err))
      })

    for (const command of execList) {
      const execution = childProcess.spawn(
        currentPackageManager,
        ['run', command],
        {
          stdio: [process.stdin, process.stdout, process.stderr],
        }
      )
      await onExit(execution)
    }
  } catch (error) {
    process.exit(1)
  }
})())
