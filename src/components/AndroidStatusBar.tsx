"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, Signal } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

export function AndroidStatusBar() {
  const [time, setTime] = useState('۱۰:۴۵');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(toPersianDigits(`${hours}:${minutes}`));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-8 px-5 flex items-center justify-between text-xs select-none bg-white border-b border-slate-100">
      {/* Time in Persian digits */}
      <span className="font-bold font-mono text-[11px] text-slate-700 tracking-wider">
        {time}
      </span>

      {/* Android Icons */}
      <div className="flex items-center gap-2 text-slate-600">
        <span className="text-[10px] font-mono font-black text-[#00A852]">5G</span>
        <Signal className="w-3.5 h-3.5 text-slate-600" />
        <Wifi className="w-3.5 h-3.5 text-slate-600" />
        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-700 font-bold">
          <span>{toPersianDigits('۱۰۰٪')}</span>
          <div className="w-4 h-2 rounded-[3px] border border-slate-500 p-[1px] flex items-center">
            <div className="w-full h-full bg-[#00D166] rounded-[1px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
