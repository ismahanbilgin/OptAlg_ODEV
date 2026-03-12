import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import { nodes } from "./data/node";
import { runGA } from "./algorithms/geneticAlgorithm";

import { CircleMarker, Tooltip } from "react-leaflet";

type Point = {
  lat: number;
  lng: number;
};

type RouteResponse = {
  route: Point[];
  distance: number;
};

function findCity(point: Point | null) {
  if (!point) return "Seçilmedi";

  const city = nodes.find(
    n => n.lat === point.lat && n.lng === point.lng
  );

  return city ? city.name : "Seçilmedi";
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
  const [directRoute, setDirectRoute] = useState<[number, number][]>([]);
  const [directDistance, setDirectDistance] = useState<number | null>(null);

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
    if (!data.route) {
      alert("Route bulunamadı");
      return;
    }

    const routePoints: [number, number][] = data.route.map(p => [p.lat, p.lng]);

    setRoute(routePoints);
    setDirectRoute(routePoints);
    setDirectDistance(data.distance / 1000);
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

      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        maxBounds={[
          [35.8, 25.6],
          [42.2, 45.0]
        ]}
        maxBoundsViscosity={1.0}
        minZoom={6}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {start && (
          <CircleMarker
            center={[start.lat, start.lng]}
            radius={5}
            pathOptions={{ color: "#E30A17", fillColor: "#E30A17", fillOpacity: 1 }}
          >
            <Tooltip>Başlangıç</Tooltip>
          </CircleMarker>
        )}

        {end && (
          <CircleMarker
            center={[end.lat, end.lng]}
            radius={5}
            pathOptions={{ color: "#E30A17", fillColor: "#E30A17", fillOpacity: 1 }}
          >
            <Tooltip>Bitiş</Tooltip>
          </CircleMarker>
        )}

        {nodes.map(node => (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={4}
            pathOptions={{
              color: "#30d5c8",
              fillColor: "#077376",
              fillOpacity: 1
            }}
            eventHandlers={{
              click: () => {

                if (!start) {
                  setStart({ lat: node.lat, lng: node.lng });
                }
                else if (!end) {
                  setEnd({ lat: node.lat, lng: node.lng });
                }
                else {
                  setStart({ lat: node.lat, lng: node.lng });
                  setEnd(null);
                }

              }
            }}
          >
            <Tooltip>{node.name}</Tooltip>
          </CircleMarker>
        ))}

        {route.length > 0 && (
          <Polyline positions={route} color="#ffffff" weight={3} />
        )}

        {directRoute.length > 0 && (
          <Polyline positions={directRoute} color="#ea0909" weight={3} />
        )}

      </MapContainer>


      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "70px",
          background: "#0b1320",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 2000,
          boxShadow: "0 2px 10px rgba(0,0,0,0.4)"
        }}
      >
        {/* Sol taraf */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>
            OPTİMİZASYON ALGORİTMALARI
          </span>
          <span style={{ fontSize: "12px", color: "#4da3ff" }}>
            ROTA OPTİMİZASYONU
          </span>
        </div>

        {/* Orta kontrol paneli */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            background: "#111c2e",
            padding: "10px 20px",
            borderRadius: "12px"
          }}
        >
          <span>başlangıç:</span>
          <div
            style={{
              background: "#0b1320",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #333",
              minWidth: "120px",
              textAlign: "center"
            }}
          >
            {findCity(start)}
          </div>

          <span>→</span>

          <span>bitiş:</span>
          <div
            style={{
              background: "#0b1320",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #333",
              minWidth: "120px",
              textAlign: "center"
            }}
          >
            {findCity(end)}
          </div>

          {/*
          <span>Süre:</span>
          {algoTime !== null && (
            <div>
              <strong>Algoritma Süresi:</strong> {algoTime.toFixed(2)} ms
            </div>
          )}
           */}
          <button
            onClick={handleSendPoints}
            style={{
              background: "#1e63ff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer"
            }}

          >
            Başlat
          </button>
        </div>

        {/* Sağ taraf */}
        <div
          style={{
            background: "#111c2e",
            padding: "8px 14px",
            borderRadius: "10px",
            fontSize: "13px"
          }}
        >
          bişeyler eklerim belki...
        </div>
      </div>

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

        {directDistance !== null && (
          <div>
            <strong>Direct Route:</strong> {directDistance.toFixed(2)} km
          </div>
        )}

        {distanceKm !== null && directDistance !== null && (
          <div>
            <strong>Improvement:</strong>{" "}
            {(((directDistance - distanceKm) / directDistance) * 100).toFixed(2)} %
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
            <option value="ga">Genetik Algoritma</option>
            <option value="astar">Benzetilmiş Tavlama </option>
            <option value="dijkstra">Tabu Arama</option>
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