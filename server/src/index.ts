import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjY3ZGM3ZjM0ZWI4OTRkMDE5ZjEyOTdmMjZkYmU2MDNiIiwiaCI6Im11cm11cjY0In0=";

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.post("/api/route/find", async (req, res) => {
    const { coordinates } = req.body;
    if (!coordinates || !Array.isArray(coordinates)) {
        return res.status(400).json({ error: "coordinates gönderilmedi" });
    }
    try {
        const orsResponse = await fetch(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            {
                method: "POST",
                headers: {
                    Authorization: ORS_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    coordinates: coordinates,
                    radiuses: new Array(coordinates.length).fill(2000)
                })
            }
        );

        const data = await orsResponse.json();

        // DEBUG
        console.log("ORS STATUS:", orsResponse.status);
        console.log("ORS RESPONSE:", data);

        if (!orsResponse.ok) {
            return res.status(500).json({
                error: "OpenRouteService hata döndürdü",
                ors: data
            });
        }
        const distance = data.features[0].properties.summary.distance;
        const coords = data.features[0].geometry.coordinates;

        const route = coords.map((c: number[]) => ({
            lat: c[1],
            lng: c[0]
        }));

        res.json({ route, distance });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ error: "Route alınamadı" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});