import React, { useState, useEffect, useRef } from 'react';
import { Brain, Mail, MapPin, Phone, MessageSquare, HelpCircle, FileText, Send } from 'lucide-react';

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

const ContactSupportPage = () => {
  const [isDark, setIsDark] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const supportOptions = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: "FAQ",
      description: "Find answers to common questions",
      action: "Browse FAQ",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Documentation",
      description: "Explore our comprehensive guides",
      action: "View Docs",
      gradient: "from-emerald-500 to-teal-600"
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
      <div className="relative z-10 pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Get In <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className={`text-xl sm:text-2xl mb-8 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Have questions? We're here to help with your research and platform needs
          </p>
        </div>
      </div>

      {/* Main Contact Card */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className={`p-10 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-500 hover:scale-[1.01] ${
            isDark 
              ? 'bg-white/5 border-white/10 hover:border-violet-500/50 hover:shadow-violet-500/20' 
              : 'bg-white/80 border-gray-200 hover:border-indigo-300'
          }`}>
            <div className="text-center mb-12">
              <div className={`h-20 w-20 mx-auto rounded-2xl flex items-center justify-center border mb-6 transition-all duration-500 hover:scale-110 hover:rotate-6 ${
                isDark 
                  ? 'bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-violet-500/30' 
                  : 'bg-gradient-to-br from-indigo-100 to-violet-100 border-indigo-300'
              }`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-10 w-10 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              
              <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Keshav Memorial College of Engineering
              </h2>
              <p className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Ibrahimpatnam, Hyderabad
              </p>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Telangana, India
              </p>
            </div>

            {/* Contact Info Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className={`p-6 rounded-2xl backdrop-blur-md transition-all duration-500 hover:scale-105 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
              }`}>
                <div className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                  isDark ? 'bg-violet-600/20 text-violet-400' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Email Us
                </h3>
                
                  neuroverse.ai.dev@gmail.com
                
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-md transition-all duration-500 hover:scale-105 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
              }`}>
                <div className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                  isDark ? 'bg-violet-600/20 text-violet-400' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Location
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Hyderabad, Telangana
                </p>
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-md transition-all duration-500 hover:scale-105 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
              }`}>
                <div className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                  isDark ? 'bg-violet-600/20 text-violet-400' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Phone
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Available on request
                </p>
              </div>
            </div>

            {/* Email Button */}
            <div className="text-center">
              <a 
                href="mailto:neuroverse.ai.dev@gmail.com"
                className={`inline-flex items-center px-8 py-4 rounded-2xl border font-semibold text-lg transition-all duration-500 hover:scale-105 group ${
                  isDark 
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50' 
                    : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-2xl hover:shadow-indigo-500/50'
                }`}
              >
                <Mail className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span>Send us an email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Support Options
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Other Ways to Get Help
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className={`p-8 rounded-3xl backdrop-blur-md transition-all duration-500 hover:scale-105 cursor-pointer ${
                  isDark 
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20' 
                    : 'bg-white/80 border border-gray-200 hover:bg-white hover:border-indigo-300 shadow-xl hover:shadow-2xl'
                }`}
              >
                <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${option.gradient} text-white shadow-lg transition-all duration-500 hover:scale-110 hover:rotate-6`}>
                  {option.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {option.title}
                </h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {option.description}
                </p>
                <button className={`text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-violet-400 hover:text-violet-300' : 'text-indigo-600 hover:text-indigo-700'
                }`}>
                  {option.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Contact Form
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className={`p-10 rounded-3xl border backdrop-blur-xl shadow-2xl ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Send us a Message
            </h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white focus:ring-violet-500 focus:border-violet-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white focus:ring-violet-500 focus:border-violet-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-violet-500 focus:border-violet-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-violet-500 focus:border-violet-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              
              {submitted && (
                <div className={`p-4 rounded-xl text-center font-semibold ${
                  isDark ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-300'
                }`}>
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105 flex items-center justify-center space-x-3 ${
                  isDark 
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50' 
                    : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-2xl hover:shadow-indigo-500/50'
                }`}
              >
                <span>Send Message</span>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div> */}

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
    </div>
  );
};

export default ContactSupportPage;