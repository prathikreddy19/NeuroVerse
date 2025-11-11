import React, { useState, useEffect, useRef } from 'react';
import { Brain, Activity, Database, Microscope, ArrowRight, Zap, Shield, Users } from 'lucide-react';

const NeuronCanvas = ({ isDark }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const neurons = [];
    const numNeurons = 150;
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
        this.pulsePhase += 0.02;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(139, 92, 246, ${0.6 * pulse})` : `rgba(99, 102, 241, ${0.5 * pulse})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(139, 92, 246, ${0.1 * pulse})` : `rgba(99, 102, 241, ${0.1 * pulse})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < numNeurons; i++) {
      neurons.push(new Neuron());
    }

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
            const opacity = (1 - distance / connectionDistance) * 0.4;
            ctx.strokeStyle = isDark ? `rgba(139, 92, 246, ${opacity})` : `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 1;
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

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDark]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

const LandingPage = ({ isDark }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Brain Mapping",
      description: "Advanced connectome analysis with AI-powered visualization and real-time neural pathway tracking",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Real-time Simulation",
      description: "Dynamic neural activity modeling with millisecond precision and predictive analytics",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Data Integration",
      description: "Seamless patient data management with HIPAA-compliant cloud infrastructure",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Microscope className="w-8 h-8" />,
      title: "Drug Discovery",
      description: "AI-powered therapeutic research accelerating breakthrough treatments by 10x",
      gradient: "from-rose-500 to-pink-600"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "10x Faster Analysis",
      description: "Reduce brain scan analysis time from hours to minutes"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance certifications"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaborative Platform",
      description: "Connect researchers globally in real-time"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Canvas Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <NeuronCanvas isDark={isDark} />
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark 
              ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.1), transparent 40%)`
              : `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.05), transparent 40%)`
          }}
        />
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90' : 'bg-gradient-to-b from-gray-50/90 via-gray-50/70 to-gray-50/95'}`} />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20 border border-violet-500/40 mb-8 backdrop-blur-md shadow-lg shadow-violet-500/10 animate-pulse">
            <Activity className={`w-4 h-4 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
            <span className={`text-sm font-semibold ${isDark ? 'text-violet-300' : 'text-indigo-700'}`}>
              Next-Gen Neuroscience Platform
            </span>
          </div>

          {/* Main Heading with Animation */}
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 pb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`} style={{ lineHeight: '1.3' }}>
            <span className="inline-block animate-fade-in">Virtual Brain</span><br />
            <span className="inline-block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
              Intelligence System
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-xl sm:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            From Connectomes to 
            <span className={`font-semibold ${isDark ? 'text-violet-400' : 'text-indigo-600'}`}> Personalized Brain Simulation</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
            <a
              href="/about"
              className="group relative px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-500 hover:scale-105 flex items-center space-x-3 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative">Explore Platform</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </a>
            <a
              href="/patient"
              className={`relative px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105 group overflow-hidden ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 shadow-xl' 
                  : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-300 shadow-2xl'
              }`}
            >
              <span className="relative z-10">Get Started</span>
              <div className={`absolute inset-0 transition-transform duration-500 translate-y-full group-hover:translate-y-0 ${isDark ? 'bg-white/20' : 'bg-gray-100'}`} />
            </a>
          </div>

          {/* Stats
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { value: '10K+', label: 'Brain Scans Analyzed', icon: <Brain className="w-6 h-6" /> },
              { value: '99.9%', label: 'Model Accuracy', icon: <Activity className="w-6 h-6" /> },
              { value: '50+', label: 'Research Partners', icon: <Users className="w-6 h-6" /> },
              { value: '24/7', label: 'Active Processing', icon: <Zap className="w-6 h-6" /> }
            ].map((stat, index) => (
              <div
                key={index}
                className={`group p-6 rounded-2xl backdrop-blur-md transition-all duration-500 hover:scale-105 cursor-pointer ${
                  isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20' : 'bg-white/80 border border-gray-200 hover:bg-white hover:border-indigo-300 shadow-xl hover:shadow-2xl'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-violet-600/20 text-violet-400' : 'bg-indigo-100 text-indigo-600'}`}>
                  {stat.icon}
                </div>
                <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${isDark ? 'from-violet-400 to-indigo-400' : 'from-indigo-600 to-violet-600'} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Advanced Capabilities
            </h2>
            <p className={`text-xl sm:text-2xl max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Cutting-edge tools empowering breakthrough brain research and therapeutic development
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 hover:scale-105 cursor-pointer ${
                  isDark 
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20' 
                    : 'bg-white/80 border border-gray-200 hover:bg-white hover:border-indigo-300 shadow-xl hover:shadow-2xl'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  {feature.icon}
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className={`rounded-3xl p-12 backdrop-blur-xl ${isDark ? 'bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/30' : 'bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200'} shadow-2xl`}>
            <h3 className={`text-3xl sm:text-4xl font-bold text-center mb-16 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Why Leading Institutions Choose VBIS
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className={`mb-4 p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-violet-600/20 text-violet-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    {benefit.icon}
                  </div>
                  <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {benefit.title}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative z-10 border-t ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-white/80'} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Brain className={`w-8 h-8 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>VBIS</span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2025 Virtual Brain Intelligence System. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {['Privacy', 'Terms', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
