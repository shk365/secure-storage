import { useParams } from "react-router-dom";
import { useEffect } from "react";

function SharedFile() {

    const { token } = useParams();

    useEffect(() => {

        window.location.href =
            `http://127.0.0.1:5000/file/shared/${token}`;

    }, [token]);

    return (

        <div
            style={{
                padding: "40px",
                textAlign: "center"
            }}
        >
            Opening shared file...
        </div>

    );
}

export default SharedFile;