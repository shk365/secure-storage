import { useEffect, useState } from "react";
import "../styles/IPFSPeers.css";

import {
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from "react-simple-maps";

const geoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function IPFSPeers() {

    const [peers, setPeers] = useState([]);

    const [countries, setCountries] = useState([]);

    const [peerCountries, setPeerCountries] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchPeers();

        // LIVE UPDATES
        const interval = setInterval(() => {

            fetchPeers();

        }, 15000);

        return () => clearInterval(interval);

    }, []);

    const fetchPeers = async () => {

        try {

            setLoading(true);

            const res = await fetch(
                "http://127.0.0.1:5001/api/v0/swarm/peers?verbose=true",
                {
                    method: "POST"
                }
            );

            const data = await res.json();

            const peerList = data.Peers || [];

            setPeers(peerList);

            const countryMap = {};

            const peerDetails = [];

            const selectedPeers =
                peerList.slice(0, 30);

            await Promise.all(

                selectedPeers.map(async (peer) => {

                    try {

                        const addr = peer.Addr;

                        const ip4Match =
                            addr.match(/ip4\/([0-9.]+)/);

                        if (!ip4Match) return;

                        const ip = ip4Match[1];

                        // Skip private/local IPs
                        if (
                            ip.startsWith("127.") ||
                            ip.startsWith("192.168") ||
                            ip.startsWith("10.") ||
                            ip.startsWith("172.")
                        ) {
                            return;
                        }

                        const geoRes = await fetch(
                            `http://127.0.0.1:5000/api/ipfs/geolocation/${ip}`
                        );

                        const geo = await geoRes.json();

                        let country = "Unknown";

                        let lon =
                            Math.random() * 360 - 180;

                        let lat =
                            Math.random() * 180 - 90;

                        if (geo.lat && geo.lon) {

                            country =
                                geo.country || "Unknown";

                            lon = geo.lon;

                            lat = geo.lat;
                        }

                        // COUNTRY GROUPING
                        if (!countryMap[country]) {

                            countryMap[country] = {
                                country,
                                count: 0,
                                coordinates: [
                                    lon,
                                    lat
                                ]
                            };
                        }

                        countryMap[country].count += 1;

                        // PEER DETAILS
                        peerDetails.push({
                            ...peer,
                            country
                        });

                        // LIVE UPDATE UI
                        setCountries(
                            Object.values({
                                ...countryMap
                            })
                        );

                        setPeerCountries([
                            ...peerDetails
                        ]);

                    } catch (err) {

                        console.log(err);

                    }
                })

            );

            setLoading(false);

        } catch (err) {

            console.error(err);

            setLoading(false);

        }
    };

    return (

        <div className="ipfs-peers-page">

            <div className="ipfs-content-wrapper">

                {/* LOADING INDICATOR */}
                {loading && (

                    <div
                        className="loader-box"
                    >
                        Loading<span className="dots"></span>
                    </div>

                )}

                {/* MAP SECTION */}
                <div
                    className="map-container"
                >

                    <ComposableMap
                        projectionConfig={{
                            scale: 200
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
                                        fill="#e2e8f0"
                                        stroke="#cbd5e1"
                                        strokeWidth={0.5}
                                    />
                                ))
                            }
                        </Geographies>

                        {countries.map((country, index) => (

                            <Marker
                                key={index}
                                coordinates={
                                    country.coordinates
                                }
                            >

                                <circle
                                    r={
                                        6 +
                                        country.count * 2
                                    }
                                    fill="#3b82f6"
                                    fillOpacity={0.7}
                                    stroke="#1d4ed8"
                                    strokeWidth={2}
                                />

                                <text
                                    textAnchor="middle"
                                    y={-15}
                                    style={{
                                        fontSize: "10px",
                                        fill: "#111827",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {country.count}
                                </text>

                            </Marker>

                        ))}

                    </ComposableMap>

                    {/* CENTER STATUS */}
                    <div
                        className="peer-center-status"
                    >

                        <h1
                            className="peer-count"
                        >
                            {peers.length}
                        </h1>

                        <p
                            className="peer-title"
                        >
                            PEERS
                        </p>

                        <p
                            className="peer-subtitle"
                        >
                            {countries.length} countries connected
                        </p>

                    </div>

                </div>

                {/* COUNTRY STATS */}
                <div className="mb-6">

                    <h2 className="text-xl font-bold mb-3">
                        Peer Distribution
                    </h2>

                    <div className="country-grid">

                        {countries.map((country, index) => (

                            <div
                                key={index}
                                className="country-card"
                            >

                                <div className="country-name">
                                    {country.country}
                                </div>

                                <div className="country-peers">
                                    {country.count} peers
                                </div>

                            </div>

                        ))}

                    </div>

                </div>

                {/* PEERS TABLE */}
                <div className="peer-table-wrapper">

                    <table className="peer-table">

                        <thead>

                            <tr className="bg-gray-100">

                                <th className="p-2 border">
                                    Peer ID
                                </th>

                                <th className="p-2 border">
                                    Address
                                </th>

                                <th className="p-2 border">
                                    Country
                                </th>

                                <th className="p-2 border">
                                    Direction
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {peerCountries.map((peer, index) => (

                                <tr key={index}>

                                    <td className="p-2 border text-xs">
                                        {peer.Peer}
                                    </td>

                                    <td className="p-2 border text-xs">
                                        {peer.Addr}
                                    </td>

                                    <td className="p-2 border text-xs">
                                        {peer.country}
                                    </td>

                                    <td className="p-2 border text-xs">
                                        {peer.Direction}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

                {/* SPIN ANIMATION */}
                <style>
                    {`
                    @keyframes spin {

                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}
                </style>

            </div>
        </div>
    );
}

export default IPFSPeers;