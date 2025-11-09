import React, { useState, useEffect, useRef } from 'react';
import { Brain, Activity, RefreshCw, Database, Target, Microscope, TrendingUp, ArrowRight } from 'lucide-react';

const NeuronCanvas = ({ isDark }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
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

const About = ({ isDark }) => {
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

  const coreComponents = [
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'Cross-Coder',
      description: 'The Cross-Coder is an advanced neural encoding and decoding system that translates complex brain signals into interpretable data representations. It acts as a bridge between raw neural activity and actionable insights.',
      features: []
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Neurocore',
      description: 'Neurocore serves as the computational heart of VBT, providing high-fidelity neural simulations based on individual connectome data. This powerful engine enables virtual testing of pharmaceutical compounds and supports parallel processing for rapid simulation cycles.',
      features: []
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: '4-State Classification Model',
      description: 'Our proprietary 4-State Classification Model provides intelligent analysis of brain states and neurological conditions, categorizing neural activity into three distinct states for early detection and preventive interventions.',
      features: []
    }
  ];

  const applications = [
    {
      icon: <Activity className="w-6 h-6" />,
      emoji: '💊',
      title: 'Drug Discovery',
      description: 'Accelerate pharmaceutical development by testing compounds on virtual brain models'
    },
    {
      icon: <Target className="w-6 h-6" />,
      emoji: '🎯',
      title: 'Personalized Medicine',
      description: 'Tailor treatments based on individual brain architecture and response patterns'
    },
    {
      icon: <Microscope className="w-6 h-6" />,
      emoji: '🔬',
      title: 'Disease Modeling',
      description: 'Understand neurological disorders through accurate computational simulations'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      emoji: '📈',
      title: 'Predictive Analytics',
      description: 'Forecast disease progression and treatment outcomes before clinical trials'
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
              ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(220, 92, 246, 0.1), transparent 40%)`
              : `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.05), transparent 40%)`
          }}
        />
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90' : 'bg-gradient-to-b from-gray-50/90 via-gray-50/70 to-gray-50/95'}`} />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20 border border-violet-500/40 mb-8 backdrop-blur-md shadow-lg shadow-violet-500/10 animate-pulse">
            <Brain className={`w-4 h-4 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
            <span className={`text-sm font-semibold ${isDark ? 'text-violet-300' : 'text-indigo-700'}`}>
              About Virtual Brain Intelligence System
            </span>
          </div>

          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <span className="inline-block animate-fade-in">Revolutionizing</span>{' '}
            <span className="inline-block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">Neuroscience</span>
          </h1>

          <p className={`text-xl sm:text-2xl lg:text-4xl mb-12 max-w-4xl mx-auto leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Through personalized brain simulations and advanced AI-driven drug discovery
          </p>
        </div>
      </div>

      {/* What is VBIS Section */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`p-8 sm:p-12 rounded-3xl backdrop-blur-md ${
            isDark 
              ? 'bg-white/5 border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20' 
              : 'bg-white/80 border border-gray-200 shadow-xl hover:shadow-2xl'
          } transition-all duration-500 hover:scale-[1.01]`}>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What is VBT?
            </h2>
            <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              The Virtual Brain Intelligence System (VBIS) is a cutting-edge platform that bridges the gap between connectomics and personalized brain simulations. By integrating advanced neural modeling with AI-powered analysis, VBT enables researchers to simulate brain activity, predict neural responses, and accelerate drug discovery processes for neurological conditions.
            </p>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Our system leverages state-of-the-art machine learning algorithms and comprehensive connectome data to create accurate, personalized virtual brains that can be used for testing therapeutic interventions without invasive procedures.
            </p>
          </div>
        </div>
      </div>

      {/* Core Components Section */}
      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Core Components
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              The powerful technologies driving VBT
            </p>
          </div>

          <div className="space-y-8">
            {coreComponents.map((component, index) => (
              <div
                key={index}
                className={`group p-8 sm:p-10 rounded-3xl backdrop-blur-md transition-all duration-500 hover:scale-[1.02] ${
                  isDark 
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20' 
                    : 'bg-white/80 border border-gray-200 hover:bg-white hover:border-indigo-300 shadow-xl hover:shadow-2xl'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                    isDark ? 'bg-violet-600/20 text-violet-400' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {component.icon}
                  </div>
                  <div>
                    <h3 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {component.title}
                    </h3>
                    <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {component.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Applications
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Transforming neuroscience across multiple domains
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {applications.map((app, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl backdrop-blur-md transition-all duration-500 hover:scale-105 ${
                  isDark 
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20' 
                    : 'bg-white/80 border border-gray-200 hover:bg-white hover:border-indigo-300 shadow-xl hover:shadow-2xl'
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-4xl">{app.emoji}</span>
                  <h3 className={`text-xl sm:text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {app.title}
                  </h3>
                </div>
                <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {app.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div className={`p-8 sm:p-10 rounded-3xl backdrop-blur-md transition-all duration-500 hover:scale-[1.01] ${
            isDark 
              ? 'bg-violet-600/10 border border-violet-500/30 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20' 
              : 'bg-indigo-50/80 border border-indigo-200 shadow-xl hover:shadow-2xl'
          }`}>
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-violet-300' : 'text-indigo-900'}`}>
              Our Mission
            </h2>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              To democratize access to advanced brain simulation technology, enabling researchers and clinicians worldwide to develop breakthrough treatments for neurological disorders through personalized, data-driven approaches.
            </p>
          </div>

          <div className={`p-8 sm:p-10 rounded-3xl backdrop-blur-md transition-all duration-500 hover:scale-[1.01] ${
            isDark 
              ? 'bg-indigo-600/10 border border-indigo-500/30 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20' 
              : 'bg-violet-50/80 border border-violet-200 shadow-xl hover:shadow-2xl'
          }`}>
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-indigo-300' : 'text-violet-900'}`}>
              Our Vision
            </h2>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              A future where every patient receives optimized neurological care based on their unique brain architecture, and where new treatments are developed faster, safer, and more effectively through virtual brain simulations.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-12 rounded-3xl backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] ${
            isDark 
              ? 'bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 shadow-2xl hover:shadow-violet-500/30' 
              : 'bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 shadow-2xl hover:shadow-3xl'
          }`}>
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ready to Explore VBT?
            </h2>
            <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Join the future of neuroscience and personalized brain simulations
            </p>
            <a
              href="/patient"
              className="group relative inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-500 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative">Get Started</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative z-10 border-t ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-white/80'} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Brain className={`w-8 h-8 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>VBT</span>
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

export default About;