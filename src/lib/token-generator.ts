import { createHash } from 'crypto'
import { v4 as UUIDv4 } from 'uuid'

export function hashToken(
  rawToken: string,
  salt = process.env.ACCESS_TOKEN_HASH_SERVER_SALT,
) {
  return createHash(process.env.ACCESS_TOKEN_HASH_ALGORITHM)
    .update(rawToken.concat(salt))
    .digest('hex')
}

type GeneratorConfig = {
  salt?: string
}

/**
 * @server-side-only
 */
export function createToken(
  config?: GeneratorConfig,
): [raw: string, hash: string] {
  const { salt = process.env.ACCESS_TOKEN_HASH_SERVER_SALT } = config ?? {}

  const rawToken = createHash(process.env.ACCESS_TOKEN_HASH_ALGORITHM)
    .update(UUIDv4())
    .digest('hex')

  const hashedToken = createHash(process.env.ACCESS_TOKEN_HASH_ALGORITHM)
    .update(rawToken.concat(salt))
    .digest('hex')

  return [rawToken, hashedToken]
}
