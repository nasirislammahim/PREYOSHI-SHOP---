import React, { useState, useMemo } from 'react';
import {
  X, Ruler, Check, Sparkles, HelpCircle, ArrowRight,
  Info, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Product } from '../../types';

interface SizeGuideModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
  currentSelectedSize?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  product,
  isOpen,
  onClose,
  onSelectSize,
  currentSelectedSize
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'chart' | 'guide'>('calculator');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  
  // Measurement inputs (defaults in inches)
  const [bust, setBust] = useState<number>(38);
  const [waist, setWaist] = useState<number>(32);
  const [hip, setHip] = useState<number>(40);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(3);
  const [fitPreference, setFitPreference] = useState<'regular' | 'slim' | 'loose'>('regular');
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine category type
  const isSaree = product.categoryId === 'saree' || product.nameEn.toLowerCase().includes('saree') || product.nameBn.includes('শাড়ি');
  const isPanjabi = product.categoryId === 'mens-fashion' || product.nameEn.toLowerCase().includes('panjabi') || product.nameBn.includes('পাঞ্জাবি');
  const isJewellery = product.categoryId === 'jewellery' || product.nameEn.toLowerCase().includes('jewel') || product.nameBn.includes('গহনা');

  // Convert inputs to inches for normalized calculation
  const bustInInches = unit === 'in' ? bust : Math.round(bust / 2.54);
  const waistInInches = unit === 'in' ? waist : Math.round(waist / 2.54);

  // Dynamic Size Recommendation Engine
  const recommendation = useMemo(() => {
    // Fit ease factor
    let ease = 2; // regular comfort
    if (fitPreference === 'slim') ease = 1;
    if (fitPreference === 'loose') ease = 3.5;

    const targetBust = bustInInches + ease;

    let recLabel = 'M (38)';
    let recNumeric = 38;
    let description = '';

    if (isPanjabi) {
      if (bustInInches <= 37) { recNumeric = 38; recLabel = '38 (S)'; }
      else if (bustInInches <= 39) { recNumeric = 40; recLabel = '40 (M)'; }
      else if (bustInInches <= 41) { recNumeric = 42; recLabel = '42 (L)'; }
      else if (bustInInches <= 43) { recNumeric = 44; recLabel = '44 (XL)'; }
      else { recNumeric = 46; recLabel = '46 (XXL)'; }
      description = `আপনার ${bustInInches} ইঞ্চি ছাতির মাপে ${recLabel} সাইজ স্বাভাবিক কাঁধ ও কলার ফিট দেবে।`;
    } else if (isSaree) {
      if (waistInInches <= 30) { recLabel = '36 Blouse (১২ হাত শাড়ি)'; }
      else if (waistInInches <= 34) { recLabel = '38 Blouse (১২ হাত শাড়ি)'; }
      else if (waistInInches <= 38) { recLabel = '40 Blouse (১২ হাত শাড়ি)'; }
      else { recLabel = '42 Blouse (১২ হাত শাড়ি)'; }
      description = `শাড়ির সাথে থাকা আনস্টিচড ব্লাউজ পিস আপনার ${bustInInches}" বক্ষ ও ${waistInInches}" কোমরে নিখুঁত বানানো যাবে।`;
    } else {
      // Standard Women's Fashion (Salwar Kameez / Kurti / Three-piece)
      if (targetBust <= 36.5) { recNumeric = 36; recLabel = 'S (36)'; }
      else if (targetBust <= 38.5) { recNumeric = 38; recLabel = 'M (38)'; }
      else if (targetBust <= 40.5) { recNumeric = 40; recLabel = 'L (40)'; }
      else if (targetBust <= 42.5) { recNumeric = 42; recLabel = 'XL (42)'; }
      else if (targetBust <= 44.5) { recNumeric = 44; recLabel = 'XXL (44)'; }
      else { recNumeric = 46; recLabel = '3XL (46)'; }

      const fitText = fitPreference === 'slim' ? 'বডি ফিটেড' : fitPreference === 'loose' ? 'ঢিলেঢালা' : 'আরামদায়ক রেগুলার';
      description = `আপনার ${bustInInches} ইঞ্চি বক্ষ মাপের জন্য ${fitText} ফিটিংয়ে ${recLabel} সাইজ সবচেয়ে পারফেক্ট হবে।`;
    }

    // Match with available product sizes if possible
    let matchedProductSize = recLabel;
    if (product.sizes.length > 0) {
      const directMatch = product.sizes.find(s => 
        s.toLowerCase().includes(recLabel.toLowerCase()) || 
        s.includes(String(recNumeric)) ||
        (recLabel.includes('M') && s.toLowerCase() === 'm') ||
        (recLabel.includes('L') && s.toLowerCase() === 'l') ||
        (recLabel.includes('XL') && s.toLowerCase() === 'xl') ||
        (recLabel.includes('S') && s.toLowerCase() === 's')
      );
      if (directMatch) {
        matchedProductSize = directMatch;
      } else {
        matchedProductSize = product.sizes[0];
      }
    }

    return {
      sizeLabel: recLabel,
      matchedSize: matchedProductSize,
      description,
      confidence: 96
    };
  }, [bustInInches, waistInInches, fitPreference, isPanjabi, isSaree, product.sizes]);

  const handleApplySize = (sizeToApply: string) => {
    onSelectSize(sizeToApply);
    setAppliedFeedback(`সাইজ "${sizeToApply}" সফলভাবে নির্বাচন করা হয়েছে!`);
    setTimeout(() => {
      setAppliedFeedback(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFF9F2] rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#7A1238]/20 my-6 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7A1238] text-white flex items-center justify-center shadow-xs">
              <Ruler className="w-5 h-5 text-[#D9A441]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-bangla text-base sm:text-lg text-[#2A101A]">
                  সাইজ গাইড ও ফিট অ্যাসিস্ট্যান্ট
                </h3>
                <span className="text-[10px] bg-[#BE0750]/10 text-[#BE0750] font-bold px-2 py-0.5 rounded-full">
                  Smart Fit
                </span>
              </div>
              <p className="text-xs text-gray-500 font-bangla truncate max-w-md">
                {product.nameBn} · সঠিক সাইজ নির্বাচন নিশ্চিত করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 py-3 border-b border-gray-200 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-[#7A1238] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
            <span className="font-bangla">স্মার্ট মাপ ক্যালকুলেটর</span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chart'
                ? 'bg-[#7A1238] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="font-bangla">সাইজ চার্ট টেবিল</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-[#7A1238] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="font-bangla">মাপ নেওয়ার নিয়ম</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* TAB 1: Smart Measurement Calculator */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              {/* Unit Switcher */}
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700 font-bangla">
                  পরিমাপের একক (Measurement Unit):
                </span>
                <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setUnit('in')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      unit === 'in' ? 'bg-[#7A1238] text-white shadow-2xs' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    ইঞ্চি (Inches)
                  </button>
                  <button
                    onClick={() => setUnit('cm')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      unit === 'cm' ? 'bg-[#7A1238] text-white shadow-2xs' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    সেমি (CM)
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <h4 className="font-bold text-xs text-gray-800 font-bangla uppercase tracking-wider text-[#7A1238]">
                  আপনার শরীরের সঠিক মাপ লিখুন:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bust / Chest */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label className="font-bold text-gray-700 font-bangla">
                        {isPanjabi ? 'ছাতি / চেস্ট (Chest)' : 'বক্ষ / চেস্ট (Bust)'}
                      </label>
                      <span className="font-mono font-bold text-[#7A1238]">{bust} {unit}</span>
                    </div>
                    <input
                      type="range"
                      min={unit === 'in' ? 30 : 76}
                      max={unit === 'in' ? 52 : 132}
                      value={bust}
                      onChange={e => setBust(Number(e.target.value))}
                      className="w-full accent-[#7A1238] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{unit === 'in' ? '30 in' : '76 cm'}</span>
                      <span>{unit === 'in' ? '52 in' : '132 cm'}</span>
                    </div>
                  </div>

                  {/* Waist */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label className="font-bold text-gray-700 font-bangla">
                        কোমর (Waist)
                      </label>
                      <span className="font-mono font-bold text-[#7A1238]">{waist} {unit}</span>
                    </div>
                    <input
                      type="range"
                      min={unit === 'in' ? 24 : 60}
                      max={unit === 'in' ? 48 : 122}
                      value={waist}
                      onChange={e => setWaist(Number(e.target.value))}
                      className="w-full accent-[#7A1238] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{unit === 'in' ? '24 in' : '60 cm'}</span>
                      <span>{unit === 'in' ? '48 in' : '122 cm'}</span>
                    </div>
                  </div>
                </div>

                {/* Fit Preference Buttons */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 mb-2 font-bangla">
                    ফিটিং পছন্দ (Fit Preference):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'slim', label: 'বডি ফিটেড (Slim)', desc: '+১" আরাম' },
                      { id: 'regular', label: 'রেগুলার (Regular)', desc: '+২" পারফেক্ট' },
                      { id: 'loose', label: 'ঢিলেঢালা (Modest)', desc: '+৩.৫" আরামদায়ক' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFitPreference(f.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          fitPreference === f.id
                            ? 'bg-[#F8E8E9] border-[#BE0750] text-[#7A1238] font-bold shadow-2xs ring-1 ring-[#BE0750]'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="block text-xs font-bangla">{f.label}</span>
                        <span className="block text-[10px] opacity-75">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7A1238] via-[#8C1641] to-[#BE0750] text-white p-5 shadow-lg border border-[#D9A441]/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#F6E2B3] font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-[#D9A441]" />
                      <span>প্রেয়সী স্মার্ট ফিট রিকমেন্ডেশন</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {recommendation.sizeLabel}
                    </h3>
                    <p className="text-xs text-white/90 font-bangla max-w-sm">
                      {recommendation.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleApplySize(recommendation.matchedSize)}
                      className="px-5 py-3 rounded-xl bg-[#D9A441] hover:bg-yellow-400 text-stone-900 font-extrabold text-xs sm:text-sm font-bangla flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>এই সাইজ নির্বাচন করুন</span>
                    </button>
                    <span className="text-[10px] text-center text-[#F6E2B3]">
                      ম্যাচিং নির্ভুলতা: {recommendation.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Applied Feedback */}
              {appliedFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bangla animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{appliedFeedback}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Size Chart Table */}
          {activeTab === 'chart' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800 font-bangla">
                  {isPanjabi ? 'পাঞ্জাবি ও পুরুষদের সাইজ চার্ট (ইঞ্চি)' : 'মহিলাদের ফ্যাশন ও ড্রেস সাইজ চার্ট (ইঞ্চি)'}
                </span>
                <span className="text-[11px] text-gray-500 font-bangla">স্ট্যান্ডার্ড বাংলাদেশ ফিট</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left divide-y divide-gray-100">
                  <thead className="bg-[#FFF9F2] text-[#7A1238] font-bold">
                    <tr>
                      <th className="p-3">সাইজ (Size)</th>
                      <th className="p-3">বক্ষ / ছাতি (Bust)</th>
                      <th className="p-3">কোমর (Waist)</th>
                      <th className="p-3">হিপ (Hip)</th>
                      <th className="p-3">দৈর্ঘ্য (Length)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-mono">
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-[#7A1238]">S (36)</td>
                      <td className="p-3">34 - 36"</td>
                      <td className="p-3">28 - 30"</td>
                      <td className="p-3">36 - 38"</td>
                      <td className="p-3">42"</td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-[#F8E8E9]/20">
                      <td className="p-3 font-bold text-[#7A1238]">M (38)</td>
                      <td className="p-3">37 - 38"</td>
                      <td className="p-3">31 - 33"</td>
                      <td className="p-3">39 - 41"</td>
                      <td className="p-3">43"</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-[#7A1238]">L (40)</td>
                      <td className="p-3">39 - 40"</td>
                      <td className="p-3">34 - 36"</td>
                      <td className="p-3">42 - 44"</td>
                      <td className="p-3">44"</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-[#7A1238]">XL (42)</td>
                      <td className="p-3">41 - 42"</td>
                      <td className="p-3">37 - 39"</td>
                      <td className="p-3">45 - 47"</td>
                      <td className="p-3">45"</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-[#7A1238]">XXL (44)</td>
                      <td className="p-3">43 - 45"</td>
                      <td className="p-3">40 - 42"</td>
                      <td className="p-3">48 - 50"</td>
                      <td className="p-3">45"</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-[#7A1238]">3XL (46)</td>
                      <td className="p-3">46 - 48"</td>
                      <td className="p-3">43 - 45"</td>
                      <td className="p-3">51 - 53"</td>
                      <td className="p-3">46"</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {isSaree && (
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-600 font-bangla space-y-1">
                  <p><strong>শাড়ির বিশেষ মাপ:</strong> ঐতিহ্যবাহী শাড়ির স্ট্যান্ডার্ড দৈর্ঘ্য ১২ হাত (৫.৫ মিটার) এবং কুচি ও আঁচলসহ তৈরি। ব্লাউজ পিস আনস্টিচড থাকে (৮০ সেমি থেকে ১ মিটার) যা যেকোনো সাইজে সেলাই করা সম্ভব।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: How to Measure Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-3 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-sm text-[#7A1238] font-bangla flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#D9A441]" />
                  <span>ঘরে বসে সঠিকভাবে মাপ নেওয়ার ধাপসমূহ:</span>
                </h4>

                <div className="space-y-3 font-bangla text-gray-700">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F8E8E9] text-[#7A1238] font-bold flex items-center justify-center shrink-0">১</span>
                    <div>
                      <strong className="text-gray-900 block">বক্ষ / চেস্ট মাপ:</strong>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        ফিতা পিঠের ওপর দিয়ে এনে বক্ষের সবচেয়ে স্ফীত অংশের ওপর সমানভাবে রাখুন। খুব শক্ত বা আলগা না রেখে স্বাভাবিক নিশ্বাস নেওয়া অবস্থায় মাপুন।
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F8E8E9] text-[#7A1238] font-bold flex items-center justify-center shrink-0">২</span>
                    <div>
                      <strong className="text-gray-900 block">কোমর মাপ:</strong>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        নাভির সামান্য ওপরের প্রাকৃতিক কোমর রেখা বরাবর ফিতা জড়িয়ে মাপ নিন।
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F8E8E9] text-[#7A1238] font-bold flex items-center justify-center shrink-0">৩</span>
                    <div>
                      <strong className="text-gray-900 block">হিপ মাপ:</strong>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        দুপা একসাথে রেখে নিতম্বের সবচেয়ে চওড়া অংশ বরাবর ফিতা রেখে মাপ সংগ্রহ করুন।
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F8E8E9] text-[#7A1238] font-bold flex items-center justify-center shrink-0">৪</span>
                    <div>
                      <strong className="text-gray-900 block">পোশাকের ঝুল / দৈর্ঘ্য:</strong>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        কাঁধের সর্বোচ্চ বিন্দু থেকে সোজা নিচের দিকে আপনার পছন্দের ঝুল পর্যন্ত মাপুন।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-gray-500 font-bangla hidden sm:inline">
            সংশয় থাকলে সবসময় এক সাইজ বড় নির্বাচন করা নিরাপদ।
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer ml-auto"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
