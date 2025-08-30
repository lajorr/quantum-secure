import { Buffer } from "buffer";
import type { ReactNode } from "react";
import type { RSAPrivateKey, RSAPublicKey } from "../types/rsa";
import { RSAContext } from "./RsaContext";
import { RSA } from "./rsa";

const p = 3n;
const q = 5n;
const n = p * q;
const e = 3n;
const d = 3n;

const publicKey: RSAPublicKey = { e, n };
const privateKey: RSAPrivateKey = { d, n };

const rsa = new RSA(publicKey, privateKey);

export function RSAProvider({ children }: { children: ReactNode }) {
  const aesKeyHex = "2a7c041526bcd2a4abe6158809ce4d3";
  function getEncryptedAesKey() {
    const encryptedChunks = rsa.encrypt(aesKeyHex);
    //Base64 encode encrypted RSA output for sending
    const base64 = Buffer.from(
      encryptedChunks.map((chunk) => chunk.toString()).join(",")
    ).toString("base64");

    return base64;
  }

  function getAesBigIntKey() {
    return BigInt("0x" + aesKeyHex);
  }

  function decryptAesKey(encAesKey: string) {
    const encryptedStr = Buffer.from(encAesKey!, "base64").toString();
    const encryptedChunks = encryptedStr.split(",").map((s) => BigInt(s));
    const decryptedHex = rsa.decrypt(encryptedChunks);
    const aesKey = BigInt("0x" + decryptedHex);
    return aesKey;
  }

  const contextValue = {
    publicKey,
    privateKey,
    encryptDigit: (digit: string) => rsa.encrypt(digit)[0], // For single digit
    decryptDigit: (cipher: bigint) => rsa.decrypt([cipher]), // For single digit
    encrypt: (hex: string) => rsa.encrypt(hex),
    decrypt: (chunks: bigint[]) => rsa.decrypt(chunks),
    getEncryptedAesKey,
    getAesBigIntKey,
    decryptAesKey,
  };

  return (
    <RSAContext.Provider value={contextValue}>{children}</RSAContext.Provider>
  );
}
