import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import TransactionList from "./pages/TransactionList";
import TransactionDetail from "./pages/TransactionDetail";
import ContactProfile from "./pages/ContactProfile";
import Settings from "./pages/Settings";
import TaskBoard from "./pages/TaskBoard";

import { InspectionFooter } from "./components/InspectionFooter";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/transactions/:id" element={<TransactionDetail />} />
        <Route path="/contacts/:id" element={<ContactProfile />} />
        <Route path="/tasks" element={<TaskBoard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/transactions" replace />} />
      </Routes>

      <InspectionFooter />
    </BrowserRouter>
  );
}
