import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import About from './components/About';
import PatientDashboard from './components/PatientDashboard';
import SignInPage from './components/SignInPage';
import Contact from './components/Contact';
import './index.css';


import './App.css';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`app-container ${isDark ? 'dark' : 'light'}`}>
        <Navbar 
          isDark={isDark} 
          toggleTheme={toggleTheme}
          onOpenSidebar={openSidebar}
        />
        
        <Sidebar
          isDark={isDark}
          toggleTheme={toggleTheme}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        <Routes>
          <Route path="/" element={<LandingPage isDark={isDark} />} />
          <Route path="/about" element={<About isDark={isDark} />} />
          {/* Protected Route - Requires Sign In */}
          <Route 
            path="/patient" 
            element={
              <ProtectedRoute>
                <PatientDashboard isDark={isDark} />
              </ProtectedRoute>
            } 
          />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/contact" element={<Contact isDark={isDark} />} />
        </Routes>
    </div>
  );
}

export default App;