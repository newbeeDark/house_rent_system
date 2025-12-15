import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { PropertyDetails } from './pages/PropertyDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Profile } from './pages/Profile';
import { Applications } from './pages/Applications';
import { CreateListing } from './pages/CreateListing';
import { Favorites } from './pages/Favorites';
import { Messages } from './pages/Messages';
import { ContractReport } from './pages/ContractReport';
import { PlaceholderPage } from './pages/Placeholder';
import { Diagnostics } from './pages/Diagnostics';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/create-listing" element={<CreateListing />} />

          <Route path="/favorites" element={<Favorites />} />
          <Route path="/contract/:id" element={<ContractReport />} />
          <Route path="/host-dashboard" element={<PlaceholderPage title="Landlord Dashboard" />} />
          <Route path="/agent-dashboard" element={<PlaceholderPage title="Agent Dashboard" />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/diagnostics" element={<Diagnostics />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
