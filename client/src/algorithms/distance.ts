export type Point = {
  lat: number;
  lng: number;
};

export function distance(a: Point, b: Point): number {

  const R = 6371; // Dünya yarıçapı (km)

  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;

  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) *
    Math.cos(lat1) * Math.cos(lat2);

  const d = 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return d;
}