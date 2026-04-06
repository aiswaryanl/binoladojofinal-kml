import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Status Code: 404 // Page Not Found";

  // Typing effect
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80); // Slightly faster for professional feel

    return () => clearInterval(typingInterval);
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  // Generate subtle background floating shapes
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 20 + 20,
  }));

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 text-slate-800 font-sans">
      {/* Background Dot Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Subtle Floating Orbs (Glassmorphism feel) */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-indigo-300 mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animation: `floatBackground ${particle.duration}s infinite linear`,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl px-4">
        
        {/* VR Headset Graphic - Professional White/Silver Style */}
        <div className="relative mb-8 animate-float">
          {/* Soft Shadow underneath */}
          <div className="absolute top-3/4 left-1/4 w-1/2 h-8 bg-black opacity-10 blur-xl rounded-[100%]" />

          <svg width="240" height="140" viewBox="0 0 280 160" className="drop-shadow-2xl">
            <defs>
              {/* Professional Silver/White Gradient */}
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              {/* Lens Gradient */}
              <linearGradient id="lensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>

            {/* Strap (Dark Gray) */}
            <path
              d="M30 60 L20 50 Q10 48 10 55 L10 105 Q10 112 20 110 L30 100"
              fill="none"
              stroke="#64748b"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M250 60 L260 50 Q270 48 270 55 L270 105 Q270 112 260 110 L250 100"
              fill="none"
              stroke="#64748b"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Main Body Housing */}
            <path
              d="M40 50 Q40 30 70 30 L210 30 Q240 30 240 50 L240 110 Q240 130 210 130 L70 130 Q40 130 40 110 Z"
              fill="url(#bodyGradient)"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            
            {/* Subtle Shine/Reflection on top */}
            <path
              d="M50 40 Q50 35 70 35 L210 35 Q230 35 230 40"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* Left Lens Panel */}
            <rect x="55" y="45" width="70" height="70" rx="12" fill="#f1f5f9" stroke="#cbd5e1" />
            <rect x="60" y="50" width="60" height="60" rx="8" fill="url(#lensGradient)" />

            {/* Right Lens Panel */}
            <rect x="155" y="45" width="70" height="70" rx="12" fill="#f1f5f9" stroke="#cbd5e1" />
            <rect x="160" y="50" width="60" height="60" rx="8" fill="url(#lensGradient)" />

            {/* Lens UI Elements (Subtle Loading) */}
            <g className="animate-pulse">
              <rect x="75" y="75" width="30" height="2" fill="#38bdf8" opacity="0.8" />
              <rect x="75" y="82" width="20" height="2" fill="#38bdf8" opacity="0.5" />
            </g>

            <g className="animate-pulse" style={{ animationDelay: '0.2s' }}>
              <text x="172" y="85" fill="#ef4444" fontSize="14" fontFamily="sans-serif" fontWeight="bold">
                404
              </text>
            </g>

            {/* Sensor / Camera dots */}
            <circle cx="140" cy="45" r="3" fill="#94a3b8" />
            <circle cx="140" cy="115" r="3" fill="#94a3b8" />
          </svg>
        </div>

        {/* Clean 404 Header */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 mb-2">
          404
        </h1>

        {/* Typing Subheader */}
        <div className="h-8 flex items-center justify-center mb-6">
          <p className="text-lg md:text-xl font-mono text-indigo-600 font-medium">
            {displayText}
            <span
              className={`inline-block w-2.5 h-5 ml-1 bg-indigo-600 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`}
            />
          </p>
        </div>

        {/* Context Text */}
        <p className="text-slate-500 text-center max-w-md mb-10 text-lg leading-relaxed">
          The simulation you are looking for doesn't exist or has been moved.
          Please return to the dashboard to recalibrate your session.
        </p>

        {/* Professional Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to="/"
            className="group relative px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="group px-8 py-3 bg-white border border-slate-300 hover:border-indigo-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-16 border-t border-slate-200 pt-6 flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            System Offline
          </span>
          <span>|</span>
          <span>Ref: ERR_PATH_INVALID</span>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes floatBackground {
          0% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px); }
          100% { transform: translate(0, 0); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
};

export default NotFound;