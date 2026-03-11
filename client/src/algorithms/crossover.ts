import type { Individual } from "./types";

export function crossover(parent1: Individual, parent2: Individual): Individual {

  const length = parent1.length;

  const start = Math.floor(Math.random() * length);
  const end = Math.floor(Math.random() * length);

  const child: number[] = [];

  const min = Math.min(start, end);
  const max = Math.max(start, end);

  for (let i = min; i <= max; i++) {
    child.push(parent1[i]);
  }

  parent2.forEach((gene) => {
    if (!child.includes(gene)) {
      child.push(gene);
    }
  });

  return child;
}