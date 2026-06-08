import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import DeviceDetail from "./pages/DeviceDetail";
import AlarmHistory from "./pages/AlarmHistory";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/device/:deviceId"
          element={
            <ProtectedRoute>
              <DeviceDetail />
            </ProtectedRoute>
          }
        />

        <Route path="/alarm-history" element={<AlarmHistory />} />

        
      </Routes>
    </BrowserRouter>
  );
}
