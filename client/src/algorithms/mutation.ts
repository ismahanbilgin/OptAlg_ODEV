import type { Individual } from "./types";

export function mutate(individual: Individual, mutationRate: number): Individual {

  const newIndividual = [...individual];

  if (Math.random() < mutationRate) {

    const i = Math.floor(Math.random() * newIndividual.length);
    const j = Math.floor(Math.random() * newIndividual.length);

    const temp = newIndividual[i];
    newIndividual[i] = newIndividual[j];
    newIndividual[j] = temp;

  }

  return newIndividual;
}
