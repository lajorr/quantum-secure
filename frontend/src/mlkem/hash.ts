import { keccak256, sha3_256, shake256 } from "js-sha3";
import { type Bytes, hexToU8 } from "./utils";

export namespace Hash {
  export function H256(msg: Bytes): Bytes {
    return hexToU8(sha3_256.update(msg).hex());
  }
  export function KEC256(msg: Bytes): Bytes {
    return hexToU8(keccak256.update(msg).hex());
  }
  export function SHAKE256(msg: Bytes, outLen: number): Bytes {
    const hex = shake256(msg, outLen * 8);
    return hexToU8(hex.slice(0, outLen * 2));
  }
}
