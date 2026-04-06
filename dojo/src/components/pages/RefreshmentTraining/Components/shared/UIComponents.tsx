import React from 'react';

// --- COLOR UTILITY FOR AVATARS ---
const AVATAR_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-rose-500',
  'bg-cyan-500', 'bg-amber-500', 'bg-violet-500', 'bg-emerald-500'
];

export const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.substring(0, 2) || '??').toUpperCase();
};

// --- AVATAR COMPONENT ---
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' ;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl'
  };

  return (
    <div className={`${sizeClasses[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-bold shadow-md ${className}`}>
      {getInitials(name)}
    </div>
  );
};

// --- CIRCULAR TIMER ---
interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  size?: 'sm' | 'md' | 'lg';
  showWarning?: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({ 
  timeLeft, 
  totalTime, 
  size = 'md',
  showWarning = true 
}) => {
  const percentage = (timeLeft / totalTime) * 100;
  const isWarning = showWarning && timeLeft <= 10;
  
  const sizeConfig = {
    sm: { container: 'w-14 h-14', stroke: 3, textSize: 'text-lg' },
    md: { container: 'w-20 h-20', stroke: 4, textSize: 'text-xl' },
    lg: { container: 'w-28 h-28', stroke: 5, textSize: 'text-3xl' }
  };

  const config = sizeConfig[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : String(secs);
  };

  return (
    <div className={`${config.container} relative`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={isWarning ? '#FEE2E2' : '#F3E8FF'}
          strokeWidth={config.stroke}
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={isWarning ? '#EF4444' : '#9333EA'}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center ${config.textSize} font-bold ${isWarning ? 'text-red-600' : 'text-purple-700'}`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};

// --- PROGRESS STEPPER (Persistent) ---
interface StepperProps {
  currentStage: number;
  stages?: { label: string; icon?: React.ReactNode }[];
}

export const ProgressStepper: React.FC<StepperProps> = ({ 
  currentStage,
  stages = [
    { label: 'Pre-Test' },
    { label: 'Content' },
    { label: 'Post-Test' },
    { label: 'Complete' }
  ]
}) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {stages.map((stage, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStage === stepNum;
        const isCompleted = currentStage > stepNum;

        return (
          <React.Fragment key={stepNum}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              isActive 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                : isCompleted 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
                  {stepNum}
                </span>
              )}
              <span className="text-sm font-bold hidden sm:block">{stage.label}</span>
            </div>
            {idx < stages.length - 1 && (
              <div className={`w-8 h-1 rounded-full transition-all ${
                currentStage > stepNum ? 'bg-green-200' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// --- ATTENDANCE CHIP BUTTONS ---
interface AttendanceChipsProps {
  value: 'present' | 'absent' | 'rescheduled' | '';
  onChange: (status: 'present' | 'absent' | 'rescheduled') => void;
  disabled?: boolean;
}

export const AttendanceChips: React.FC<AttendanceChipsProps> = ({ value, onChange, disabled }) => {
  const chips = [
    { status: 'present' as const, label: 'Present', color: 'green' },
    { status: 'rescheduled' as const, label: 'Rescheduled', color: 'yellow' },
    { status: 'absent' as const, label: 'Absent', color: 'red' }
  ];

  const getChipClasses = (status: string, color: string, isSelected: boolean) => {
    const baseClasses = 'px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer border-2';
    
    if (isSelected) {
      const selectedColors: Record<string, string> = {
        green: 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-200',
        yellow: 'bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-200',
        red: 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200'
      };
      return `${baseClasses} ${selectedColors[color]}`;
    }
    
    const unselectedColors: Record<string, string> = {
      green: 'bg-white text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300',
      yellow: 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300',
      red: 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300'
    };
    return `${baseClasses} ${unselectedColors[color]}`;
  };

  return (
    <div className="flex gap-2">
      {chips.map(chip => (
        <button
          key={chip.status}
          type="button"
          disabled={disabled}
          onClick={() => onChange(chip.status)}
          className={getChipClasses(chip.status, chip.color, value === chip.status)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
};

// --- CONFETTI CELEBRATION ---
export const Confetti: React.FC = () => {
  const colors = ['#9333EA', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 8 + Math.random() * 8;
        const rotation = Math.random() * 360;
        
        return (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${left}%`,
              top: '-20px',
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              transform: `rotate(${rotation}deg)`,
              animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// --- STICKY HEADER WRAPPER ---
interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
};