import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import TransactionList from "./pages/TransactionList";
import TransactionDetail from "./pages/TransactionDetail";
import ContactsList from "./pages/ContactsList";
import ContactProfile from "./pages/ContactProfile";
import PropertySearch from "./pages/PropertySearch";
import Settings from "./pages/Settings";
import TaskBoard from "./pages/TaskBoard";

import MainLayout from "./components/MainLayout";
import { InspectionFooter } from "./components/InspectionFooter";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes without layout */}
        <Route path="/about" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes with layout */}
        <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/transactions" element={<MainLayout><TransactionList /></MainLayout>} />
        <Route path="/transactions/:id" element={<MainLayout><TransactionDetail /></MainLayout>} />
        <Route path="/contacts" element={<MainLayout><ContactsList /></MainLayout>} />
        <Route path="/contacts/:id" element={<MainLayout><ContactProfile /></MainLayout>} />
        <Route path="/properties" element={<MainLayout><PropertySearch /></MainLayout>} />
        <Route path="/tasks" element={<MainLayout><TaskBoard /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <InspectionFooter />
    </BrowserRouter>
  );
}
