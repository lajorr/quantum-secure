import { createContext, useContext } from 'react'

export interface RSAPublicKey {
  e: bigint
  n: bigint
}

export interface RSAPrivateKey {
  d: bigint
  n: bigint
}

export interface RSAContextType {
  publicKey: { e: bigint; n: bigint }
  privateKey: { d: bigint; n: bigint }
  encryptDigit: (hexDigit: string) => bigint
  decryptDigit: (cipher: bigint) => string
  encrypt?: (hexString: string) => bigint[]
  decrypt?: (chunks: bigint[]) => string
}


export const RSAContext = createContext<RSAContextType | null>(null)

export function useRSA() {
  const ctx = useContext(RSAContext)
  if (!ctx) throw new Error('useRSA must be used inside RSAProvider')
  return ctx
}
