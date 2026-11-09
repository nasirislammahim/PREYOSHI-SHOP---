import React, { useState } from 'react';
import { CheckCircle, Printer, ArrowRight, Package, PhoneCall, Copy, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InvoiceView } from './InvoiceView';

export const OrderSuccessModal: React.FC = () => {
  const { latestConfirmedOrder, setLatestConfirmedOrder, setCurrentView, setIsOrderTrackingOpen } = useStore();
  const [showInvoice, setShowInvoice] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!latestConfirmedOrder) return null;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(latestConfirmedOrder.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setLatestConfirmedOrder(null);
    setCurrentView('store');
  };

  const handleTrack = () => {
    setLatestConfirmedOrder(null);
    setIsOrderTrackingOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
        <div className="relative w-full max-w-lg bg-[#FFF9F2] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D9A441]/40 text-center space-y-5">
          {/* Success Animated Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-[#BE0750] font-bold font-serif-brand">
              অর্ডার সফলভাবে সম্পন্ন হয়েছে!
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-bangla text-[#2A101A] mt-1">
              ধন্যবাদ, {latestConfirmedOrder.customerName}!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-bangla mt-1">
              আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। আমাদের প্রতিনিধি শীঘ্রই আপনার মোবাইল নম্বরে কল করবেন।
            </p>
          </div>

          {/* Order Details Capsule */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs text-left space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">অর্ডার আইডি:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                <span>{latestConfirmedOrder.orderNumber}</span>
                <button
                  onClick={handleCopyId}
                  className="text-gray-400 hover:text-gray-700"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">মোবাইল নম্বর:</span>
              <span className="font-semibold text-gray-800">{latestConfirmedOrder.phone}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">পেমেন্ট পদ্ধতি:</span>
              <span className="font-semibold text-gray-800 uppercase">
                {latestConfirmedOrder.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : latestConfirmedOrder.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">ডেলিভারি ঠিকানা:</span>
              <span className="font-semibold text-gray-800 text-right truncate max-w-[200px]">
                {latestConfirmedOrder.deliveryAddress}, {latestConfirmedOrder.district}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-extrabold text-[#7A1238]">
              <span>মোট প্রদেয় বিল:</span>
              <span>৳{latestConfirmedOrder.grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setShowInvoice(true)}
              className="py-3 px-4 rounded-xl border border-[#7A1238] text-[#7A1238] hover:bg-[#F8E8E9] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>ইনভয়েস দেখুন ও প্রিন্ট</span>
            </button>

            <button
              onClick={handleTrack}
              className="py-3 px-4 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Package className="w-4 h-4 text-[#D9A441]" />
              <span>অর্ডার ট্র্যাক করুন</span>
            </button>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            হোম পেজে ফিরে যান
          </button>
        </div>
      </div>

      {showInvoice && (
        <InvoiceView order={latestConfirmedOrder} onClose={() => setShowInvoice(false)} />
      )}
    </>
  );
};
