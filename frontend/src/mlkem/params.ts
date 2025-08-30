export type SecurityLevel = 512 | 768 | 1024;

export interface KyberParams {
  k: number;
  eta1: number;
  eta2: number;
  du: number;
  dv: number;
  pkBytes: number;
  skBytes: number;
  ctBytes: number;
  ssBytes: number;
  seedBytes: number;
}

export const KYBER512_PARAMS: KyberParams = {
  k: 2, // no of polynomials 
  eta1: 3, // noise distrubution for key gen
  eta2: 2, // noise distrubution for encryption
  du: 10,
  dv: 4,
  pkBytes: 800,
  skBytes: 1632,
  ctBytes: 736,
  ssBytes: 32,
  seedBytes: 32,
};
export const KYBER768_PARAMS: KyberParams = {
  k: 3,
  eta1: 2,
  eta2: 2,
  du: 10,
  dv: 4,
  pkBytes: 1184,
  skBytes: 2400,
  ctBytes: 1088,
  ssBytes: 32,
  seedBytes: 32,
};
export const KYBER1024_PARAMS: KyberParams = {
  k: 4,
  eta1: 2,
  eta2: 2,
  du: 11,
  dv: 5,
  pkBytes: 1568,
  skBytes: 3168,
  ctBytes: 1568,
  ssBytes: 32,
  seedBytes: 32,
};
