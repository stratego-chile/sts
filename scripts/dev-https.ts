import { certificateFor, hasCertificateFor } from 'devcert'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { createServer } from 'https'
import next from 'next'
import path from 'path'
import { parse } from 'url'

const DEV_DOMAIN_NAME = 'localhost'

const DEV_CERT_DESTINATION_PATH = path.resolve(__dirname, '..', 'certs')

const PORT = 3000

const devCertFilesPaths = new Map<'key' | 'cert' | 'caPath', string>()

devCertFilesPaths.set(
  'key',
  path.join(DEV_CERT_DESTINATION_PATH, 'devcert.key')
)
devCertFilesPaths.set(
  'cert',
  path.join(DEV_CERT_DESTINATION_PATH, 'devcert.cert')
)
devCertFilesPaths.set('caPath', path.join(DEV_CERT_DESTINATION_PATH, '.capath'))

const checkCertificatesFiles = () => {
  for (const certificateFilePath of Array.from(devCertFilesPaths.values())) {
    if (!existsSync(certificateFilePath)) {
      return false
    }
  }

  if (!hasCertificateFor(DEV_DOMAIN_NAME)) return false

  return true
}

const certificatesSetup = async () => {
  if (!existsSync(DEV_CERT_DESTINATION_PATH))
    mkdirSync(DEV_CERT_DESTINATION_PATH)

  if (!checkCertificatesFiles()) {
    const { key, cert, caPath } = await certificateFor([DEV_DOMAIN_NAME], {
      getCaPath: true,
    })

    writeFileSync(devCertFilesPaths.get('key')!, key)
    writeFileSync(devCertFilesPaths.get('cert')!, cert)
    writeFileSync(devCertFilesPaths.get('caPath')!, caPath)
  }
}

// Start server in HTTPS mode
;(async () => {
  await certificatesSetup()

  if (!checkCertificatesFiles()) throw new Error('Certificates files not found')

  const app = next({ dev: process.env.NODE_ENV !== 'production' })

  const handle = app.getRequestHandler()

  await app.prepare()

  const server = createServer(
    {
      key: readFileSync(devCertFilesPaths.get('key')!),
      cert: readFileSync(devCertFilesPaths.get('cert')!),
    },
    (request, response) => {
      const parsedUrl = parse(request.url!, true)
      handle(request, response, parsedUrl)
    }
  )

  server.listen(PORT, () =>
    console.log(
      `ready - started server on url: https://${DEV_DOMAIN_NAME}:${PORT}`
    )
  )
})()
