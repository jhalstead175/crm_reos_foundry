import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import TransactionList from "./pages/TransactionList";
import TransactionDetail from "./pages/TransactionDetail";
import ContactsList from "./pages/ContactsList";
import ContactProfile from "./pages/ContactProfile";
import Settings from "./pages/Settings";
import TaskBoard from "./pages/TaskBoard";

import { InspectionFooter } from "./components/InspectionFooter";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/transactions/:id" element={<TransactionDetail />} />
        <Route path="/contacts" element={<ContactsList />} />
        <Route path="/contacts/:id" element={<ContactProfile />} />
        <Route path="/tasks" element={<TaskBoard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <InspectionFooter />
    </BrowserRouter>
  );
}
