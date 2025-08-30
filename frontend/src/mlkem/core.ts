import type { DRBG } from "./drbg";
import type { KyberParams } from "./params";
import { type Bytes } from "./utils";

export interface KyberCore {
  readonly params: KyberParams;
  keygen(drbg: DRBG): { pk: Bytes; sk: Bytes };
  encrypt(pk: Bytes, m: Bytes, coins: Bytes): Bytes;
  decrypt(sk: Bytes, ct: Bytes): Bytes;
}

export class KyberCoreStub implements KyberCore {
  readonly params: KyberParams;
  constructor(params: KyberParams) {
    this.params = params;
  }
  keygen(_drbg: DRBG): { pk: Bytes; sk: Bytes } {
    const pk: Bytes = _drbg.randomBytes(this.params.pkBytes);
    const sk: Bytes = _drbg.randomBytes(this.params.skBytes);
    return { pk, sk };
  }
  encrypt(_pk: Bytes, _m: Bytes, _coins: Bytes): Bytes {
    const ct = new Uint8Array(this.params.ctBytes);
    for (let i = 0; i < ct.length; i++) ct[i] = _m[i % _m.length];
    return ct;
  }
  decrypt(_sk: Bytes, _ct: Bytes): Bytes {
    // Dummy: return the first 32 bytes (assume 32-byte “message”)
    return _ct.slice(0, 32);
  }
}
