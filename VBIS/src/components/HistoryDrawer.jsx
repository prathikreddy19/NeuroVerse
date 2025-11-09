"use client";

import React, { useEffect, useState } from "react";
import { History, X } from "lucide-react";

const HistoryDrawer = ({ isDark, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        // ✅ Wait for browser context + retry until token found
        let token = null;
        for (let i = 0; i < 15; i++) {
          token = window?.localStorage?.getItem("vbis_token");

          console.log(`[Token attempt ${i}]`, token ? "✅ Found" : "❌ Missing");

          console.log("🧩 Token from localStorage:", token);

          if (token) break;
          await new Promise((r) => setTimeout(r, 200));
        }

        if (!isMounted) return;
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        console.log("🧠 Using token:", token.slice(0, 25) + "...");

        const res = await fetch("http://localhost:5000/api/predict/history", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log("📜 History response:", data);

        if (res.ok && data?.history) {
          setHistory(data.history);
        } else {
          setError(data?.message || "Failed to load history");
        }
      } catch (err) {
        console.error("❌ Error loading history:", err);
        setError("Error Loading History");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Start fetching after short delay to ensure hydration
    const timer = setTimeout(fetchHistory, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`fixed right-0 top-0 h-full w-[380px] z-50 shadow-2xl backdrop-blur-md border-l overflow-y-auto 
        animate-slideInRight ${
          isDark
            ? "bg-slate-900/80 border-slate-800 text-white"
            : "bg-white/80 border-gray-200 text-gray-900"
        }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isDark ? "border-slate-700/40" : "border-gray-200"
        }`}
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <History className="w-5 h-5 text-purple-400" /> Prediction History
        </h2>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg transition ${
            isDark ? "hover:bg-slate-700/40" : "hover:bg-gray-100"
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 animate-fadeIn">
        {loading ? (
          <p className="text-center text-slate-400">Loading...</p>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>No previous predictions found.</p>
          </div>
        ) : (
          history
            .slice()
            .reverse()
            .map((entry, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition hover:scale-[1.01] animate-fadeInUp ${
                  isDark
                    ? "border-slate-700 hover:bg-slate-800/70"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs opacity-70">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    <p className="font-semibold">{entry.subjectId}</p>
                    <p className="text-xs opacity-60">
                      {entry.parcellationType}
                    </p>
                  </div>
                  <div className="text-right">
                    {/* use 'entry' (not 'item') and guard metrics */}
                    <p className="text-sm font-bold text-purple-400">
                      {entry.metrics?.meanFiringRate
                        ? Number(entry.metrics.meanFiringRate).toFixed(2)
                        : "N/A"}
                    </p>
                    <p className="text-sm font-bold text-indigo-400">
                      {entry.metrics?.meanMembranePotential
                        ? Number(entry.metrics.meanMembranePotential).toFixed(2)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
          .animate-slideInRight { animation: slideInRight 0.4s ease-out; }
          .animate-fadeInUp { animation: fadeInUp 0.4s ease-out; }
        `}
      </style>
    </div>
  );
};

export default HistoryDrawer;
