import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import FraudChecker from './pages/FraudChecker';
import FraudAwarenessHub from "./pages/FraudAwarenessHub";
import Component4AdminDemo from "./pages/Component4AdminDemo";

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/fraud-checker" element={<FraudChecker />} />
            <Route path="/fraud-awareness" element={<FraudAwarenessHub />} />
            <Route path="/component4-admin-demo"element={<Component4AdminDemo />}/>
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
