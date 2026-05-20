import { useEffect, useState } from "react";

import "../styles/IPFSStatus.css";
import {
    getNodeInfo,
    getPeers,
    getBandwidthStats
} from "../services/ipfsService";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    CartesianGrid,
} from "recharts";



function IPFSStatus() {

    const [node, setNode] = useState(null);

    const [peerCount, setPeerCount] = useState(0);

    const [bw, setBw] = useState(null);

    const [chartData, setChartData] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchData();

        // LIVE UPDATE EVERY 3 SECONDS
        const interval = setInterval(() => {

            fetchData();

        }, 3000);

        return () => clearInterval(interval);

    }, []);

    const fetchData = async () => {

        try {

            const nodeInfo =
                await getNodeInfo();

            const peers =
                await getPeers();

            const bandwidth =
                await getBandwidthStats();

            setNode(nodeInfo);

            setPeerCount(peers.length);

            setBw(bandwidth);

            // LIVE CHART
            setChartData((prev) => [

                ...prev.slice(-20),

                {
                    time:
                        new Date()
                            .toLocaleTimeString(),

                    in:
                        Number(
                            bandwidth.RateIn
                        ),

                    out:
                        -Number(
                            bandwidth.RateOut
                        )
                }

            ]);

            setLoading(false);

        } catch (err) {

            console.error(err);

            setLoading(false);

        }
    };

    // NETWORK GAUGE %
    const incomingPercent =
        bw
            ? Math.min(
                (Number(bw.RateIn) / 500000) * 100,
                100
            )
            : 0;

    const outgoingPercent =
        bw
            ? Math.min(
                (Number(bw.RateOut) / 500000) * 100,
                100
            )
            : 0;

    return (

        <div className="ipfs-status-page">

            {/* LOADING */}
            {loading && (

                <div className="loading-box">
                    Loading...
                </div>

            )}

            {/* HEADER */}
            {node && (

                <div className="ipfs-status-wrapper">

                    <div className="status-header">

                        <h1 className="status-title">
                            Connected to IPFS
                        </h1>

                        <p className="status-subtitle">
                            Hosting decentralized data —
                            Discovered {peerCount} peers
                        </p>

                    </div>

                    {/* STATUS CARDS */}
                    <div className="status-grid">

                        <div className="status-card">

                            <div className="status-label">
                                Peer ID
                            </div>

                            <div
                                className="status-value"
                                title={node.ID}
                            >
                                {node.ID}
                            </div>

                        </div>

                        <div className="status-card">

                            <div className="status-label">
                                Agent Version
                            </div>

                            <div className="status-value" title={node.AgentVersion}>
                                {node.AgentVersion}
                            </div>

                        </div>

                        <div className="status-card">

                            <div className="status-label">
                                Connected Peers
                            </div>

                            <div className="status-value" title={peerCount}>
                                {peerCount}
                            </div>

                        </div>

                    </div>

                    {/* BANDWIDTH PANEL */}
                    <div className="status-panel">

                        <h2
                            style={{
                                marginBottom: "20px"
                            }}
                        >
                            Bandwidth Over Time (Bytes/s)
                        </h2>

                        {/* TRAFFIC CHART */}
                        <div
                            style={{
                                width: "100%",
                                height: 320
                            }}
                        >

                            <ResponsiveContainer>

                                <AreaChart
                                    data={chartData}
                                >

                                    <XAxis
                                        dataKey="time"
                                        hide
                                    />

                                    <YAxis />

                                    <Tooltip />

                                    <Area
                                        type="monotone"
                                        dataKey="in"
                                        stroke="#06b6d4"
                                        fill="#06b6d4"
                                        fillOpacity={0.4}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="out"
                                        stroke="#f59e0b"
                                        fill="#f59e0b"
                                        fillOpacity={0.4}
                                    />

                                </AreaChart>

                            </ResponsiveContainer>

                        </div>
                        <div className="traffic-legend">

                            <div className="legend-item">

                                <div className="legend-color incoming-color"></div>

                                <span>Incoming</span>

                            </div>

                            <div className="legend-item">

                                <div className="legend-color outgoing-color"></div>

                                <span>Outgoing</span>

                            </div>

                        </div>

                        {/* NETWORK GAUGES */}
                        <h2
                            style={{
                                marginBottom: "20px"
                            }}
                        >
                            Network Traffic
                        </h2>
                        <div className="bandwidth-grid">

                            {/* INCOMING */}
                            <div className="bandwidth-card">

                                <div
                                    style={{
                                        position: "relative",
                                        width: "180px",
                                        height: "180px",
                                        margin: "0 auto"
                                    }}
                                >

                                    <svg
                                        width="180"
                                        height="180"
                                    >

                                        <circle
                                            cx="90"
                                            cy="90"
                                            r="70"
                                            stroke="#e2e8f0"
                                            strokeWidth="14"
                                            fill="none"
                                        />

                                        <circle
                                            cx="90"
                                            cy="90"
                                            r="70"
                                            stroke="#06b6d4"
                                            strokeWidth="14"
                                            fill="none"
                                            strokeDasharray={440}
                                            strokeDashoffset={
                                                440 -
                                                (
                                                    incomingPercent /
                                                    100
                                                ) * 440
                                            }
                                            strokeLinecap="round"
                                            transform="rotate(-90 90 90)"
                                        />

                                    </svg>

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

                                        <div
                                            className="bandwidth-value"
                                        >
                                            {bw
                                                ? Number(
                                                    bw.RateIn
                                                ).toFixed(2)
                                                : 0}
                                        </div>

                                        <div
                                            className="bandwidth-label"
                                        >
                                            Incoming B/s
                                        </div>

                                    </div>

                                </div>
                                <div className="legend-item">

                                    <div className="legend-color incoming-color"></div>

                                    <span>Incoming</span>

                                </div>

                            </div>



                            {/* OUTGOING */}
                            <div className="bandwidth-card">

                                <div
                                    style={{
                                        position: "relative",
                                        width: "180px",
                                        height: "180px",
                                        margin: "0 auto"
                                    }}
                                >

                                    <svg
                                        width="180"
                                        height="180"
                                    >

                                        <circle
                                            cx="90"
                                            cy="90"
                                            r="70"
                                            stroke="#e2e8f0"
                                            strokeWidth="14"
                                            fill="none"
                                        />

                                        <circle
                                            cx="90"
                                            cy="90"
                                            r="70"
                                            stroke="#f59e0b"
                                            strokeWidth="14"
                                            fill="none"
                                            strokeDasharray={440}
                                            strokeDashoffset={
                                                440 -
                                                (
                                                    outgoingPercent /
                                                    100
                                                ) * 440
                                            }
                                            strokeLinecap="round"
                                            transform="rotate(-90 90 90)"
                                        />

                                    </svg>

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

                                        <div
                                            className="bandwidth-value"
                                        >
                                            {bw
                                                ? Number(
                                                    bw.RateOut
                                                ).toFixed(2)
                                                : 0}
                                        </div>

                                        <div
                                            className="bandwidth-label"
                                        >
                                            Outgoing B/s
                                        </div>

                                    </div>

                                </div>
                                <div className="legend-item">

                                    <div className="legend-color outgoing-color"></div>

                                    <span>Outgoing</span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default IPFSStatus;