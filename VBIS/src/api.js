// src/api.js

// ---------------------------
// 🌐 Base Configuration
// ---------------------------
const API_BASE = "http://localhost:5000/api";

// ---------------------------
// 🧍 Auth APIs
// ---------------------------

// Signup new user
export const signupUser = async (userData) => {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (err) {
    console.error("❌ Signup error:", err);
    return { error: "Server error" };
  }
};

export const signinUser = async (userData) => {
  try {
    const res = await fetch(`${API_BASE}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("vbis_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (err) {
    console.error("❌ Signin error:", err);
    return { error: "Server error" };
  }
};

// ---------------------------
// Protected APIs
// ---------------------------
export const saveInference = async (inferenceData) => {
  try {
    const token = localStorage.getItem("vbis_token");
    if (!token) throw new Error("No authentication token found");

    const res = await fetch(`${API_BASE}/inference/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(inferenceData),
    });

    return await res.json();
  } catch (err) {
    console.error("❌ Inference save error:", err);
    return { error: err.message || "Server error" };
  }
};

export const getPredictHistory = async () => {
  try {
    const token = localStorage.getItem("vbis_token");
    if (!token) throw new Error("No authentication token found");

    const res = await fetch(`${API_BASE}/predict/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.status === 401) {
      console.warn("⚠️ Unauthorized or expired token. Logging out...");
      logoutUser();
      return { error: "Session expired. Please sign in again." };
    }

    return data;
  } catch (err) {
    console.error("❌ Fetch history error:", err);
    return { error: err.message || "Server error" };
  }
};

// ---------------------------
// Utility
// ---------------------------
export const logoutUser = () => {
  localStorage.removeItem("vbis_token");
  localStorage.removeItem("user");
  console.log("👋 Logged out user and cleared localStorage.");
};
