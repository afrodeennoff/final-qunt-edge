import { X, Minus, Square } from 'lucide-react';

export default function MacTitleBar() {
  return (
    <div className="mac-title-bar h-[52px] bg-[oklch(0.09_0.01_260/0.85)] backdrop-blur-[40px] border-b border-white/10 flex items-center px-4 select-none z-50 sticky top-0">
      {/* Traffic Lights */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => window.close()}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-[10px] text-red-900/70"
        >
          <X className="w-2 h-2 opacity-0 hover:opacity-100" />
        </button>
        <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" />
        <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
      </div>

      {/* Window Title */}
      <div className="flex-1 text-center text-sm font-medium text-white/80 tracking-tight">
        Qunt Edge
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3 text-white/70">
        {/* Add any custom controls here */}
      </div>
    </div>
  );
}
