function random(probability: number) {
  if (probability < 0) probability = 0
  if (probability > 1) probability = 1
  return +(Math.random() < probability)
}

export function fluctuate(value: number, variance: number = 0) {
  return value + (Math.random() - 0.5) * 2 * variance * value
}

export function handleProbability(probability: number, useRandom = false, count = 1) {
  if (!useRandom) return probability * count

  let c = 0
  for (let i = 0; i < count; i++) {
    c += random(probability)
  }
  return c
}
