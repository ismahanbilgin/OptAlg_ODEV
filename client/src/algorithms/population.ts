import { nodes } from "../data/node";
import type { Individual } from "./types";

function shuffle(arr: number[]): number[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generatePopulation(size: number): Individual[] {
  const nodeIds: number[] = nodes.map((n: { id: number }) => n.id);

  const population: Individual[] = [];

  for (let i = 0; i < size; i++) {
    const route: Individual = shuffle(nodeIds).slice(0, 3);
    population.push(route);
  }

  return population;
}