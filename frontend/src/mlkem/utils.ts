import { Buffer } from "buffer";

export type Bytes = Uint8Array;

export function concat(...chunks: Bytes[]): Bytes {
  const len = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

export function eqConst(a: Bytes, b: Bytes): boolean {
  if (a.length !== b.length) return false;
  let v = 0;
  for (let i = 0; i < a.length; i++) v |= a[i] ^ b[i];
  return v === 0;
}

export function hexToU8(hex: string): Bytes {
  if (hex.length % 2) throw new Error("hex length");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++)
    out[i] = parseInt(hex.slice(2 * i, 2 * i + 2), 16);
  return out;
}

export function stringToBytes(str: string): Bytes {
  return Buffer.from(str, "hex");
}

export function bytesToString(bytes: Bytes): string {
  return Buffer.from(bytes).toString("hex");
}

export function bytesToBigInt(bytes: Bytes): bigint {
  let result = 0n;
  for (const b of bytes) {
    result = (result << 8n) | BigInt(b);
  }
  return result;
}
