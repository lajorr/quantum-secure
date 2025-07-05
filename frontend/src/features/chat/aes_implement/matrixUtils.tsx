export function text2matrix(text: bigint): number[][] {
  const matrix: number[][] = []
  for (let i = 0; i < 4; i++) {
    const row: number[] = []
    for (let j = 0; j < 4; j++) {
      // Compute shift amount
      const shift = BigInt(8 * (15 - (4 * i + j)))
      const byte = Number((text >> shift) & 0xffn)
      row.push(byte)
    }
    matrix.push(row)
  }
  return matrix
}

export function matrix2text(matrix: number[][]): bigint {
  let result = 0n
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const shift = BigInt(8 * (15 - (4 * i + j)))
      result |= BigInt(matrix[i][j]) << shift
    }
  }
  return result
}