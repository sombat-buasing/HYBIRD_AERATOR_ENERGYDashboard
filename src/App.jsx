// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Dashboard from "./pages/Dashboard";
// import Login from "./pages/Login";
// import Reports from "./pages/Reports";
// import DeviceDetail from "./pages/DeviceDetail";

// export default function App() {
//   return (  
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />

//         <Route path="/" element={<Dashboard />} />

//         <Route path="/reports" element={<Reports />} />

//         <Route
//           path="/device/:deviceId"
//           element={<DeviceDetail />}
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import DeviceDetail from "./pages/DeviceDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/device/:deviceId"
          element={<DeviceDetail />}
        />

      </Routes>
    </BrowserRouter>
  );
}