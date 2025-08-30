import { Hash } from "./hash";
import { type Bytes, concat } from "./utils";

export interface DRBG {
  reseed(seed: Bytes): void;
  randomBytes(len: number): Bytes;
}

export class ShakeDRBG implements DRBG {
  private state: Bytes;
  private ctr = 0;
  constructor(seed?: Bytes) {
    this.state = seed ? seed.slice() : new Uint8Array(0);
  }
  reseed(seed: Bytes) {
    this.state = seed.slice();
    this.ctr = 0;
  }
  randomBytes(len: number): Bytes {
    const ctrBytes = new Uint8Array(8);
    new DataView(ctrBytes.buffer).setUint32(4, this.ctr++, false);
    return Hash.SHAKE256(concat(this.state, ctrBytes), len);
  }
}
