import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './i18n';

import MainLayout from './components/layout/MainLayout';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import GuidanceRoutes from './modules/guidance/routes'; // Module 2: Legal, Documents & Costs
import { PLACEHOLDERS } from './config/modules';

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <Router>
          <div className="flex min-h-screen flex-col bg-white text-slate-900">
            <Header />

            <MainLayout className="grow">
              <Routes>
                {/* Platform */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Module 2 - Legal, Documents & Costs (everything under /guidance) */}
                <Route path="/guidance/*" element={<GuidanceRoutes />} />

                {/*
                  Modules 1, 3, 4 and shared pages that are not merged yet. Each module owner: build your page,
                  add its <Route> here, then set `live: true` in src/config/modules.js to drop the placeholder.
                */}
                {PLACEHOLDERS.map((p) => (
                  <Route key={p.to} path={p.to} element={<ComingSoon />} />
                ))}

                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LangProvider>
  );
}

export default App;
