import type { KyberCore } from "./core";
import { type DRBG, ShakeDRBG } from "./drbg";
import { Hash } from "./hash";
import { type Bytes, concat, eqConst } from "./utils";

export interface KeyPair {
  ek: Bytes;
  dk: Bytes;
}
export interface EncapsOut {
  ct: Bytes;
  ss: Bytes;
}

export interface MLKEMOptions {
  /** Concrete IND‑CPA Kyber core (keygen/encrypt/decrypt + params). */
  core: KyberCore;
  /** Optional DRBG (default: SHAKE‑based). */
  drbg?: DRBG;
  /** KDF: ss = KDF(K || H(ct)) (default: SHA3‑256). */
  kdf?: (input: Bytes) => Bytes;
  /** G: expands to 64 bytes for (K̄ || coins) (default: SHAKE256). */
  G?: (input: Bytes) => Bytes;
}

export class MLKEM {
  private readonly core: KyberCore;
  private readonly drbg: DRBG;
  private readonly kdf: (input: Bytes) => Bytes;
  private readonly G: (input: Bytes) => Bytes; // 64‑byte output
  private readonly ssLen: number;

  constructor(opts: MLKEMOptions) {
    this.core = opts.core;
    this.drbg = opts.drbg ?? new ShakeDRBG();
    this.kdf = opts.kdf ?? Hash.H256;
    this.G = opts.G ?? ((x: Bytes) => Hash.SHAKE256(x, 64));
    this.ssLen = this.core.params.ssBytes;
  }

  /**
   * Optional: seed the internal DRBG for deterministic tests/KATs.
   */
  setDRBGSeed(seed: Bytes): void {
    this.drbg.reseed(seed);
  }

  /**
   * Deterministic key derivation from a seed (mirrors kyber‑py key_derive).
   * Uses a throwaway DRBG seeded with `seed` for IND‑CPA keygen.
   */
  deriveKeypair(seed: Bytes): KeyPair {
    const tmp = new ShakeDRBG(seed);
    const { pk, sk } = this.core.keygen(tmp); // public key , secret key
    const hpk = Hash.H256(pk);
    const z = this.drbg.randomBytes(32); // deterministic if setDRBGSeed used
    const dk = concat(sk, pk, hpk, z);
    return { ek: pk, dk };
  }

  /** Generate a fresh keypair using the instance DRBG. */
  keygen(): KeyPair {
    const { pk, sk } = this.core.keygen(this.drbg);
    const hpk = Hash.H256(pk);
    const z = this.drbg.randomBytes(32);
    const dk = concat(sk, pk, hpk, z);
    return { ek: pk, dk };
  }

  /** Encapsulate to public key ek → (ct, ss). */
  encaps(ek: Bytes): EncapsOut {
    // m ← H(random 32)
    const m = Hash.H256(this.drbg.randomBytes(32));
    const hpk = Hash.H256(ek);

    // (K̄ || coins) ← G(m || hpk)
    const r = this.G(concat(m, hpk));
    if (r.length < 64) throw new Error("G must output 64 bytes");
    const Kbar = r.slice(0, 32);
    const coins = r.slice(32, 64); // pseudo random input

    // c ← IND‑CPA.Encrypt(ek, m, coins)
    const ct = this.core.encrypt(ek, m, coins);

    // ss ← KDF(K̄ || H(c))
    const ss = this.kdf(concat(Kbar, Hash.H256(ct))).slice(0, this.ssLen);
    return { ct, ss };
  }

  decaps(dk: Bytes, ct: Bytes): Bytes {
    const p = this.core.params;

    // Parse secret key fields
    const off0 = 0;
    const off1 = off0 + p.skBytes; // end of indcpa_sk
    const off2 = off1 + p.pkBytes; // end of indcpa_pk
    const off3 = off2 + 32; // end of H(pk)

    const indcpa_sk = dk.slice(off0, off1);
    const indcpa_pk = dk.slice(off1, off2);
    const hpk = dk.slice(off2, off3);
    const z = dk.slice(off3);

    // m' ← IND‑CPA.Decrypt(indcpa_sk, ct)
    const mPrime = this.core.decrypt(indcpa_sk, ct);

    // (K̄' || coins') ← G(m' || hpk)
    const r = this.G(concat(mPrime, hpk));
    const KbarPrime = r.slice(0, 32);
    const coinsPrime = r.slice(32, 32 + p.seedBytes);

    // c' ← IND‑CPA.Encrypt(indcpa_pk, m', coins')
    const ctPrime = this.core.encrypt(indcpa_pk, mPrime, coinsPrime);

    // Compare ct to c' in constant time
    const equal = eqConst(ct, ctPrime);

    // K̂ ← equal ? K̄' : H(z || H(ct))
    const Khat = equal ? KbarPrime : Hash.H256(concat(z, Hash.H256(ct)));

    // ss ← KDF(K̂ || H(ct))
    return this.kdf(concat(Khat, Hash.H256(ct))).slice(0, this.ssLen);
  }
}
