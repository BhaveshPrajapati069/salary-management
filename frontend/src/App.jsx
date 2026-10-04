import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import EmployeeEdit from "./pages/EmployeeEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/employees" replace />} />

        <Route path="/employees" element={<Employees />} />

        <Route path="/employees/:employeeId" element={<EmployeeDetails />} />
        <Route path="/employees/:employeeId/edit" element={<EmployeeEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
