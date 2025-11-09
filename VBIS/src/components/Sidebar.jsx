import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  LogIn, 
  Settings, 
  X, 
  User,
  Bell,
  HelpCircle,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Brain,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isDark, toggleTheme, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('vbis_authenticated');
    const userData = localStorage.getItem('vbis_user');
    
    if (auth === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, [isOpen]);

  const handleThemeToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('vbis_theme', newTheme);
    
    // Dispatch custom event for same-window communication
    window.dispatchEvent(new CustomEvent('themeChange', { detail: newTheme }));
    
    // Call the original toggleTheme
    toggleTheme();
  };

  const handleSignIn = () => {
    navigate('/signin');
    onClose();
  };

  const handleSignOut = () => {
    localStorage.removeItem('vbis_authenticated');
    localStorage.removeItem('vbis_user');
    setIsAuthenticated(false);
    setUser(null);
    onClose();
    navigate('/signin');
  };

  const handleViewProfile = () => {
    setShowProfile(true);
  };

  const sidebarItems = [
    {
      section: 'Account',
      items: isAuthenticated ? [
        // { icon: User, label: 'View Profile', action: handleViewProfile, color: 'violet' },
        { icon: LogOut, label: 'Sign Out', action: handleSignOut, color: 'red' }
      ] : [
        { icon: LogIn, label: 'Sign In', action: handleSignIn, color: 'violet' }
      ]
    },
    {
      section: 'Preferences',
      items: [
        { icon: Settings, label: 'Settings', action: () => setShowSettings(true), color: 'gray' },
        // { icon: Bell, label: 'Notifications', path: '/notifications', color: 'blue' },
        { icon: HelpCircle, label: 'Help & Support', path: '/contact', color: 'emerald' }
      ]
    }
  ];

  const settingsOptions = [
    { label: 'Language', value: 'English', options: ['English', 'Spanish', 'French', 'German'] },
    { label: 'Region', value: 'United States', options: ['United States', 'Europe', 'Asia', 'Other'] },
    { label: 'Data Privacy', value: 'Standard', options: ['Standard', 'Enhanced', 'Maximum'] },
    { label: 'Email Notifications', value: 'Enabled', options: ['Enabled', 'Disabled'] }
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
        } ${isDark ? 'bg-black/60' : 'bg-black/40'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDark 
            ? 'bg-gray-900 border-l border-gray-800' 
            : 'bg-white border-l border-gray-200'
        } shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDark 
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600' 
                    : 'bg-gradient-to-br from-indigo-600 to-blue-600'
                } shadow-lg`}>
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    VBIS
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Menu
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all ${
                  isDark 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Card (if authenticated) */}
            {isAuthenticated && user && (
              <div className={`p-4 rounded-xl ${
                isDark 
                  ? 'bg-gradient-to-br from-violet-600/10 to-purple-600/10 border border-violet-500/20' 
                  : 'bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } shadow-sm`}>
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </h3>
                    <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleViewProfile}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/15 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-900 shadow-sm'
                  }`}
                >
                  <span>View Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className={`w-full mt-4 p-4 rounded-xl transition-all flex items-center justify-between ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-750' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-violet-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-all ${
                isDark ? 'bg-violet-600' : 'bg-gray-300'
              } relative`}>
                <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-transform shadow-md ${
                  isDark ? 'translate-x-5.5' : 'translate-x-0.5'
                }`} />
              </div>
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {sidebarItems.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;

                    if (item.action) {
                      return (
                        <button
                          key={itemIndex}
                          onClick={item.action}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${
                            isDark 
                              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={itemIndex}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all group ${
                          isDark 
                            ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              VBIS v2.0 • © 2025
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className={`absolute inset-0 backdrop-blur-sm ${isDark ? 'bg-black/70' : 'bg-black/50'}`}
            onClick={() => setShowProfile(false)}
          />
          <div className={`relative w-full max-w-md rounded-2xl p-6 ${
            isDark 
              ? 'bg-gray-900 border border-gray-800' 
              : 'bg-white border border-gray-200'
          } shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Profile
              </h3>
              <button
                onClick={() => setShowProfile(false)}
                className={`p-2 rounded-lg transition-all ${
                  isDark 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className={`text-5xl w-20 h-20 rounded-2xl inline-flex items-center justify-center mb-3 ${
                isDark ? 'bg-gradient-to-br from-violet-600/20 to-purple-600/20' : 'bg-gradient-to-br from-indigo-100 to-violet-100'
              }`}>
                {user.avatar}
              </div>
              <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user.name}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {user.role}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: Mail, label: 'Email', value: user.email },
                { icon: Phone, label: 'Phone', value: user.phone },
                { icon: MapPin, label: 'Location', value: user.location },
                { icon: Calendar, label: 'Member Since', value: user.joinDate }
              ].map((detail, idx) => {
                const DetailIcon = detail.icon;
                return (
                  <div key={idx} className={`flex items-start space-x-3 p-3 rounded-lg ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    <DetailIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {detail.label}
                      </p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {detail.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowProfile(false)}
              className={`w-full mt-6 px-4 py-3 rounded-xl font-semibold transition-all ${
                isDark 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white' 
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white'
              } shadow-lg`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className={`absolute inset-0 backdrop-blur-sm ${isDark ? 'bg-black/70' : 'bg-black/50'}`}
            onClick={() => setShowSettings(false)}
          />
          <div className={`relative w-full max-w-md rounded-2xl p-6 ${
            isDark 
              ? 'bg-gray-900 border border-gray-800' 
              : 'bg-white border border-gray-200'
          } shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-lg transition-all ${
                  isDark 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {settingsOptions.map((option, index) => (
                <div key={index}>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </label>
                  <select
                    defaultValue={option.value}
                    className={`w-full px-4 py-2.5 rounded-lg transition-all ${
                      isDark 
                        ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-750 focus:border-violet-500' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 hover:bg-white focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-violet-500/20' : 'focus:ring-indigo-500/20'}`}
                  >
                    {option.options.map((opt, optIndex) => (
                      <option key={optIndex} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-750 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                  isDark 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white' 
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white'
                } shadow-lg`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;