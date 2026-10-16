import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share2 } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    }
  };

  if (!isInstallable && !isIOS && !installSuccess) {
    // If not promptable yet, display an Android APK / Web App installation badge on banner/card
    if (variant === 'banner') {
      return (
        <div className="bg-emerald-900 text-white px-4 py-3 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="font-semibold text-sm">Install FindIt Campus</p>
              <p className="text-xs text-emerald-200">Instant access from your Android or iOS home screen</p>
            </div>
          </div>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-3 py-1.5 rounded-lg transition"
          >
            How to Install
          </button>
          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-stone-900 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-700" />
                    <h3 className="font-bold text-base">Install App on Phone</h3>
                  </div>
                  <button onClick={() => setShowIOSGuide(false)} className="p-1 hover:bg-stone-100 rounded-lg text-stone-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-stone-600">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="font-semibold text-stone-900 mb-1">Android (Chrome / Edge):</p>
                    <p>Tap the <strong>three dots menu (⋮)</strong> at top right &gt; tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="font-semibold text-stone-900 mb-1">iPhone / iPad (Safari):</p>
                    <p>Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> &gt; tap <strong>Add to Home Screen</strong>.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full rounded-xl bg-emerald-800 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 transition"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'navbar' && (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 rounded-xl bg-emerald-800/10 hover:bg-emerald-800/20 text-emerald-900 border border-emerald-800/20 px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${className}`}
          title="Install FindIt Campus app to device"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className={`bg-gradient-to-r from-emerald-900 to-[#133e2b] text-white p-4 rounded-2xl flex items-center justify-between shadow-lg ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="font-bold text-sm">Install FindIt Campus App</p>
              <p className="text-xs text-emerald-200">Add to your home screen for quick offline campus access</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs transition active:scale-95 shadow"
          >
            <Smartphone className="w-4 h-4" />
            <span>Install</span>
          </button>
        </div>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-stone-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 hover:bg-stone-100 rounded-lg text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-stone-600">
              <p>To install FindIt Campus as a full-screen app on iOS:</p>
              <div className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">1</span>
                <p>Tap the <strong>Share</strong> button <Share2 className="w-4 h-4 inline text-blue-600" /> in Safari’s bottom toolbar.</p>
              </div>
              <div className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">2</span>
                <p>Scroll down and select <strong>Add to Home Screen</strong>.</p>
              </div>
              <div className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">3</span>
                <p>Tap <strong>Add</strong> at the top right corner.</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-emerald-800 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {installSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-800 text-white px-4 py-2.5 rounded-full shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>App installed to your device successfully!</span>
        </div>
      )}
    </>
  );
};
