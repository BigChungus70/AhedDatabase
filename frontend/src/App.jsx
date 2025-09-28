import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FamiliesPage from "./pages/FamiliesPage";
import EditFamilyPage from "./pages/EditFamilyPage";
import SavedListsPage from "./pages/SavedListsPage";
import ListDetailPage from "./pages/ListDetailPage";
import "./App.css";
import { ToastContainer } from "react-toastify";
import { authAPI } from "./services/api";
import AddFamilyPage from "./pages/AddFamilyPage";

// Simple auth check component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="App" dir="rtl" lang="ar">
      <Router>
        <Routes>
          {/* Public routes - redirect to dashboard if logged in */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/families"
            element={
              <ProtectedRoute>
                <FamiliesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addFamily"
            element={
              <ProtectedRoute>
                <AddFamilyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/edit/:code"
            element={
              <ProtectedRoute>
                <EditFamilyPage />
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
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;
