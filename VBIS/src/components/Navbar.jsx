import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Home, Info, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Navbar = ({ isDark, toggleTheme }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home, id: 'home' },
    { path: '/about', label: 'About', icon: Info, id: 'about' },
    { path: '/patient', label: 'VBIS Inference', icon: Brain, id: 'vbt-inference' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${
        isDark 
          ? 'bg-gray-900/80 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      } backdrop-blur-md border-b transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/20' 
                  : 'bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-500/20'
              } group-hover:scale-110 group-hover:shadow-xl ${
                isDark ? 'group-hover:shadow-violet-500/30' : 'group-hover:shadow-indigo-500/30'
              }`}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  VBIS
                </span>
                <span className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Virtual Brain Intelligence System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? isDark
                          ? 'text-white bg-white/10'
                          : 'text-gray-900 bg-gray-100'
                        : isDark
                          ? 'text-gray-300 hover:text-white hover:bg-white/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {active && (
                      <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full ${
                        isDark ? 'bg-violet-500' : 'bg-indigo-600'
                      }`} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-3 pt-1">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? isDark
                          ? 'text-white bg-white/10'
                          : 'text-gray-900 bg-gray-100'
                        : isDark
                          ? 'text-gray-300 hover:text-white hover:bg-white/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Component */}
      <Sidebar 
        isDark={isDark} 
        toggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;