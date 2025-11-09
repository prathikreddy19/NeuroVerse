"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Activity,
  Download,
  FileText,
  BarChart3,
  Upload,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import HistoryDrawer from "./HistoryDrawer";

const NeuronCanvas = ({ isDark }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const neurons = [];
    const numNeurons = 200;
    const connectionDistance = 150;

    class Neuron {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 2.5 + 1;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? "rgba(139, 92, 246, 0.6)"
          : "rgba(99, 102, 241, 0.5)";
        ctx.fill();
      }
    }

    for (let i = 0; i < numNeurons; i++) neurons.push(new Neuron());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < neurons.length; i++) {
        neurons[i].update();
        neurons[i].draw();

        for (let j = i + 1; j < neurons.length; j++) {
          const dx = neurons[i].x - neurons[j].x;
          const dy = neurons[i].y - neurons[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(neurons[i].x, neurons[i].y);
            ctx.lineTo(neurons[j].x, neurons[j].y);
            const opacity = (1 - distance / connectionDistance) * 0.3;
            ctx.strokeStyle = isDark
              ? `rgba(139, 92, 246, ${opacity})`
              : `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

const TypingIndicator = ({ isDark }) => {
  const color = isDark ? "#fb923c" : "#f97316";

  return (
    <div
      className="flex items-center justify-center mt-3"
      style={{
        width: 24,
        height: 24,
      }}
    >
      <div
        className="relative"
        style={{
          width: "20px",
          height: "20px",
          animation: "claudeSpin 1s linear infinite",
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            style={{
              transform: `rotate(${i * 30}deg) translate(6px, 0)`,
              transformOrigin: "center",
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "3px",
              height: "8px",
              backgroundColor: color,
              borderRadius: "2px",
              opacity: i / 12,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes claudeSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const TypingText = ({ text, isDark, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setCurrentIndex(0);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <div
      className={`space-y-3 text-sm leading-relaxed break-words ${
        isDark ? "text-slate-300" : "text-gray-700"
      }`}
    >
      <p style={{ whiteSpace: "pre-wrap" }}>{displayedText}</p>

      {currentIndex < (text ? text.length : 0) && (
        <div className="mt-2">
          <TypingIndicator isDark={isDark} />
        </div>
      )}
    </div>
  );
};

const PatientDashboard = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('vbis_theme');
    return saved ? saved === 'dark' : true;
  });
  const [processingStage, setProcessingStage] = useState("input");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: "",
    age: "",
    sex: "",
    parcellationType: "parc_86",
    clinicalNotes: "",
  });

  useEffect(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((p) => ({ ...p, subjectId: `PT-${timestamp}-${rand}` }));
  }, []);

  // Listen for theme changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('vbis_theme');
      if (saved) {
        setIsDark(saved === 'dark');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for custom event from same window
    const handleThemeChange = (e) => {
      setIsDark(e.detail === 'dark');
    };
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.endsWith(".npy")) {
      alert("Please upload a .npy file");
      return;
    }
    setUploadedFile(file);
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!uploadedFile || !formData.age || !formData.sex) {
      alert("Please fill required fields and upload a .npy file");
      return;
    }

    setProcessingStage("processing");

    try {
      const data = new FormData();
      data.append("file", uploadedFile);
      data.append("parcellation_type", formData.parcellationType);

      const response = await fetch("http://127.0.0.1:8000/simulate", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      console.log("Simulation result:", result);
      
      if (result.status === "success") {
        const localTimestamp = new Date().toLocaleString("en-IN", {
          hour12: false,
        });

        const processed = {
          subjectId: formData.subjectId,
          timestamp: localTimestamp,
          state: "Balanced",
          // confidence: 87.3,
          probabilities: { balanced: 87.3, atRisk: 10.2, pathological: 2.5 },
          metrics: {
            meanFiringRate:
              result.mean_firing_rate !== undefined
                ? Number(result.mean_firing_rate.toFixed(3))
                : Number((42.3).toFixed(3)),
            meanMembranePotential:
              result.mean_membrane_potential !== undefined
                ? Number(result.mean_membrane_potential.toFixed(3))
                : Number((-65.4).toFixed(3)),
          },
          explanation: result.explanation || "No explanation available.",
          firingChart: (result.time || []).map((t, i) => ({
            time: t,
            "r[0]": (result.firing_rate_series || [])[i],
          })),
          potentialChart: (result.time || []).map((t, i) => ({
            time: t,
            "V[0]": (result.membrane_potential_series || [])[i],
          })),
        };

        setResults(processed);
        setProcessingStage("results");
        try {
          const token = localStorage.getItem("vbis_token");
          if (token) {
            const savePayload = {
              subjectId: processed.subjectId,
              parcellationType: formData.parcellationType,
              clinicalNotes: formData.clinicalNotes,
              metrics: processed.metrics,
            };

            const saveRes = await fetch(
              "http://localhost:5000/api/predict/save",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(savePayload),
              }
            );

            if (!saveRes.ok) {
              const txt = await saveRes.text();
              console.warn("History save failed:", saveRes.status, txt);
            } else {
              console.log("History saved successfully");
            }
          } else {
            console.log("No vbis_token — skipping history save");
          }
        } catch (saveErr) {
          console.error("Error saving history:", saveErr);
        }
      } else {
        alert(`Error: ${result.message || "simulation failed"}`);
        setProcessingStage("input");
      }
    } catch (err) {
      console.error("Simulation error:", err);
      alert("Backend error: " + err.message);
      setProcessingStage("input");
    }
  };

  const mockResults = {
    subjectId: "PT-2847",
    timestamp: new Date().toLocaleString(),
    state: "Balanced",
    probabilities: { balanced: 87.3, atRisk: 10.2, pathological: 2.5 },
    metrics: {
      meanFiringRate: 42.3,
      meanMembranePotential: -65.4,
    },
    explanation: "This is a sample explanation for the neural dynamics analysis.",
  };

  const dataToShow = results || mockResults;

  const getStateColor = (state) => {
    switch (state) {
      case "Balanced":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "At-Risk":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "Pathological":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/30";
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case "Balanced":
        return "🟢";
      case "At-Risk":
        return "⚠️";
      case "Pathological":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const parcellationOptions = [
    { value: "parc_86", label: "AAL (86 nodes)" },
    { value: "parc_129", label: "DKT (129 nodes)" },
    { value: "parc_234", label: "Schaefer (234 nodes)" },
    { value: "parc_463", label: "Desikan-Killiany (463 nodes)" },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div className="fixed inset-0 z-0" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <NeuronCanvas isDark={isDark} />
      </div>

      <div className="relative z-10 p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Brain Connectome Analysis
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                isDark
                  ? "border-slate-700 bg-slate-900/50 hover:bg-slate-800/50"
                  : "border-gray-300 bg-white hover:bg-gray-100"
              }`}
            >
              <Clock className="w-4 h-4" />
              History
            </button>
          </div>
        </div>

        {processingStage === "input" && (
          <div
            className={`backdrop-blur-md rounded-2xl border p-6 ${
              isDark
                ? "bg-slate-900/70 border-slate-800"
                : "bg-white/70 border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-purple-500" />
              Upload Connectome Data
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brain Connectivity File (.npy)</label>
                <div className={`relative border-2 border-dashed rounded-lg p-1 text-center transition-colors ${isDark ? "border-slate-700 hover:border-purple-500" : "border-gray-300 hover:border-indigo-500"}`}>
                  <input type="file" accept=".npy" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-slate-600" : "text-gray-400"}`} />
                  <p className="text-sm">
                    {uploadedFile ? (<span className="text-purple-400 font-medium">{uploadedFile.name}</span>) : ("Click to upload or drag and drop")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject ID</label>
                  <input type="text" name="subjectId" value={formData.subjectId} readOnly className={`w-full p-2 rounded-lg border cursor-not-allowed text-gray-400 ${isDark ? "bg-slate-800/40 border-slate-700" : "bg-gray-100 border-gray-300"}`} title="Auto-generated for this patient" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Age *</label>
                  <input type="number" name="age" placeholder="e.g., 45" value={formData.age} onChange={handleInputChange} className={`w-full p-2 rounded-lg border ${isDark ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-300 text-gray-900"}`} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sex *</label>
                  <select name="sex" value={formData.sex} onChange={handleInputChange} className={`w-full p-2 rounded-lg border ${isDark ? "bg-slate-800/50 border-slate-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Parcellation Type</label>
                  <select name="parcellationType" value={formData.parcellationType} onChange={handleInputChange} className={`w-full p-2 rounded-lg border ${isDark ? "bg-slate-800/50 border-slate-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
                    {parcellationOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Clinical Notes (Optional)</label>
                <textarea name="clinicalNotes" placeholder="Enter any relevant clinical observations..." value={formData.clinicalNotes} onChange={handleInputChange} rows={2} className={`w-full p-2 rounded-lg border ${isDark ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-300 text-gray-900"}`} />
              </div>

              <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all">
                Run Simulation
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {processingStage === "processing" && (
          <div className={`backdrop-blur-md rounded-2xl border p-12 text-center ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/70 border-gray-200"}`}>
            <Brain className="w-16 h-16 mx-auto mb-6 animate-pulse text-purple-500" />
            <h2 className="text-xl font-semibold mb-2">Processing Neural Network</h2>
            <p className={`${isDark ? "text-slate-400" : "text-gray-600"}`}>Running simulation on your connectome data...</p>
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}

        {processingStage === "results" && (
          <div className={`backdrop-blur-md rounded-2xl border p-6 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/70 border-gray-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                Analysis Results
              </h2>
              <div className="flex gap-2">
                <button className={`p-2 rounded-lg border ${isDark ? "border-slate-700 bg-slate-800/50 hover:bg-slate-700/50" : "border-gray-300 bg-white hover:bg-gray-100"}`} title="Download Report">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className={`mb-6 p-4 rounded-lg border ${isDark ? "border-slate-700 bg-slate-800/30" : "border-gray-200 bg-gray-50"}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="opacity-60">Subject ID</p>
                  <p className="font-semibold">{dataToShow.subjectId}</p>
                </div>
                <div>
                  <p className="opacity-60">Timestamp</p>
                  <p className="font-semibold">{dataToShow.timestamp}</p>
                </div>
                <div>
                  <p className="opacity-60">Age</p>
                  <p className="font-semibold">{formData.age || "N/A"}</p>
                </div>
                <div>
                  <p className="opacity-60">Sex</p>
                  <p className="font-semibold">{formData.sex || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className={`border-2 rounded-xl p-6 mb-6 ${getStateColor(dataToShow.state)}`}>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{getStateIcon(dataToShow.state)}</span>
                <div className="flex-1">
                  <p className="text-3xl font-bold mb-1">{dataToShow.state}</p>
                  {/* <p className="text-sm opacity-80">Confidence: {dataToShow.confidence}%</p> */}
                </div>
                <Activity className="w-8 h-8 opacity-50" />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4">Network Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(dataToShow.metrics).map(([key, value]) => (
                <div key={key} className={`p-5 rounded-lg border ${isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-white"}`}>
                  <p className={`text-sm uppercase tracking-wider mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{key.replace(/([A-Z])/g, " $1").trim()}</p>
                  <p className="text-xl font-bold text-purple-400">{value}</p>
                </div>
              ))}
            </div>

            <div className={`mb-6 p-6 rounded-lg border ${isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-white"}`}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Analysis Summary
              </h3>
              <TypingText text={dataToShow.explanation} isDark={isDark} speed={20} />
              
              {formData.clinicalNotes && (
                <div className={`mt-4 pt-4 border-t ${isDark ? "border-slate-700" : "border-gray-200"}`}>
                  <p className={`font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Clinical Notes:</p>
                  <p className={`italic text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>{formData.clinicalNotes}</p>
                </div>
              )}
              
              <p className={`text-sm mt-4 pt-4 border-t ${isDark ? "border-slate-700 text-slate-500" : "border-gray-200 text-gray-500"}`}>
                <strong>Note:</strong> This analysis is computational — interpret with clinical context.
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-4 mt-8">Temporal Dynamics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg border border-gray-300">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results?.firingChart || []}>
                    <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="time" stroke="#000000" style={{ fontSize: "12px" }} label={{ value: "Time", position: "insideBottom", offset: -5 }} />
                    <YAxis stroke="#000000" style={{ fontSize: "12px" }} label={{ value: "Firing rate", angle: -90, position: "insideLeft" }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "4px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
                    <Line type="monotone" dataKey="r[0]" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-300">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results?.potentialChart || []}>
                    <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="time" stroke="#000000" style={{ fontSize: "12px" }} label={{ value: "Time", position: "insideBottom", offset: -5 }} />
                    <YAxis stroke="#000000" style={{ fontSize: "12px" }} label={{ value: "Membrane potential", angle: -90, position: "insideLeft" }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "4px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
                    <Line type="monotone" dataKey="V[0]" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* <div className={`mb-6 p-6 rounded-lg border ${isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-white"}`}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Analysis Summary
              </h3>
              <TypingText text={dataToShow.explanation} isDark={isDark} speed={20} />
              
              {formData.clinicalNotes && (
                <div className={`mt-4 pt-4 border-t ${isDark ? "border-slate-700" : "border-gray-200"}`}>
                  <p className={`font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Clinical Notes:</p>
                  <p className={`italic text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>{formData.clinicalNotes}</p>
                </div>
              )}
              
              <p className={`text-sm mt-4 pt-4 border-t ${isDark ? "border-slate-700 text-slate-500" : "border-gray-200 text-gray-500"}`}>
                <strong>Note:</strong> This analysis is computational — interpret with clinical context.
              </p>
            </div> */}

            <div className="flex gap-4">
              <button onClick={() => setProcessingStage("input")} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold">
                Run Another Test
              </button>
            </div>
          </div>
        )}
      </div>

      {showHistory && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowHistory(false)}
          />
          <HistoryDrawer
            isDark={isDark}
            onClose={() => setShowHistory(false)}
          />
        </>
      )}
    </div>
  );
};

export default PatientDashboard;