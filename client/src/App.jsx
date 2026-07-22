import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyOtp from "./pages/Verify-Otp";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

import { useEffect } from "react";
import "./styles/scrollbar.css"

function App() {

  useEffect(() => {
    const disableContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", disableContextMenu);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route

        path="/reset-password"

        element={<ResetPassword />}

      />
      <Route
        path="/verify-otp"
        element={<VerifyOtp />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;