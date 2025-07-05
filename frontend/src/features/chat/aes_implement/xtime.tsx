export const xtime = (a: number): number => {
  // Check if the MSB (bit 7) is set
  if ((a & 0x80) !== 0) {
    // Left shift by 1, XOR with 0x1B, and mask to 8 bits
    return ((a << 1) ^ 0x1b) & 0xff
  } else {
    // Just left shift by 1
    return (a << 1) & 0xff
  }
}
