import { useEffect, useState } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from "react-simple-maps";

const geoUrl =
    "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

function PeerMap() {
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        fetchPeers();
    }, []);

    const fetchPeers = async () => {
        try {
            const res = await fetch(
                "http://127.0.0.1:5001/api/v0/swarm/peers?verbose=true",
                {
                    method: "POST"
                }
            );

            const data = await res.json();

            const peers = data.Peers || [];

            const locations = [];

            for (const peer of peers.slice(0, 40)) {
                try {
                    const addr = peer.Addr;

                    const ipMatch =
                        addr.match(/ip4\/([0-9.]+)/);

                    if (!ipMatch) continue;

                    const ip = ipMatch[1];

                    // Skip local/private IPs
                    if (
                        ip.startsWith("127.") ||
                        ip.startsWith("192.168") ||
                        ip.startsWith("10.")
                    ) {
                        continue;
                    }

                    const geoRes = await fetch(
                        `http://127.0.0.1:5000/api/ipfs/geolocation/${ip}`
                    );

                    const geo = await geoRes.json();

                    if (geo.lat && geo.lon) {
                        locations.push({
                            ip: ip,
                            coordinates: [
                                geo.lon,
                                geo.lat
                            ]
                        });
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            setMarkers(prev => {
                const existing = new Map(
                    prev.map(marker => [marker.ip, marker])
                );

                locations.forEach(marker => {
                    existing.set(marker.ip, marker);
                });

                return Array.from(existing.values());
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                height: "600px",
                background: "#ffffff",
                position: "relative",
                overflow: "hidden",
                borderRadius: "12px",
                marginBottom: "40px"
            }}
        >
            <ComposableMap
                projectionConfig={{
                    scale: 150
                }}
                style={{
                    width: "100%",
                    height: "100%"
                }}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#989898"
                                stroke="#989898"
                                strokeWidth={0.5}
                            />
                        ))
                    }
                </Geographies>

                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        coordinates={
                            marker.coordinates
                        }
                    >
                        <circle
                            r={6}
                            fill="#60a5fa"
                            stroke="#2563eb"
                            strokeWidth={2}
                        />
                    </Marker>
                ))}
            </ComposableMap>

            {/* CENTER PEER COUNT */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform:
                        "translate(-50%, -50%)",
                    textAlign: "center"
                }}
            >
                <h1
                    style={{
                        fontSize: "72px",
                        margin: 0,
                        fontWeight: "700"
                    }}
                >
                    {markers.length}
                </h1>

                <p
                    style={{
                        fontSize: "28px",
                        color: "#64748b",
                        margin: 0,
                        fontWeight: "600"
                    }}
                >
                    PEERS
                </p>
            </div>
        </div>
    );
}

export default PeerMap;