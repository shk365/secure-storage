import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function useAutoLogout(showMessage) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000; // convert to ms

    const timeout = expiry - Date.now();

    if (timeout <= 0) {
      logout();
    } else {
      setTimeout(() => {
        showMessage("Session expired. Logging out...");
        setTimeout(logout, 2000); // wait 2s before logout
      }, timeout);
    }

    if (timeout > 30000) {
      setTimeout(() => {
        showMessage("Session expiring soon...");
      }, timeout - 30000);
    }

    function logout() {
      localStorage.removeItem("token");
      navigate("/");
      window.location.reload();
    }
  }, [navigate]);
}

export default useAutoLogout;