import { Sbox } from './Sbox'
import { Rcon } from './Rcon'
import { xtime } from './xtime'
import { text2matrix, matrix2text } from './matrixUtils'

export class AES {
  roundKeys: number[][][]

  constructor(masterKey: bigint) {
    this.roundKeys = this.keyExpansion(masterKey)
  }

  keyExpansion(masterKey: bigint): number[][][] {
    const keys: number[][] = text2matrix(masterKey)

    for (let i = 4; i < 44; i++) {
      let word = [...keys[i - 1]]
      if (i % 4 === 0) {
        // rotate word
        word = [...word.slice(1), word[0]]
        // substitute bytes
        word = word.map((b) => Sbox[b])
        // Rcon
        word[0] ^= Rcon[Math.floor(i / 4)]
      }
      const prevWord = keys[i - 4]
      const newWord = word.map((b, j) => b ^ prevWord[j])
      keys.push(newWord)
    }

    const roundKeys: number[][][] = []
    for (let i = 0; i < 44; i += 4) {
      roundKeys.push(keys.slice(i, i + 4))
    }
    return roundKeys
  }

  encrypt(plaintext: bigint): bigint {
    const state = text2matrix(plaintext)
    this.addRoundKey(state, this.roundKeys[0])

    for (let i = 1; i < 10; i++) {
      this.roundEncrypt(state, this.roundKeys[i])
    }

    this.subBytes(state)
    this.shiftRows(state)
    this.addRoundKey(state, this.roundKeys[10])

    return matrix2text(state)
  }

  decrypt(ciphertext: bigint): bigint {
    const state = text2matrix(ciphertext)
    this.addRoundKey(state, this.roundKeys[10])
    this.invShiftRows(state)
    this.invSubBytes(state)

    for (let i = 9; i > 0; i--) {
      this.roundDecrypt(state, this.roundKeys[i])
    }

    this.addRoundKey(state, this.roundKeys[0])
    return matrix2text(state)
  }

  subBytes(state: number[][]) {
    for (let i = 0; i < 4; i++) {
      state[i] = state[i].map((b) => Sbox[b])
    }
  }

  shiftRows(s: number[][]) {
    s[1] = [...s[1].slice(1), ...s[1].slice(0, 1)]
    s[2] = [...s[2].slice(2), ...s[2].slice(0, 2)]
    s[3] = [...s[3].slice(3), ...s[3].slice(0, 3)]
  }

  mixColumns(s: number[][]) {
    for (let i = 0; i < 4; i++) {
      const a = s[i]
      const t = a[0] ^ a[1] ^ a[2] ^ a[3]
      const u = a[0]
      a[0] ^= t ^ xtime(a[0] ^ a[1])
      a[1] ^= t ^ xtime(a[1] ^ a[2])
      a[2] ^= t ^ xtime(a[2] ^ a[3])
      a[3] ^= t ^ xtime(a[3] ^ u)
    }
  }

  roundEncrypt(s: number[][], k: number[][]) {
    this.subBytes(s)
    this.shiftRows(s)
    this.mixColumns(s)
    this.addRoundKey(s, k)
  }

  addRoundKey(s: number[][], k: number[][]) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        s[i][j] ^= k[i][j]
      }
    }
  }

  invSubBytes(s: number[][]) {
    const InvSbox: number[] = Array(256)
    for (let i = 0; i < 256; i++) {
      InvSbox[Sbox[i]] = i
    }
    for (let i = 0; i < 4; i++) {
      s[i] = s[i].map((b) => InvSbox[b])
    }
  }

  invShiftRows(s: number[][]) {
    s[1] = [...s[1].slice(-1), ...s[1].slice(0, -1)]
    s[2] = [...s[2].slice(-2), ...s[2].slice(0, -2)]
    s[3] = [...s[3].slice(-3), ...s[3].slice(0, -3)]
  }

  invMixColumns(s: number[][]) {
    for (let i = 0; i < 4; i++) {
      const u = xtime(xtime(s[i][0] ^ s[i][2]))
      const v = xtime(xtime(s[i][1] ^ s[i][3]))
      s[i][0] ^= u
      s[i][1] ^= v
      s[i][2] ^= u
      s[i][3] ^= v
    }
    this.mixColumns(s)
  }

  roundDecrypt(s: number[][], k: number[][]) {
    this.addRoundKey(s, k)
    this.invMixColumns(s)
    this.invShiftRows(s)
    this.invSubBytes(s)
  }
}
