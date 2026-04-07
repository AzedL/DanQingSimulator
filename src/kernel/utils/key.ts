export function join(...args: string[]) {
  return args.join('-')
}

export function split(key: string) {
  return key.split('-')[0]
}
