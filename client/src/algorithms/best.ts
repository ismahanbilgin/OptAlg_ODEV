import type { Individual } from "./types";
import { fitness } from "./fitness";

type Point = {
  lat: number;
  lng: number;
};

export function bestIndividual(
  population: Individual[],
  start: Point,
  end: Point
): Individual {

  let best = population[0];
  let bestScore = fitness(best, start, end);

  population.forEach((individual) => {

    const score = fitness(individual, start, end);

    if (score < bestScore) {
      best = individual;
      bestScore = score;
    }

  });

  return best;
}