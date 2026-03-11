export type NodePoint = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

export const nodes: NodePoint[] = [
  { id: 1, name: "Çorum", lat: 40.5506, lng: 34.9556 },
  { id: 2, name: "Yozgat", lat: 39.82, lng: 34.8086 },
  { id: 3, name: "Kayseri", lat: 38.7312, lng: 35.4787 },
  { id: 4, name: "Aksaray", lat: 38.3687, lng: 34.036 },
  { id: 5, name: "Kırşehir", lat: 39.1458, lng: 34.1605 },
  { id: 6, name: "Sivas", lat: 39.75, lng: 37.0167 },
  { id: 7, name: "Tokat", lat: 40.3167, lng: 36.55 },
  { id: 8, name: "Niğde", lat: 37.9667, lng: 34.6833 }
];