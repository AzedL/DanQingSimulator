export function fixed(num: number, decimal: number = 2) {
  return Number(num.toFixed(decimal))
}

export function ceil(num: number) {
  return Math.ceil(num)
}

export function min(...nums: number[]) {
  return Math.min(...nums)
}

export function max(...nums: number[]) {
  return Math.max(...nums)
}

export function toNumber(str: string) {
  return parseInt(str) || 0
}
