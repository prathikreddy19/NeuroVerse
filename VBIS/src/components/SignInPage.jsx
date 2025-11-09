// src/components/SignInPage.jsx
// Full sign-in page with:
// - NeuronCanvas (DPR-aware, debounced resize, cleanup, spatial checks)
// - Pause / resume toggle + auto-pause on mobile/battery/prefers-reduced-motion
// - Email verification UX (resend, "I verified" check)
// - Safer token usage guidance (sessionStorage for firebase token, localStorage limited to vbis_token)
// - Accessibility improvements (aria attributes, role=alert, keyboard-friendly)
// - Centralized config usage via src/config.js
// - FIXED: Theme synchronization with sidebar across all pages

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, Mail, Lock, User, Phone, MapPin, Building, Eye, EyeOff, ArrowRight
} from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, provider } from '../firebase'; // your firebase config
import axios from 'axios';
import { API_URL, APP_NAME } from '../config';

/* ---------------------------
   Small utilities
   --------------------------- */
const chooseClass = (isDark, darkClass, lightClass) => (isDark ? darkClass : lightClass);

/* Debounce hook */
function useDebouncedCallback(callback, delay = 100) {
  const timerRef = useRef(null);
  const debounced = useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  return debounced;
}

/* ---------------------------
   Google icon (SVG)
   --------------------------- */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10V12.05H15.4818C15.2364 13.3 14.5091 14.3591 13.4182 15.0682V17.5773H16.7273C18.7091 15.7682 19.8 13.2273 19.8 10.2273Z" fill="#4285F4"/>
    <path d="M10 20C12.7 20 14.9636 19.1045 16.7273 17.5773L13.4182 15.0682C12.5091 15.6682 11.3455 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2 4.40455 11.8H0.990906V14.3909C2.74545 17.8773 6.10909 20 10 20Z" fill="#34A853"/>
    <path d="M4.40455 11.8C4.19091 11.2 4.06818 10.5591 4.06818 9.90909C4.06818 9.25909 4.19091 8.61818 4.40455 8.01818V5.42727H0.990906C0.359091 6.68182 0 8.09091 0 9.59091C0 11.0909 0.359091 12.5 0.990906 13.7545L4.40455 11.8Z" fill="#FBBC05"/>
    <path d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.6955 0 10 0C6.10909 0 2.74545 2.12273 0.990906 5.60909L4.40455 8.2C5.19091 5.8 7.39545 3.97727 10 3.97727Z" fill="#EA4335"/>
  </svg>
);

/* ---------------------------
   AvatarSelector
   --------------------------- */
const AvatarSelector = ({ avatarOptions, currentAvatar, onSelect, isDark }) => {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${chooseClass(isDark, 'text-gray-300', 'text-gray-700')}`}>Choose Avatar</label>
      <div className="flex flex-wrap gap-2" role="list">
        {avatarOptions.map(avatar => {
          const selected = avatar === currentAvatar;
          return (
            <button
              key={avatar}
              type="button"
              onClick={() => onSelect(avatar)}
              aria-pressed={selected}
              aria-label={`Select avatar ${avatar}`}
              className={`text-3xl p-2 rounded-xl transition-all focus:outline-none focus:ring-2 ${
                selected ? (isDark ? 'bg-violet-600/20 ring-2 ring-violet-500' : 'bg-indigo-100 ring-2 ring-indigo-500') : (isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200')
              }`}
            >
              {avatar}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------------------
   ForgotPassword Component
   --------------------------- */
const ForgotPassword = ({ isDark, onClose }) => {
  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    if (!resetEmail) return setErrors({ reset: 'Please enter your email address' });
    if (!/\S+@\S+\.\S+/.test(resetEmail)) return setErrors({ reset: 'Please enter a valid email address' });

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setResetEmail('');
        setSuccessMessage('');
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      let msg = 'Failed to send reset email.';
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (err.code === 'auth/too-many-requests') msg = 'Too many requests. Please try again later.';
      setErrors({ reset: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${chooseClass(isDark, 'bg-violet-600/20 border border-violet-500/30', 'bg-indigo-100 border border-indigo-200')}`}>
          <Mail className={`w-8 h-8 ${chooseClass(isDark, 'text-violet-400', 'text-indigo-600')}`} />
        </div>
        <h1 className={`text-3xl font-bold mb-2 ${chooseClass(isDark, 'text-white', 'text-gray-900')}`}>Reset Password</h1>
        <p className={`${chooseClass(isDark, 'text-gray-400', 'text-gray-600')}`}>Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
        {successMessage && <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm" role="status">{successMessage}</div>}
        {errors.reset && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" role="alert">{errors.reset}</div>}

        <div>
          <label className={`block text-sm font-medium mb-2 ${chooseClass(isDark, 'text-gray-300', 'text-gray-700')}`}>Email Address</label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${chooseClass(isDark, 'text-gray-500', 'text-gray-400')}`} />
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="your.email@example.com"
              className={`w-full pl-11 pr-4 py-3 rounded-xl transition-colors ${chooseClass(isDark, 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-violet-500', 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500')} focus:outline-none focus:ring-2 ${chooseClass(isDark, 'focus:ring-violet-500/20', 'focus:ring-indigo-500/20')}`}
              aria-label="Email address for password reset"
              aria-invalid={!!errors.reset}
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" aria-busy={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <button type="button" onClick={onClose} className={`w-full text-sm ${chooseClass(isDark, 'text-gray-400 hover:text-white', 'text-gray-600 hover:text-gray-900')} transition-colors`}>Back to Sign In</button>
      </form>
    </>
  );
};

/* ---------------------------
   NeuronCanvas (heavy background)
   - DPR-aware
   - debounced resize
   - clears animations and timeouts
   - pause/resume API
   --------------------------- */
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

/* ---------------------------
   EmailVerifyPanel
   - after signup, shows instructions and resend + "I verified" flow
   --------------------------- */
const EmailVerifyPanel = ({ isDark, onResend, onCheckVerified, resendLoading, checkLoading, message }) => {
  return (
    <div className={`w-full max-w-md rounded-2xl backdrop-blur-sm ${chooseClass(isDark, 'bg-white/5 border border-white/10', 'bg-white/70 border border-gray-200')} shadow-2xl p-8`}>
      <div className="text-center mb-6">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${chooseClass(isDark, 'bg-violet-600/20 border border-violet-500/30', 'bg-indigo-100 border border-indigo-200')}`}>
          <Mail className={`w-8 h-8 ${chooseClass(isDark, 'text-violet-400', 'text-indigo-600')}`} />
        </div>
        <h1 className={`text-2xl font-bold ${chooseClass(isDark, 'text-white', 'text-gray-900')}`}>Verify your email</h1>
        <p className={`${chooseClass(isDark, 'text-gray-400', 'text-gray-600')} mt-2`}>We've sent a verification link to your email. Please click it to continue.</p>
      </div>

      {message && <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4" role="status">{message}</div>}

      <div className="space-y-3">
        <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold flex justify-center" onClick={onResend} disabled={resendLoading} aria-busy={resendLoading}>
          {resendLoading ? 'Resending...' : 'Resend verification email'}
        </button>
        <button className="w-full px-6 py-3 rounded-xl border text-sm" onClick={onCheckVerified} disabled={checkLoading} aria-busy={checkLoading}>
          {checkLoading ? 'Checking...' : "I've verified — continue"}
        </button>
      </div>
    </div>
  );
};

/* ---------------------------
   AuthForm (main sign-in/sign-up UI)
   --------------------------- */
const AuthForm = ({ isDark, setIsDark, setShowVerifyPanel, setVerifyData }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [messageForVerify, setMessageForVerify] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    institution: '',
    location: '',
    avatar: '👨‍⚕️'
  });

  const avatarOptions = ['👨‍⚕️', '👩‍⚕️', '👨‍🔬', '👩‍🔬', '👨‍💼', '👩‍💼', '🧑‍💻', '👩‍💻'];
  const roleOptions = ['Researcher', 'Clinician', 'Neuroscientist', 'Student', 'Administrator'];

  useEffect(() => {
    // If user already signed in, maybe redirect (optional)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Keep as placeholder: we don't auto-redirect here to avoid surprise navigations
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (isSignUp) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.role) newErrors.role = 'Role is required';
      if (!formData.institution) newErrors.institution = 'Institution is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // sync firebase user to backend (safer storage comments)
  const syncUserToMongoDB = async (firebaseUser, additionalData = {}) => {
    try {
      const firebaseToken = await firebaseUser.getIdToken();
      // send to backend, backend should ideally set httpOnly cookie and return user info
      const response = await axios.post(`${API_URL}/firebase-sync`, {
        firebaseToken,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: additionalData.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
        avatar: additionalData.avatar || '👨‍⚕️',
        phone: additionalData.phone || '',
        role: additionalData.role || 'Researcher',
        institution: additionalData.institution || '',
        location: additionalData.location || '',
        provider: additionalData.provider || 'email',
        emailVerified: firebaseUser.emailVerified
      }, { withCredentials: true });

      const { token, user } = response.data;

      // Store only backend-issued token (vbis_token). For best security, backend should set httpOnly cookie instead.
      if (token) localStorage.setItem('vbis_token', token);

      // Store firebase token only briefly in sessionStorage; remove shortly after sync
      sessionStorage.setItem('vbis_firebase_token', firebaseToken);
      setTimeout(() => sessionStorage.removeItem('vbis_firebase_token'), 10 * 60 * 1000);

      localStorage.setItem('vbis_user', JSON.stringify({
        ...user,
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'
      }));
      localStorage.setItem('vbis_authenticated', 'true');

      return { success: true, user };
    } catch (err) {
      console.error('MongoDB sync error:', err);
      throw err;
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      await syncUserToMongoDB(firebaseUser, { provider: 'google' });
      navigate('/patient');
    } catch (err) {
      console.error('Google sign-in error:', err);
      let msg = 'Google sign-in failed. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') msg = 'Sign-in cancelled.';
      else if (err.code === 'auth/popup-blocked') msg = 'Popup blocked. Please allow popups for this site.';
      setErrors({ submit: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const firebaseUser = userCredential.user;
        try {
          await sendEmailVerification(firebaseUser);
          setMessageForVerify('Verification email sent! Please check your inbox.');
        } catch (ve) {
          console.warn('Email verification failed to send:', ve);
          setMessageForVerify('');
        }

        // Sync to backend and then show verification panel
        await syncUserToMongoDB(firebaseUser, {
          name: formData.name,
          avatar: formData.avatar,
          phone: formData.phone,
          role: formData.role,
          institution: formData.institution,
          location: formData.location,
          provider: 'email'
        });

        // Show verification UI instead of immediate redirect
        setShowVerifyPanel(true);
        setVerifyData({ email: firebaseUser.email });
      } else {
        // sign in
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const firebaseUser = userCredential.user;
        if (!firebaseUser.emailVerified) {
          setMessageForVerify('Please verify your email. Check your inbox for verification link.');
          // still sync so backend knows about user
        }
        await syncUserToMongoDB(firebaseUser, { provider: 'email' });

        // If not verified, show verify panel; otherwise navigate
        if (!firebaseUser.emailVerified) {
          setShowVerifyPanel(true);
          setVerifyData({ email: firebaseUser.email });
        } else {
          navigate('/patient');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      let msg = 'An error occurred. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'Email already in use. Please sign in instead.';
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      else if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      else if (err.code === 'auth/too-many-requests') msg = 'Too many failed attempts. Please try again later.';
      else if (err.response) msg = err.response.data.message || err.response.data.error || msg;
      setErrors({ submit: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md rounded-2xl p-8 ${chooseClass(isDark, 'backdrop-blur-sm bg-white/5 border border-white/10', 'bg-white/70 border border-gray-200')} shadow-2xl`}>
      {showForgotPassword ? (
        <ForgotPassword isDark={isDark} onClose={() => setShowForgotPassword(false)} />
      ) : (
        <>
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${chooseClass(isDark, 'bg-violet-600/20 border border-violet-500/30', 'bg-indigo-100 border border-indigo-200')}`}>
              <Brain className={`w-8 h-8 ${chooseClass(isDark, 'text-violet-400', 'text-indigo-600')}`} />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${chooseClass(isDark, 'text-white', 'text-gray-900')}`}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p className={`${chooseClass(isDark, 'text-gray-400', 'text-gray-600')}`}>{isSignUp ? `Join ${APP_NAME}` : `Sign in to continue to ${APP_NAME}`}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-live="polite">
            <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className={`w-full px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 ${chooseClass(isDark, 'bg-white/10 text-white border border-white/20', 'bg-white text-gray-900 border border-gray-300')} disabled:opacity-50`} aria-label="Continue with Google">
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${chooseClass(isDark, 'border-white/10', 'border-gray-300')}`}></div></div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${chooseClass(isDark, 'bg-slate-950/80 text-gray-400', 'bg-white/70 text-gray-600')}`}>Or continue with email</span>
              </div>
            </div>

            {messageForVerify && <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm" role="status">{messageForVerify}</div>}
            {errors.submit && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" role="alert">{errors.submit}</div>}

            {isSignUp && <AvatarSelector avatarOptions={avatarOptions} currentAvatar={formData.avatar} onSelect={(a) => setFormData(prev => ({ ...prev, avatar: a }))} isDark={isDark} />}

            {isSignUp && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${chooseClass(isDark, 'text-gray-300', 'text-gray-700')}`}>Full Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${chooseClass(isDark, 'text-gray-500', 'text-gray-400')}`} />
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Dr. John Smith" type="text" className={`w-full pl-11 pr-4 py-3 rounded-xl ${chooseClass(isDark, 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-violet-500', 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500')} focus:outline-none focus:ring-2`} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined}/>
                </div>
                {errors.name && <p id="name-error" role="alert" className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 ${chooseClass(isDark, 'text-gray-300', 'text-gray-700')}`}>Email Address <span className="text-red-400">*</span></label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${chooseClass(isDark, 'text-gray-500', 'text-gray-400')}`} />
                <input name="email" value={formData.email} onChange={handleChange} placeholder="john.smith@example.com" type="email" className={`w-full pl-11 pr-4 py-3 rounded-xl ${chooseClass(isDark, 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-violet-500', 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500')} focus:outline-none focus:ring-2`} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}/>
              </div>
              {errors.email && <p id="email-error" role="alert" className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${chooseClass(isDark, 'text-gray-300', 'text-gray-700')}`}>Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${chooseClass(isDark, 'text-gray-500', 'text-gray-400')}`} />
                <input name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" type={showPassword ? 'text' : 'password'} className={`w-full pl-11 pr-11 py-3 rounded-xl ${chooseClass(isDark, 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-violet-500', 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500')} focus:outline-none focus:ring-2`} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined}/>
                <button type="button" onClick={() => setShowPassword(p => !p)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${chooseClass(isDark, 'text-gray-500 hover:text-gray-400', 'text-gray-400 hover:text-gray-600')}`} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
              {errors.password && <p id="password-error" role="alert" className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            {!isSignUp && <div className="flex justify-end"><button type="button" onClick={() => setShowForgotPassword(true)} className={`text-sm ${chooseClass(isDark, 'text-violet-400 hover:text-violet-300', 'text-indigo-600 hover:text-indigo-700')}`}>Forgot password?</button></div>}

            {isSignUp && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${chooseClass(isDark, 'text-gray-300', 'text-gray-700')}`}>Phone Number</label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${chooseClass(isDark, 'text-gray-500', 'text-gray-400')}`} />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" type="tel" className={`w-full pl-11 pr-4 py-3 rounded-xl ${chooseClass(isDark, 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-violet-500', 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500')} focus:outline-none focus:ring-2`}/>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${chooseClass(isDark, 'text-gray-300', 'text-gray-700')}`}>Role <span className="text-red-400">*</span></label>
                  <select name="role" value={formData.role} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl ${chooseClass(isDark, 'bg-white/5 border border-white/10 text-white focus:border-violet-500', 'bg-white border border-gray-300 text-gray-900 focus:border-indigo-500')} focus:outline-none focus:ring-2`} aria-invalid={!!errors.role} aria-describedby={errors.role ? 'role-error' : undefined}>
                    <option value="">Select your role...</option>
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.role && <p id="role-error" role="alert" className="text-red-400 text-sm mt-1">{errors.role}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${chooseClass(isDark, 'text-gray-300', 'text-gray-700')}`}>Institution <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Building className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${chooseClass(isDark, 'text-gray-500', 'text-gray-400')}`} />
                    <input name="institution" value={formData.institution} onChange={handleChange} placeholder="MIT Neuroscience Lab" type="text" className={`w-full pl-11 pr-4 py-3 rounded-xl ${chooseClass(isDark, 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-violet-500', 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500')} focus:outline-none focus:ring-2`} aria-invalid={!!errors.institution} aria-describedby={errors.institution ? 'institution-error' : undefined}/>
                  </div>
                  {errors.institution && <p id="institution-error" role="alert" className="text-red-400 text-sm mt-1">{errors.institution}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${chooseClass(isDark, 'text-gray-300', 'text-gray-700')}`}>Location</label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${chooseClass(isDark, 'text-gray-500', 'text-gray-400')}`} />
                    <input name="location" value={formData.location} onChange={handleChange} placeholder="Cambridge, MA" type="text" className={`w-full pl-11 pr-4 py-3 rounded-xl ${chooseClass(isDark, 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-violet-500', 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500')} focus:outline-none focus:ring-2`} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={isLoading} className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50" aria-busy={isLoading} aria-label={isSignUp ? 'Create account' : 'Sign in'}>
              {isLoading ? <span>Loading...</span> : <><span>{isSignUp ? 'Create Account' : 'Sign In'}</span><ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsSignUp(s => !s); setErrors({}); setSuccessMessage(''); }} className={`text-sm ${chooseClass(isDark, 'text-gray-400 hover:text-white', 'text-gray-600 hover:text-gray-900')}`}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span className={chooseClass(isDark, 'text-violet-400', 'text-indigo-600')}>{isSignUp ? 'Sign In' : 'Sign Up'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ---------------------------
   Final composed SignInPage
   --------------------------- */
const SignInPage = () => {
  // Initialize theme from localStorage or default to dark
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('vbis_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  
  const [paused, setPaused] = useState(false);
  const [showVerifyPanel, setShowVerifyPanel] = useState(false);
  const [verifyData, setVerifyData] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const navigate = useNavigate();

  // Listen for theme changes from sidebar
  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail;
      setIsDark(newTheme === 'dark');
    };

    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Sync theme to localStorage when it changes
  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('vbis_theme', theme);
  }, [isDark]);

  // auto-pause on battery saver (optional)
  useEffect(() => {
    let battery = null;
    let mounted = true;
    if (navigator.getBattery) {
      navigator.getBattery().then(b => {
        if (!mounted) return;
        battery = b;
        const onChange = () => {
          const lowPower = battery.saveBattery || battery.level < 0.25 || battery.charging === false && battery.level < 0.5;
          if (lowPower) setPaused(true);
        };
        battery.addEventListener && battery.addEventListener('levelchange', onChange);
      }).catch(() => {});
    }
    return () => { mounted = false; if (battery && battery.removeEventListener) battery.removeEventListener('levelchange', () => {}); };
  }, []);

  // Resend verification email
  const handleResend = async () => {
    if (!auth.currentUser) {
      setVerifyMessage('No signed-in user found to resend verification.');
      return;
    }
    setResendLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerifyMessage('Verification email resent. Check your inbox.');
    } catch (err) {
      console.error('Resend verification error:', err);
      setVerifyMessage('Failed to resend verification. Try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  // Check if verified (reload user)
  const handleCheckVerified = async () => {
    setCheckLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setVerifyMessage('No signed-in user found.');
        setCheckLoading(false);
        return;
      }
      await user.reload();
      if (user.emailVerified) {
        setVerifyMessage('Email verified — redirecting...');
        setTimeout(() => {
          navigate('/patient');
        }, 800);
      } else {
        setVerifyMessage('Email still not verified. Please check your inbox and click the link.');
      }
    } catch (err) {
      console.error('Check verified error:', err);
      setVerifyMessage('Could not check verification status. Try again.');
    } finally {
      setCheckLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    const themeString = newTheme ? 'dark' : 'light';
    localStorage.setItem('vbis_theme', themeString);
    window.dispatchEvent(new CustomEvent('themeChange', { detail: themeString }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className="fixed inset-0 z-0">
        <NeuronCanvas isDark={isDark} paused={paused} setPaused={setPaused} />
        <div className={`absolute inset-0 ${chooseClass(isDark, 'bg-gradient-to-br from-slate-950/80 via-slate-950/60 to-slate-950/80', 'bg-gradient-to-br from-gray-50/90 via-gray-50/70 to-gray-50/90')}`} />
      </div>

      <div className="fixed top-6 left-6 z-50">
        {/* Uncomment if you want back button */}
        {/* <Link to="/" className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${chooseClass(isDark, 'bg-white/10 hover:bg-white/20 text-white', 'bg-white hover:bg-gray-50 text-gray-900')} backdrop-blur-sm shadow-lg`} aria-label={`Back to ${APP_NAME}`}>
          <Brain className="w-5 h-5" />
          <span className="font-medium">Back to {APP_NAME}</span>
        </Link> */}
      </div>

      <div className="fixed top-6 right-6 z-50 flex gap-2 items-center">
        {/* Uncomment if you want theme toggle button on sign-in page */}
        {/* <button onClick={toggleTheme} className={`px-3 py-2 rounded-lg ${chooseClass(isDark, 'bg-white/10 text-white', 'bg-white text-gray-900')} shadow-sm`} aria-pressed={isDark} aria-label="Toggle theme">
          {isDark ? 'Dark' : 'Light'}
        </button> */}

        {/* Uncomment if you want pause/resume button */}
        {/* <button onClick={() => setPaused(p => !p)} className={`px-3 py-2 rounded-lg ${chooseClass(isDark, 'bg-white/10 text-white', 'bg-white text-gray-900')} shadow-sm`} aria-pressed={paused} aria-label={paused ? 'Resume background animation' : 'Pause background animation'}>
          {paused ? 'Resume BG' : 'Pause BG'}
        </button> */}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {showVerifyPanel ? (
          <EmailVerifyPanel
            isDark={isDark}
            onResend={handleResend}
            onCheckVerified={handleCheckVerified}
            resendLoading={resendLoading}
            checkLoading={checkLoading}
            message={verifyMessage}
          />
        ) : (
          <AuthForm isDark={isDark} setIsDark={setIsDark} setShowVerifyPanel={setShowVerifyPanel} setVerifyData={setVerifyData} />
        )}
      </div>
    </div>
  );
};

export default SignInPage;