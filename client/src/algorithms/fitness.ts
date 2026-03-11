import { nodes } from "../data/node";
import type { Individual } from "./types";
import { distance } from "./distance";

type Point = {
  lat: number;
  lng: number;
};

export function fitness(
  individual: Individual | undefined,
  start: Point,
  end: Point
): number {

  if (!individual || individual.length === 0) {
    return Infinity;
  }

  let totalDistance = 0;

  let previousPoint: Point = start;

  for (const nodeId of individual) {

    const node = nodes.find((n) => n.id === nodeId);

    if (!node) continue;

    totalDistance += distance(previousPoint, node);

    previousPoint = node;
  }

  totalDistance += distance(previousPoint, end);

  return totalDistance;
}