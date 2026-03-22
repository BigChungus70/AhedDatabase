import {
  Route,
  BrowserRouter as Router,
  Routes
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



function App() {
  return (
    <div className="App" dir="rtl" lang="ar">
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<Dashboard />} />
          <Route path="/families" element={<FamiliesPage />} />
          <Route path="/addFamily" element={<AddFamilyPage />} />
          <Route path="/families/edit/:code" element={<EditFamilyPage />} />
          <Route path="/lists" element={<SavedListsPage />} />
          <Route path="/lists/:id" element={<ListDetailPage />} />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;
