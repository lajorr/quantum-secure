import { RSAContext } from './RsaContext'
import { RSA } from './rsa'
import type { ReactNode } from 'react'
import type { RSAPublicKey, RSAPrivateKey } from './rsa'

const p = 5n
const q = 7n
const n = p * q
const e = 5n
const d = 29n

const publicKey: RSAPublicKey = { e, n }
const privateKey: RSAPrivateKey = { d, n }

const rsa = new RSA(publicKey, privateKey)

export function RSAProvider({ children }: { children: ReactNode }) {
  const contextValue = {
    publicKey,
    privateKey,
    encryptDigit: (digit: string) => rsa.encrypt(digit)[0], // For single digit
    decryptDigit: (cipher: bigint) => rsa.decrypt([cipher]), // For single digit
    encrypt: (hex: string) => rsa.encrypt(hex),
    decrypt: (chunks: bigint[]) => rsa.decrypt(chunks),
  }

  return (
    <RSAContext.Provider value={contextValue}>{children}</RSAContext.Provider>
  )
}
