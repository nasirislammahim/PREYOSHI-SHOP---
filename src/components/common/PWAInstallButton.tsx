import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'footer';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Suppress button if already installed as standalone PWA
  if (isInstalled) return null;

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className={`bg-[#7A1238] text-white py-2.5 px-4 flex items-center justify-between text-xs sm:text-sm ${className}`}>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#D9A441]" />
            <span>Install <strong>PREYOSHI SHOP App</strong> for faster shopping & offline tracking!</span>
          </div>
          <button
            onClick={install}
            className="flex items-center gap-1.5 bg-[#D9A441] hover:bg-[#b88220] text-[#2A101A] font-semibold px-3 py-1 rounded-md text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border border-[#D9A441]/40 text-[#7A1238] hover:bg-[#F8E8E9] ${className}`}
        title="Install Preyoshi Shop on your device"
      >
        <Download className="w-3.5 h-3.5 text-[#BE0750]" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border border-[#D9A441]/40 text-[#7A1238] hover:bg-[#F8E8E9] ${className}`}
          title="Install Preyoshi Shop on iPhone"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#BE0750]" />
          <span className="hidden sm:inline">Install on iOS</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#FFF9F2] p-6 shadow-2xl border border-[#7A1238]/20">
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#7A1238] flex items-center justify-center text-[#D9A441] font-bold">
                  P
                </div>
                <div>
                  <h3 className="font-serif-brand font-bold text-gray-900">Install PREYOSHI SHOP</h3>
                  <p className="text-xs text-gray-600">On your iPhone / iPad Home Screen</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-gray-700 bg-white p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-[#BE0750] bg-[#F8E8E9] w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                  <span>Tap the <strong>Share button</strong> (square with an up arrow) in your Safari toolbar.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-[#BE0750] bg-[#F8E8E9] w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-[#BE0750] bg-[#F8E8E9] w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-4 w-full rounded-xl bg-[#7A1238] hover:bg-[#5f0c2a] py-2.5 text-xs font-semibold text-white transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
