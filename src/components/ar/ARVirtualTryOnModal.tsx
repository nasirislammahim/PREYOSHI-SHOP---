import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Camera, RefreshCw, Sparkles, Download, Share2, ShoppingBag,
  Sliders, Move, RotateCw, ZoomIn, Check, AlertCircle, Eye, ChevronRight, Upload
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

// Preset sample portrait models if camera unavailable or user prefers testing on model
const SAMPLE_MODELS = [
  {
    id: 'model-1',
    name: 'মডেল ১ (ব্রাইডাল পোট্রেট)',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-2',
    name: 'মডেল ২ (এলিগ্যান্ট পোট্রেট)',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  }
];

// High fidelity transparent vector assets for virtual try-on
const JEWELLERY_OVERLAYS: Record<string, { type: 'necklace' | 'earrings' | 'headpiece' | 'sunglasses'; svgPath: string }> = {
  choker: {
    type: 'necklace',
    svgPath: 'necklace'
  },
  earrings: {
    type: 'earrings',
    svgPath: 'earrings'
  },
  pearls: {
    type: 'necklace',
    svgPath: 'pearls'
  }
};

export const ARVirtualTryOnModal: React.FC = () => {
  const {
    isARModalOpen,
    closeARTryOn,
    arProduct,
    products,
    addToCart,
    setIsCartOpen,
    setCurrentView
  } = useStore();

  const [activeProduct, setActiveProduct] = useState<Product | null>(arProduct);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedModelImg, setSelectedModelImg] = useState<string | null>(null);
  
  // Placement adjustment parameters
  const [scale, setScale] = useState(1.0);
  const [posX, setPosX] = useState(50); // percentage 0-100
  const [posY, setPosY] = useState(68); // percentage 0-100 (neckline default)
  const [rotation, setRotation] = useState(0); // degrees
  const [showGuide, setShowGuide] = useState(true);
  const [shimmer, setShimmer] = useState(true);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync active product when arProduct prop changes
  useEffect(() => {
    if (arProduct) {
      setActiveProduct(arProduct);
      // Auto adjust default vertical position based on product type
      const isEarring = arProduct.nameEn.toLowerCase().includes('jhumka') || arProduct.nameEn.toLowerCase().includes('earring') || arProduct.nameBn.includes('দুল');
      if (isEarring) {
        setPosY(48);
        setScale(0.9);
      } else {
        setPosY(68);
        setScale(1.0);
      }
    }
  }, [arProduct]);

  // Start webcam stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
        setSelectedModelImg(null);
      } else {
        setCameraError('আপনার ব্রাউজার ক্যামেরা সাপোর্ট করে না। ডেমো মডেল ছবি ব্যবহার করুন।');
        setSelectedModelImg(SAMPLE_MODELS[0].image);
      }
    } catch (err: any) {
      console.warn('Webcam permission denied or unavailable:', err);
      setCameraError('ক্যামেরা পারমিশন পাওয়া যায়নি। ডেমো মডেল বা নিজের ছবি আপলোড করে ট্রাই-অন করুন।');
      setSelectedModelImg(SAMPLE_MODELS[0].image);
      setCameraActive(false);
    }
  }, []);

  // Stop webcam stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Modal open/close lifecycle
  useEffect(() => {
    if (isARModalOpen) {
      startCamera();
      setCapturedSnapshot(null);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isARModalOpen, startCamera, stopCamera]);

  if (!isARModalOpen) return null;

  // Filter jewellery & accessories for switcher
  const jewelleryProducts = products.filter(
    p => p.categoryId === 'jewellery' || p.categoryId === 'bags-accessories'
  );

  const currentProd = activeProduct || jewelleryProducts[0] || products[0];
  const isEarring = currentProd.nameEn.toLowerCase().includes('jhumka') || currentProd.nameEn.toLowerCase().includes('earring') || currentProd.nameBn.includes('দুল');

  // Handle Photo Upload from user
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedModelImg(event.target?.result as string);
        stopCamera();
        setCameraError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Dragging support on preview
  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosX(Math.max(10, Math.min(90, x)));
    setPosY(Math.max(15, Math.min(85, y)));
  };

  // Capture combined snapshot
  const handleTakeSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background (video or model image)
    if (cameraActive && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else if (selectedModelImg) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedModelImg;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#2A101A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw branded watermark
    ctx.fillStyle = 'rgba(122, 18, 56, 0.85)';
    ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
    ctx.fillStyle = '#D9A441';
    ctx.font = 'bold 20px Hind Siliguri, sans-serif';
    ctx.fillText('PREYOSHI SHOP · ভার্চুয়াল ট্রাই-অন', 25, canvas.height - 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px sans-serif';
    ctx.fillText(currentProd.nameEn, 25, canvas.height - 12);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedSnapshot(dataUrl);
  };

  const handleDownloadSnapshot = () => {
    if (!capturedSnapshot) return;
    const a = document.createElement('a');
    a.href = capturedSnapshot;
    a.download = `Preyoshi-TryOn-${currentProd.sku || 'Jewellery'}.jpg`;
    a.click();
  };

  const handleAddToCart = () => {
    addToCart(currentProd, 1);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(currentProd, 1);
    closeARTryOn();
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#1C0913] rounded-3xl shadow-2xl border-2 border-[#D9A441]/40 my-4 max-h-[95vh] flex flex-col overflow-hidden text-white">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-[#7A1238] via-[#8C1641] to-[#BE0750] border-b border-[#D9A441]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D9A441] text-stone-900 flex items-center justify-center font-bold shadow-md">
              <Camera className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-bangla text-white">
                  AR ভার্চুয়াল ট্রাই-অন স্টুডিও (Live Jewellery Try-On)
                </h3>
                <span className="text-[10px] bg-white/20 text-[#F6E2B3] font-bold px-2 py-0.5 rounded-full border border-white/20">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-white/80 font-bangla">
                ক্যামেরা চালু করে দেখুন কুন্দন নেকলেস ও গহনা আপনাকে কেমন মানাচ্ছে
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeARTryOn}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main AR Studio Viewport & Sidebar Controls */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto">
          {/* Left / Center: Interactive Live Camera Viewport */}
          <div className="lg:col-span-8 p-3 sm:p-5 flex flex-col items-center justify-center bg-black/40">
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerMove={handlePointerMove}
              className="relative w-full aspect-3/4 max-w-sm sm:max-w-md rounded-3xl overflow-hidden bg-neutral-900 border-2 border-[#D9A441]/40 shadow-2xl select-none touch-none cursor-move group"
            >
              {/* Camera Video Stream */}
              {cameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}

              {/* Model Image Fallback */}
              {!cameraActive && selectedModelImg && (
                <img
                  src={selectedModelImg}
                  alt="Model Portrait"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Face & Neck Guide Overlay (optional) */}
              {showGuide && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-40">
                  <div className="w-48 h-64 rounded-[50%] border-2 border-dashed border-[#D9A441] flex flex-col items-center justify-between py-6">
                    <span className="text-[10px] font-bold text-[#F6E2B3] bg-black/50 px-2 py-0.5 rounded-full font-bangla">
                      মুখমণ্ডল রাখুন
                    </span>
                    <span className="text-[10px] font-bold text-[#F6E2B3] bg-black/50 px-2 py-0.5 rounded-full font-bangla">
                      গলা ও কলারবোন
                    </span>
                  </div>
                </div>
              )}

              {/* Dynamic Interactive Jewellery Overlay */}
              <div
                style={{
                  position: 'absolute',
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
                className="pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
              >
                {/* Visual Jewellery Graphic Render */}
                <div className="relative">
                  {/* Shimmer light effect */}
                  {shimmer && (
                    <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-[#D9A441]/30 to-transparent blur-xs animate-pulse" />
                  )}

                  {isEarring ? (
                    // Pair of Meenakari / Kundan Jhumka Earrings
                    <div className="flex justify-between w-48 px-2">
                      <div className="w-14 h-20 rounded-2xl overflow-hidden border-2 border-[#D9A441] shadow-xl bg-white/95 p-1 flex items-center justify-center">
                        <img
                          src={currentProd.images[0]}
                          alt="Earring Left"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-14 h-20 rounded-2xl overflow-hidden border-2 border-[#D9A441] shadow-xl bg-white/95 p-1 flex items-center justify-center scale-x-[-1]">
                        <img
                          src={currentProd.images[0]}
                          alt="Earring Right"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    // Kundan Choker / Royal Necklace
                    <div className="w-56 sm:w-64 aspect-5/4 rounded-3xl overflow-hidden border-2 border-[#D9A441] shadow-2xl bg-white/95 p-2 flex flex-col items-center justify-center relative">
                      <img
                        src={currentProd.images[0]}
                        alt={currentProd.nameEn}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-1.5 right-2 text-[8px] bg-[#BE0750] text-white px-1.5 py-0.2 rounded-md font-bold">
                        24K GOLD PLATED
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Camera Status / Tip Banner */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-bangla pointer-events-none">
                <span className="bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                  <Move className="w-3 h-3 text-[#D9A441]" />
                  <span>স্ক্রিনে টেনে সঠিক জায়গায় বসান</span>
                </span>
                {cameraActive && (
                  <span className="bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>লাইভ ক্যামেরা</span>
                  </span>
                )}
              </div>

              {/* Camera Error / Fallback Notice */}
              {cameraError && (
                <div className="absolute top-12 left-3 right-3 bg-red-950/90 border border-red-500/50 p-2.5 rounded-2xl text-[11px] text-red-200 font-bangla flex items-center justify-between gap-2 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-2 py-1 bg-white text-red-900 rounded-lg font-bold text-[10px] shrink-0 pointer-events-auto"
                  >
                    পুনরায় চেষ্টা
                  </button>
                </div>
              )}
            </div>

            {/* Quick Action Snapshot & Mode Bar */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleTakeSnapshot}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#D9A441] to-yellow-400 text-stone-900 font-extrabold text-xs sm:text-sm font-bangla flex items-center gap-2 transition-transform hover:scale-105 shadow-xl cursor-pointer"
              >
                <Camera className="w-4 h-4 text-stone-900" />
                <span>ছবি তুলুন (Capture Look)</span>
              </button>

              {cameraActive ? (
                <button
                  onClick={() => {
                    stopCamera();
                    setSelectedModelImg(SAMPLE_MODELS[0].image);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bangla text-white transition-colors cursor-pointer"
                >
                  মডেল মোড
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-3 py-2 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-xs font-bangla text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-[#F6E2B3]" />
                  <span>ক্যামেরা চালু করুন</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="নিজের ছবি আপলোড করুন"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Sidebar: Adjustments, Product Details, & Presets */}
          <div className="lg:col-span-4 p-4 sm:p-5 bg-[#250d1a] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between space-y-5">
            {/* 1. Adjustment Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-xs font-bangla text-[#D9A441] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>গহনা এডজাস্টমেন্ট (Fitting Controls)</span>
                </span>
                <button
                  onClick={() => {
                    setScale(1.0);
                    setPosX(50);
                    setPosY(isEarring ? 48 : 68);
                    setRotation(0);
                  }}
                  className="text-[10px] text-gray-400 hover:text-white underline font-bangla"
                >
                  রিসেট
                </button>
              </div>

              {/* Scale Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300 font-bangla">
                  <span>আকার (Size/Zoom):</span>
                  <span className="font-mono text-[#D9A441]">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-[#D9A441] cursor-pointer"
                />
              </div>

              {/* Vertical Height Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300 font-bangla">
                  <span>উচ্চতা (Vertical Height):</span>
                  <span className="font-mono text-[#D9A441]">{Math.round(posY)}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="85"
                  value={posY}
                  onChange={(e) => setPosY(parseInt(e.target.value, 10))}
                  className="w-full accent-[#D9A441] cursor-pointer"
                />
              </div>

              {/* Tilt / Rotation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300 font-bangla">
                  <span>ঘূর্ণন কোণ (Tilt Angle):</span>
                  <span className="font-mono text-[#D9A441]">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  className="w-full accent-[#D9A441] cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bangla border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    showGuide ? 'bg-[#D9A441]/20 border-[#D9A441] text-[#F6E2B3]' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{showGuide ? 'গাইড বন্ধ' : 'ফেস গাইড চালু'}</span>
                </button>

                <button
                  onClick={() => setShimmer(!shimmer)}
                  className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bangla border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    shimmer ? 'bg-[#BE0750]/20 border-[#BE0750] text-[#F6E2B3]' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#D9A441]" />
                  <span>গোল্ড গ্লো ইফেক্ট</span>
                </button>
              </div>
            </div>

            {/* 2. Currently Selected Product Details & Instant Buy */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentProd.images[0]}
                  alt={currentProd.nameEn}
                  className="w-14 h-16 object-cover rounded-xl border border-white/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs font-bangla text-white truncate">
                    {currentProd.nameBn}
                  </h4>
                  <p className="text-[10px] text-gray-400 truncate">{currentProd.nameEn}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-extrabold text-sm text-[#F6E2B3]">
                      ৳{(currentProd.discountPrice ?? currentProd.regularPrice).toLocaleString()}
                    </span>
                    {currentProd.discountPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ৳{currentProd.regularPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs font-bangla flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/15"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>কার্ট-এ নিন</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-2 px-3 rounded-xl bg-[#BE0750] hover:bg-[#7A1238] text-white font-bold text-xs font-bangla flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-md"
                >
                  <span>এখনই কিনুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Jewellery Item Switcher (Horizontal Thumbnails) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-300 font-bangla">
                <span>অন্যান্য গহনা ট্রাই করুন:</span>
                <span className="text-[10px] text-[#D9A441]">{jewelleryProducts.length} টি উপলব্ধ</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {jewelleryProducts.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => {
                      setActiveProduct(j);
                      const isJhumka = j.nameEn.toLowerCase().includes('jhumka') || j.nameEn.toLowerCase().includes('earring');
                      setPosY(isJhumka ? 48 : 68);
                    }}
                    className={`w-14 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer p-0.5 bg-neutral-900 ${
                      currentProd.id === j.id
                        ? 'border-[#D9A441] scale-105 shadow-md ring-2 ring-[#D9A441]/30'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                    title={j.nameBn}
                  >
                    <img src={j.images[0]} alt={j.nameEn} className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Captured Snapshot Modal Overlay */}
        {capturedSnapshot && (
          <div className="absolute inset-0 z-50 bg-black/90 p-4 sm:p-6 flex flex-col items-center justify-center animate-fade-in">
            <div className="relative max-w-sm w-full bg-[#1C0913] rounded-3xl overflow-hidden border-2 border-[#D9A441] shadow-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-sm font-bangla text-[#F6E2B3] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D9A441]" />
                  <span>আপনার ট্রাই-অন ফটো</span>
                </span>
                <button
                  onClick={() => setCapturedSnapshot(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/20 shadow-md">
                <img src={capturedSnapshot} alt="Snapshot Preview" className="w-full h-auto object-cover" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleDownloadSnapshot}
                  className="py-2.5 px-3 rounded-xl bg-[#D9A441] hover:bg-yellow-400 text-stone-900 font-extrabold text-xs font-bangla flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ডাউনলোড করুন</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`প্রেয়সী শপে এই গহনা ট্রাই করেছি, কেমন লাগছে? দেখুন: ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs font-bangla flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে শেয়ার</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
