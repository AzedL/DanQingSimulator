function random(probability: number) {
  if (probability < 0) probability = 0
  if (probability > 1) probability = 1
  return +(Math.random() < probability)
}

export function fluctuate(value: number, variance: number = 0) {
  return value + (Math.random() - 0.5) * 2 * variance * value
}

export function handleProbability(probability: number, useRandom = false) {
  return useRandom ? random(probability) : probability
}
