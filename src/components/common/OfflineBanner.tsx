import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-[#7A1238] border border-[#D9A441] px-4 py-2.5 text-xs font-medium text-white shadow-xl animate-fade-in">
      <WifiOff className="w-4 h-4 text-[#D9A441] animate-pulse" />
      <div>
        <span className="font-semibold">Offline Mode Active</span>
        <span className="hidden sm:inline text-white/80"> — Browsing cached products. Online orders synchronize when reconnected.</span>
      </div>
    </div>
  );
};
