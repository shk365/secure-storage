import axios from "axios";

const IPFS_API = "http://127.0.0.1:5001/api/v0";

export const getNodeInfo = async () => {
    const res = await axios.post(`${IPFS_API}/id`);
    return res.data;
};

export const getPeers = async () => {
    const res = await axios.post(`${IPFS_API}/swarm/peers?verbose=true`);
    return res.data.Peers;
};

export const getBandwidthStats = async () => {
    const res = await axios.post(`${IPFS_API}/stats/bw`);
    return res.data;
};