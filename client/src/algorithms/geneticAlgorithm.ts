import { generatePopulation } from "./population";
import { bestIndividual } from "./best";
import { tournamentSelection } from "./selection";
import { crossover } from "./crossover";
import { mutate } from "./mutation";
import type { Individual } from "./types";

type Point = {
  lat: number;
  lng: number;
};

type GAOptions = {
  populationSize: number;
  generations: number;
  mutationRate: number;
  tournamentSize: number;
};

export function runGA(
  start: Point,
  end: Point,
  options: GAOptions
): Individual {

  let population = generatePopulation(options.populationSize);

  for (let generation = 0; generation < options.generations; generation++) {

    const newPopulation: Individual[] = [];

    while (newPopulation.length < options.populationSize) {

      const parent1 = tournamentSelection(
        population,
        start,
        end,
        options.tournamentSize
      );

      const parent2 = tournamentSelection(
        population,
        start,
        end,
        options.tournamentSize
      );

      let child = crossover(parent1, parent2);

      child = mutate(child, options.mutationRate);

      newPopulation.push(child);
    }

    population = newPopulation;
  }

  return bestIndividual(population, start, end);
}