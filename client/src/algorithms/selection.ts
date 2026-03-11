import type { Individual } from "./types";
import { fitness } from "./fitness";

type Point = {
  lat: number;
  lng: number;
};

export function tournamentSelection(
  population: Individual[],
  start: Point,
  end: Point,
  tournamentSize: number
): Individual {

  const tournament: Individual[] = [];

  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    tournament.push(population[randomIndex]);
  }

  let best = tournament[0];
  let bestScore = fitness(best, start, end);

  tournament.forEach((individual) => {
    const score = fitness(individual, start, end);

    if (score < bestScore) {
      best = individual;
      bestScore = score;
    }
  });

  return best;
}