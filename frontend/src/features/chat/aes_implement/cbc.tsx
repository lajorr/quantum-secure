import {AES} from './aes'
import { Buffer } from 'buffer'

const BLOCK_SIZE = 16

function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i]
  }
  return result
}

function pad(data: Uint8Array): Uint8Array {
  const padLen = BLOCK_SIZE - (data.length % BLOCK_SIZE)
  const padding = new Uint8Array(padLen).fill(padLen)
  const padded = new Uint8Array(data.length + padLen)
  padded.set(data)
  padded.set(padding, data.length)
  return padded
}

function unpad(data: Uint8Array): Uint8Array {
  const padLen = data[data.length - 1]
  return data.slice(0, data.length - padLen)
}

export function encryptCBC(
  aes: AES,
  data: Uint8Array,
  iv: Uint8Array
): Uint8Array {
  const padded = pad(data)
  let encrypted = new Uint8Array()
  let prev = iv

  for (let i = 0; i < padded.length; i += BLOCK_SIZE) {
    const block = xorBytes(padded.slice(i, i + BLOCK_SIZE), prev)
    const encryptedBlock = BigInt.asUintN(
      128,
      aes.encrypt(BigInt('0x' + Buffer.from(block).toString('hex')))
    )
    const encryptedBlockBytes = new Uint8Array(
      Buffer.from(encryptedBlock.toString(16).padStart(32, '0'), 'hex')
    )
    encrypted = new Uint8Array([...encrypted, ...encryptedBlockBytes])
    prev = encryptedBlockBytes
  }

  return new Uint8Array([...iv, ...encrypted])
}

export function decryptCBC(aes: AES, data: Uint8Array): Uint8Array {
  const iv = data.slice(0, BLOCK_SIZE)
  const ciphertext = data.slice(BLOCK_SIZE)
  let decrypted = new Uint8Array()
  let prev = iv

  for (let i = 0; i < ciphertext.length; i += BLOCK_SIZE) {
    const block = ciphertext.slice(i, i + BLOCK_SIZE)
    const decryptedBlockBigInt = aes.decrypt(
      BigInt('0x' + Buffer.from(block).toString('hex'))
    )
    const decryptedBlockBytes = new Uint8Array(
      Buffer.from(decryptedBlockBigInt.toString(16).padStart(32, '0'), 'hex')
    )
    const xorBlock = xorBytes(decryptedBlockBytes, prev)
    decrypted = new Uint8Array([...decrypted, ...xorBlock])
    prev = block
  }

  return unpad(decrypted)
}
