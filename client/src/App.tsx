import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import { nodes } from "./data/node";
import { runGA } from "./algorithms/geneticAlgorithm";

type Point = {
  lat: number;
  lng: number;
};

type RouteResponse = {
  route: Point[];
  distance: number;
};

function LocationSelector({
  start,
  end,
  setStart,
  setEnd,
}: {
  start: Point | null;
  end: Point | null;
  setStart: React.Dispatch<React.SetStateAction<Point | null>>;
  setEnd: React.Dispatch<React.SetStateAction<Point | null>>;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      if (!start) {
        setStart({ lat, lng });
      } else if (!end) {
        setEnd({ lat, lng });
      } else {
        setStart(null);
        setEnd(null);
      }
    },
  });

  return null;
}

function App() {

  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [serverStatus, setServerStatus] = useState("kontrol ediliyor...");

  const [algorithm, setAlgorithm] = useState("ga");
  const [population, setPopulation] = useState(50);
  const [generations, setGenerations] = useState(100);
  const [mutationRate, setMutationRate] = useState(0.05);
  const [tournamentSize, setTournamentSize] = useState(4);

  const [algoTime, setAlgoTime] = useState<number | null>(null);

  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const center: LatLngExpression = [39, 35];

  useEffect(() => {
    fetch("http://localhost:5000/health")
      .then((res) => res.json())
      .then((data: { ok: boolean }) => {
        if (data.ok) setServerStatus("backend çalışıyor");
        else setServerStatus("backend cevap verdi ama beklenen veri gelmedi");
      })
      .catch(() => {
        setServerStatus("backend'e bağlanılamadı");
      });
  }, []);

  const handleSendPoints = async () => {
    if (!start || !end) {
      alert("Lütfen önce başlangıç ve bitiş noktası seç.");
      return;
    }

    const response = await fetch("http://localhost:5000/api/route/find", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat]
        ]
      })
    });

    const data: RouteResponse = await response.json();

    const routePoints: [number, number][] = data.route.map(p => [p.lat, p.lng]);

    setRoute(routePoints);
  };

  const runGeneticAlgorithm = async () => {

    setAlgoTime(null);
    setDistanceKm(null);
    setRoute([]);

    if (!start || !end) {
      alert("Önce başlangıç ve bitiş noktası seç.");
      return;
    }

    if (algorithm !== "ga") {
      alert("Bu algoritma henüz eklenmedi.");
      return;
    }

    const startTime = performance.now();

    const bestRoute = runGA(start, end, {
      populationSize: population,
      generations: generations,
      mutationRate: mutationRate,
      tournamentSize: tournamentSize
    });

    const coordinates: [number, number][] = [];

    coordinates.push([start.lng, start.lat]);

    bestRoute.forEach((nodeId: number) => {

      const node = nodes.find(n => n.id === nodeId);

      if (node) {
        coordinates.push([node.lng, node.lat]);
      }

    });

    coordinates.push([end.lng, end.lat]);

    const response = await fetch("http://localhost:5000/api/route/find", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ coordinates })
    });

    const data: RouteResponse = await response.json();
    if (!data.route) {
      alert("Route bulunamadı");
      return;
    }
    setDistanceKm(data.distance / 1000);

    const routePoints: [number, number][] = data.route.map(p => [p.lat, p.lng]);

    setRoute(routePoints);

    const endTime = performance.now();
    setAlgoTime(endTime - startTime);
  };

  return (

    <div style={{ height: "100vh", width: "100%", position: "relative" }}>

      <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationSelector
          start={start}
          end={end}
          setStart={setStart}
          setEnd={setEnd}
        />

        {start && <Marker position={[start.lat, start.lng]} />}
        {end && <Marker position={[end.lat, end.lng]} />}

        {nodes.map(node => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            opacity={0.6}
          />
        ))}

        {route.length > 0 && (
          <Polyline positions={route} color="red" />
        )}

      </MapContainer>

      {/* Sol panel */}

      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}
      >

        <div>
          <strong>Server:</strong> {serverStatus}
        </div>

        <div>
          <strong>Start:</strong>{" "}
          {start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : "seçilmedi"}
        </div>

        <div>
          <strong>End:</strong>{" "}
          {end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : "seçilmedi"}
        </div>

        {distanceKm !== null && (
          <div>
            <strong>Mesafe:</strong> {distanceKm.toFixed(2)} km
          </div>
        )}

        {algoTime !== null && (
          <div>
            <strong>Algoritma Süresi:</strong> {algoTime.toFixed(2)} ms
          </div>
        )}

        <button onClick={handleSendPoints} style={{ marginTop: "10px" }}>
          ORS Route
        </button>

      </div>

      {/* Sağ panel */}

      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: "260px",
          background: "white",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}
      >

        <h3>Algoritma Paneli</h3>

        <div style={{ marginTop: "10px" }}>
          <label>Algoritma</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="ga">Genetic Algorithm</option>
            <option value="astar">A*</option>
            <option value="dijkstra">Dijkstra</option>
          </select>
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Population</label>
          <input
            type="number"
            value={population}
            onChange={(e) => setPopulation(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Generations</label>
          <input
            type="number"
            value={generations}
            onChange={(e) => setGenerations(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Mutation Rate</label>
          <input
            type="number"
            step="0.01"
            value={mutationRate}
            onChange={(e) => setMutationRate(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Tournament Size</label>
          <input
            type="number"
            value={tournamentSize}
            onChange={(e) => setTournamentSize(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <button
          onClick={runGeneticAlgorithm}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "8px",
            background: "#2ecc71",
            border: "none",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Route
        </button>

      </div>

    </div>

  );
}

export default App;