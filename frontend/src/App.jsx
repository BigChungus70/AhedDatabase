import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import AddFamilyPage from "./pages/AddFamilyPage";
import Dashboard from "./pages/Dashboard";
import EditFamilyPage from "./pages/EditFamilyPage";
import FamiliesPage from "./pages/FamiliesPage";
import ListDetailPage from "./pages/ListDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SavedListsPage from "./pages/SavedListsPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="App" dir="rtl" lang="ar">
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists"
            element={
              <ProtectedRoute>
                <SavedListsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists/:id"
            element={
              <ProtectedRoute>
                <ListDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/edit/:code"
            element={
              <ProtectedRoute minRole="Mid">
                <EditFamilyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/families"
            element={
              <ProtectedRoute minRole="High">
                <FamiliesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addFamily"
            element={
              <ProtectedRoute minRole="High">
                <AddFamilyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute minRole="Admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;
