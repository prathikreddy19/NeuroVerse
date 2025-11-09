// src/config.js (Vite projects only)
// Vite replaces import.meta.env at build time.

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
export const APP_NAME = 'VBIS';
