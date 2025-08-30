import { createContext, useContext, useEffect, useState } from "react";
import {
  bytesToBigInt,
  Hash,
  KYBER512_PARAMS,
  KyberCoreStub,
  MLKEM,
  stringToBytes,
  type Bytes,
  type EncapsOut,
  type KeyPair,
} from "../../../mlkem";

type MLKemContextType = {
  keygen: () => KeyPair;
  encaps: (ek: Bytes) => EncapsOut;
  decaps: (dk: Bytes, ct: Bytes) => Bytes;
  getAesKey: (recPubKey?: string) => Bytes;
  getCipherText: () => Bytes;
  getPrivateKey: () => Bytes;
  setPrivateKey: (dk: string) => void;
  generateAesKey: (ct: string, privKey: string, isOwn: boolean) => bigint;
};

const MLKemContext = createContext<MLKemContextType | null>(null);

export const MLKEMProvider = ({ children }: { children: React.ReactNode }) => {
  const [mlkem, setMlkem] = useState<MLKEM | null>(null);
  const [cipherText, setCipherText] = useState<Bytes | null>(null);
  const [aesKey, setAesKey] = useState<Bytes | null>(null);
  const [privKey, setPrivKey] = useState<Bytes | null>(null);

  useEffect(() => {
    const core = new KyberCoreStub(KYBER512_PARAMS);
    const mlkem = new MLKEM({ core });
    setMlkem(mlkem);
  }, []);

  const keygen = () => mlkem!.keygen();
  const encaps = (ek: Bytes) => mlkem!.encaps(ek);
  const decaps = (dk: Bytes, ct: Bytes) => mlkem!.decaps(dk, ct);

  const getAesKey = (recPubKey?: string) => {
    if (aesKey && (recPubKey == null || recPubKey === "")) return aesKey;
    const derived = mlkem!.encaps(stringToBytes(recPubKey!)); // receivers pub key
    setCipherText(derived.ct);
    // setDecriptionAesKey(encapsulated_keys.dk);
    const key = Hash.H256(derived.ss).slice(0, 16);
    setAesKey(key);
    return key;
  };

  const setPrivateKey = (dk: string) => {
    const _dk = stringToBytes(dk);
    setPrivKey(_dk);
  };

  const getCipherText = () => cipherText!;
  const getPrivateKey = () => privKey!;

  const generateAesKey = (ct: string, privKey: string, isOwn: boolean) => {
    // get aes key
    console.log("generating Aes key", ct, privKey);
    const ss = mlkem!.decaps(stringToBytes(privKey), stringToBytes(ct));
    const aesKeyByte = Hash.H256(ss).slice(0, 16);
    const aesKeyBigInt = isOwn
      ? bytesToBigInt(aesKey!)
      : bytesToBigInt(aesKeyByte);
    console.log("aesKeyBigInt: ", aesKeyBigInt);
    return aesKeyBigInt;
  };

  return (
    <MLKemContext.Provider
      value={{
        keygen,
        encaps,
        decaps,
        getAesKey,
        getCipherText,
        getPrivateKey,
        setPrivateKey,
        generateAesKey,
      }}
    >
      {children}
    </MLKemContext.Provider>
  );
};

export const useMLKEM = () => {
  const context = useContext(MLKemContext);
  if (!context)
    throw new Error("mlkemContext must be used within MLKEM Provider");
  return context;
};
