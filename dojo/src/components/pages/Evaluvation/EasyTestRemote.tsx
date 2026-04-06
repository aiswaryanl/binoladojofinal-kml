import React, { useEffect } from 'react';

interface EasyTestRemoteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const EasyTestRemote: React.FC<EasyTestRemoteProps> = ({ value, onChange, onSubmit }) => {

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow number keys
      if (/^[0-9]$/.test(e.key)) {
        onChange(value + e.key);
      }
      // Backspace
      if (e.key === 'Backspace') {
        onChange(value.slice(0, -1));
      }
      // Enter
      if (e.key === 'Enter') {
        onSubmit();
      }
      // 'c' or 'C' for Clear
      if (e.key.toLowerCase() === 'c') {
        onChange('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange, onSubmit]);

  const handleNumClick = (num: string) => {
    onChange(value + num);
  };

  const handleClear = () => {
    onChange(''); // Clear all
  };

  const Button = ({ 
    label, 
    subLabel, 
    color = "black", 
    onClick, 
    colSpan = 1 
  }: { 
    label: string | React.ReactNode; 
    subLabel?: string; 
    color?: "black" | "green" | "red"; 
    onClick: () => void;
    colSpan?: number;
  }) => {
    
    const bgColors = {
      black: "bg-gradient-to-b from-gray-800 to-black border-gray-700",
      green: "bg-gradient-to-b from-green-400 to-green-600 border-green-500",
      red: "bg-gradient-to-b from-orange-500 to-red-600 border-red-500"
    };

    return (
      <button
        onClick={(e) => {
            e.preventDefault(); // Prevent form submission if inside a form
            onClick();
        }}
        className={`
          relative flex flex-col items-center justify-center h-14 
          ${bgColors[color]} 
          rounded-md shadow-md active:scale-95 active:shadow-inner transition-transform duration-75
          border-b-4 border-r-2 border-l-2
          ${colSpan === 2 ? 'col-span-2 w-full' : 'w-full'}
        `}
      >
        <span className="text-xl font-bold text-white drop-shadow-md">{label}</span>
        {subLabel && (
          <span className="absolute bottom-1 right-2 text-[10px] font-medium text-gray-300">
            {subLabel}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex justify-center select-none">
      {/* Casing */}
      <div className="relative w-64 bg-white rounded-3xl p-3 shadow-2xl border-4 border-gray-200">
        
        {/* Black Faceplate */}
        <div className="bg-black rounded-2xl h-full p-4 flex flex-col items-center shadow-inner">
          
          {/* Brand Logo */}
          <div className="mb-4 text-center">
            <h3 className="text-white font-serif text-xl tracking-wide italic">
              EasyTest<sup className="text-[10px] not-italic sans-serif">TM</sup>
            </h3>
          </div>

          {/* LCD Screen */}
          <div className="w-full bg-[#9ea792] h-16 mb-6 rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-end px-4 border-4 border-gray-800 relative overflow-hidden">
            {/* Screen Glare effect */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10 pointer-events-none"></div>
            
            <span className="font-mono text-3xl tracking-widest text-black opacity-90">
              {value || ""}
              <span className="animate-pulse">_</span>
            </span>
          </div>

          {/* Controls Grid */}
          <div className="w-full grid grid-cols-3 gap-3">
            
            {/* Action Buttons Row */}
            <div className="col-span-3 grid grid-cols-2 gap-4 mb-2">
              <Button label="OK" color="green" onClick={onSubmit} />
              <Button label="C" color="red" onClick={handleClear} />
            </div>

            {/* Numeric Keypad */}
            <Button label="1" subLabel="A" onClick={() => handleNumClick('1')} />
            <Button label="2" subLabel="B" onClick={() => handleNumClick('2')} />
            <Button label="3" subLabel="C" onClick={() => handleNumClick('3')} />

            <Button label="4" subLabel="D" onClick={() => handleNumClick('4')} />
            <Button label="5" subLabel="E" onClick={() => handleNumClick('5')} />
            <Button label="6" subLabel="F" onClick={() => handleNumClick('6')} />

            <Button label="7" subLabel="G" onClick={() => handleNumClick('7')} />
            <Button label="8" subLabel="H" onClick={() => handleNumClick('8')} />
            <Button label="9" subLabel="I" onClick={() => handleNumClick('9')} />

            {/* Bottom Row */}
            <div className="flex items-center justify-center">
                <span className="text-white text-xs">↑ .</span>
            </div>
            <Button label="0" subLabel="📄" onClick={() => handleNumClick('0')} />
            <div className="flex items-center justify-center">
                <span className="text-white text-xs">↓ CH</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EasyTestRemote;