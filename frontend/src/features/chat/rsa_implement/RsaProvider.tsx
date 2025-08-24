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
  const contextValue = {
    publicKey,
    privateKey,
    encryptDigit: (digit: string) => rsa.encrypt(digit)[0], // For single digit
    decryptDigit: (cipher: bigint) => rsa.decrypt([cipher]), // For single digit
    encrypt: (hex: string) => rsa.encrypt(hex),
    decrypt: (chunks: bigint[]) => rsa.decrypt(chunks),
  };

  return (
    <RSAContext.Provider value={contextValue}>{children}</RSAContext.Provider>
  );
}
