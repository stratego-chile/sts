import { RecoveryTokenStatus, type TUserTOTP } from '@/schemas/user'
import crypto from 'crypto'
import getUnixTime from 'date-fns/getUnixTime'
import Base32 from 'hi-base32'
import { v4 as UUIDv4 } from 'uuid'

const EXPECTED_RECOVERY_CODES = 6

const createCipher = () => {
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(
    process.env.MFA_TOTP_USER_SECRET_KEY_HASH,
    process.env.MFA_TOTP_USER_SECRET_KEY,
    iv,
  )

  return {
    iv,
    cipher,
  }
}

export const getHash = (token: string) => {
  const hash = crypto.createHash(process.env.MFA_TOTP_SECRET_HASH)

  hash.update(token)

  return hash.digest('hex')
}

/**
 * Generates a 256 bits hash using a 2-layers obfuscation algorithm
 */
const createOTPSecret = (
  context: string,
  salt = process.env.MFA_TOTP_SECRET ?? UUIDv4(),
) => getHash([getHash(context), getHash(salt)].join('|'))

export const encodeEncryptedRef = (iv: Buffer, value: Buffer) =>
  Buffer.from(
    JSON.stringify({
      iv: iv.toString('hex'),
      value: value.toString('hex'),
    }),
  ).toString('base64')

export const createEncryptedRef = (ref: string) => {
  const secret = createOTPSecret(ref, getHash(UUIDv4()))

  const { cipher, iv } = createCipher()

  const securedSecret = Buffer.concat([cipher.update(secret), cipher.final()])

  return {
    rawRef: secret,
    encryptedRef: encodeEncryptedRef(iv, securedSecret),
  }
}

export const decodeEncryptedRef = (ref: string) =>
  JSON.parse(Buffer.from(ref, 'base64').toString('utf-8')) as {
    iv: string
    value: string
  }

export const decryptRef = (ref: string) => {
  const { iv, value } = decodeEncryptedRef(ref)

  const decipher = crypto.createDecipheriv(
    process.env.MFA_TOTP_USER_SECRET_KEY_HASH,
    process.env.MFA_TOTP_USER_SECRET_KEY,
    Buffer.from(iv, 'hex'),
  )

  const decryptedSecret = Buffer.concat([
    decipher.update(Buffer.from(value, 'hex')),
    decipher.final(),
  ])

  return Base32.encode(decryptedSecret.toString(), true)
}

/**
 * Generates a 20 bytes recovery code
 */
const createRecoveryKey = (context: string) =>
  getHash(createOTPSecret(context, UUIDv4()))
    .substring(0, 19)
    .toUpperCase() as Uppercase<string>

export const createRecoveryKeys = (
  identity: string,
  codesQuantity = EXPECTED_RECOVERY_CODES,
) => {
  const rawRecoveryKeys = new Set<Uppercase<string>>()

  while (rawRecoveryKeys.size < codesQuantity)
    rawRecoveryKeys.add(createRecoveryKey(identity))

  const encryptedRecoveryKeys: TUserTOTP['recoveryKeys'] = Array.from(
    rawRecoveryKeys,
  ).map((code) => {
    const { cipher, iv } = createCipher()

    const securedSignature = Buffer.concat([
      cipher.update(getHash(code)),
      cipher.final(),
    ])

    return {
      signature: encodeEncryptedRef(iv, securedSignature),
      status: RecoveryTokenStatus.Active,
      createdAt: getUnixTime(Date.now()),
    }
  })

  return {
    raw: Array.from(rawRecoveryKeys),
    secured: encryptedRecoveryKeys,
  }
}
