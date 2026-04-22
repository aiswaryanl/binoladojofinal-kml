import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const Switch = ({ checked, onChange, disabled }: SwitchProps) => {
  return (
    <label 
      className={`relative inline-flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked} 
        onChange={(e) => onChange(e)}
        disabled={disabled}
      />
      <div className="w-[44px] h-[22px] bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[22px] peer-checked:after:border-white after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all after:shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] peer-checked:bg-[#21f32f] shadow-[inset_0_0_10px_0_rgba(0,0,0,0.25)] border-[2px] border-transparent box-content"></div>
    </label>
  );
}

export default Switch;