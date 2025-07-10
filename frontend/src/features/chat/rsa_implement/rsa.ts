export type RSAPublicKey = { e: bigint; n: bigint }
export type RSAPrivateKey = { d: bigint; n: bigint }

export class RSA {
  constructor(
    public publicKey: RSAPublicKey,
    public privateKey: RSAPrivateKey
  ) {}

  // Modular exponentiation
  private modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    let result = 1n
    let b = base % modulus
    let e = exponent
    while (e > 0n) {
      if (e % 2n === 1n) {
        result = (result * b) % modulus
      }
      b = (b * b) % modulus
      e = e / 2n
    }
    return result
  }

  // Encrypt a full hex string
  encrypt(hexString: string): bigint[] {
    const digits = hexString.split('')
    return digits.map((digit) => {
      const m = BigInt(parseInt(digit, 16))
      if (m >= this.publicKey.n)
        throw new Error(
          `Digit ${digit} too large for modulus ${this.publicKey.n}`
        )
      return this.modPow(m, this.publicKey.e, this.publicKey.n)
    })
  }

  // Decrypt array of BigInts back to hex string
  decrypt(cipherChunks: bigint[]): string {
    return cipherChunks
      .map((c) => {
        const m = this.modPow(c, this.privateKey.d, this.privateKey.n)
        return m.toString(16)
      })
      .join('')
  }
}
