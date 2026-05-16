'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function MacTitleBar() {
  const [isHovered, setIsHovered] = useState(false);

  const handleTrafficLightClick = (action: 'close' | 'minimize' | 'maximize') => {
    // Add your logic: close = sign out, minimize = collapse sidebar, maximize = fullscreen toggle
    console.log(`Traffic light clicked: ${action}`);
    // TODO: wire to actual app actions (e.g. signOut, toggleSidebar, toggleFullScreen)
  };

  return (
    <div 
      className="mac-title-bar liquid-glass flex items-center px-3 h-11 border-b border-white/10 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Traffic Lights */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleTrafficLightClick('close')}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all shadow-inner flex items-center justify-center"
          title="Close window"
        >
          {isHovered && <span className="text-[9px] leading-none text-red-950 font-bold">×</span>}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleTrafficLightClick('minimize')}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 transition-all shadow-inner"
          title="Minimize / Collapse sidebar"
        />
        
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleTrafficLightClick('maximize')}
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 transition-all shadow-inner"
          title="Maximize / Fullscreen mode"
        />
      </div>

      {/* App Name - SF Pro style */}
      <div className="flex-1 text-center text-[13px] font-medium text-white/95 tracking-[-0.02em]">
        Qunt Edge
      </div>

      {/* Right spacer for balance */}
      <div className="w-[72px]"></div>
    </div>
  );
}
