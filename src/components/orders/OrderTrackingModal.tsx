import React, { useState } from 'react';
import {
  X, Search, Package, CheckCircle2, Clock, Truck,
  Check, AlertCircle, Printer, ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { InvoiceView } from './InvoiceView';

export const OrderTrackingModal: React.FC = () => {
  const { isOrderTrackingOpen, setIsOrderTrackingOpen, trackOrder, orders } = useStore();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  if (!isOrderTrackingOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    const found = trackOrder(orderIdInput, phoneInput || undefined);
    setTrackedOrder(found);
    setHasSearched(true);
  };

  const statusSteps: { key: OrderStatus; labelBn: string; desc: string }[] = [
    { key: 'pending', labelBn: 'অর্ডার গৃহিত', desc: 'অর্ডার সফলভাবে প্লেস হয়েছে' },
    { key: 'confirmed', labelBn: 'অর্ডার নিশ্চিত', desc: 'ফোন কলে অর্ডার কনফার্মড' },
    { key: 'processing', labelBn: 'প্যাকিং চলছে', desc: 'পার্সেল প্রস্তুত করা হচ্ছে' },
    { key: 'shipped', labelBn: 'কুরিয়ারে হস্তান্তর', desc: 'ডেলিভারি রাইডারের কাছে হস্তান্তর' },
    { key: 'delivered', labelBn: 'ডেলিভারি সম্পন্ন', desc: 'গ্রাহকের নিকট সফল ডেলিভারি' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(s => s.key === status);
  };

  const currentStepIdx = trackedOrder ? getStepIndex(trackedOrder.status) : 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-[#FFF9F2] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#7A1238]/20 my-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#7A1238] text-white flex items-center justify-center shadow-xs">
                <Package className="w-5 h-5 text-[#D9A441]" />
              </div>
              <div>
                <h3 className="font-bold font-bangla text-base sm:text-lg text-[#2A101A]">
                  লাইভ পার্সেল ও অর্ডার ট্র্যাকিং
                </h3>
                <p className="text-xs text-gray-500 font-bangla">
                  আপনার অর্ডার আইডি ও ফোন নম্বর দিয়ে স্ট্যাটাস জানুন
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOrderTrackingOpen(false);
                setTrackedOrder(null);
                setHasSearched(false);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                অর্ডার আইডি (Order ID):
              </label>
              <input
                type="text"
                required
                value={orderIdInput}
                onChange={e => setOrderIdInput(e.target.value)}
                placeholder="যেমন: PRY-2026-0812"
                className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#BE0750] uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                ফোন নম্বর (ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="যেমন: 01711223344"
                className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#BE0750]"
              />
            </div>

            <div className="sm:col-span-5 flex items-center justify-between">
              <div className="text-[11px] text-gray-500 font-bangla">
                নমুনা অর্ডার দেখতে সার্চ করুন: <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800 font-mono">PRY-2026-0812</code>
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>ট্র্যাক করুন</span>
              </button>
            </div>
          </form>

          {/* Result View */}
          {hasSearched && !trackedOrder && (
            <div className="mt-6 p-6 rounded-2xl bg-white border border-dashed border-red-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-xs font-bold text-red-700 font-bangla">কোনো অর্ডার পাওয়া যায়নি!</p>
              <p className="text-xs text-gray-500 font-bangla">
                দয়া করে আপনার সঠিক অর্ডার নম্বর অথবা ফোন নম্বর যাচাই করুন।
              </p>
            </div>
          )}

          {trackedOrder && (
            <div className="mt-6 space-y-6 animate-fade-in">
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                      #{trackedOrder.orderNumber}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-1 font-bangla">
                      গ্রাহক: {trackedOrder.customerName} ({trackedOrder.phone})
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        trackedOrder.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : trackedOrder.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-[#F8E8E9] text-[#7A1238]'
                      }`}
                    >
                      {trackedOrder.status.toUpperCase()}
                    </span>

                    <button
                      onClick={() => setShowInvoice(true)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#7A1238] hover:bg-[#F8E8E9] transition-colors"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Courier info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 font-bangla">
                  <div>
                    <span>ডেলিভারি ঠিকানা: </span>
                    <strong className="text-gray-900">{trackedOrder.deliveryAddress}, {trackedOrder.district}</strong>
                  </div>
                  <div>
                    <span>কুরিয়ার সার্ভিস: </span>
                    <strong className="text-gray-900">
                      {trackedOrder.courierName || 'কুরিয়ার নির্ধারণ প্রক্রিয়াধীন'}
                    </strong>
                    {trackedOrder.trackingNumber && (
                      <span className="font-mono text-xs block text-[#BE0750]">
                        Tracking: {trackedOrder.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Timeline Stepper */}
              {trackedOrder.status === 'cancelled' ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bangla text-center">
                  এই অর্ডারটি বাতিল (Cancelled) করা হয়েছে। সহায়তার জন্য আমাদের কাস্টমার সার্ভিসে যোগাযোগ করুন।
                </div>
              ) : (
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6 font-serif-brand">
                    ডেলিভারি টাইমলাইন ও অগ্রগতি
                  </h4>

                  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step.key} className="relative flex items-start gap-4">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                              isCompleted
                                ? 'bg-[#7A1238] text-white shadow-xs'
                                : 'bg-gray-100 text-gray-400 border border-gray-300'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <div>
                            <h5
                              className={`text-xs font-bold font-bangla ${
                                isCurrent ? 'text-[#BE0750] text-sm' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {step.labelBn}
                            </h5>
                            <p className="text-[11px] text-gray-500 mt-0.5 font-bangla">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showInvoice && trackedOrder && (
        <InvoiceView order={trackedOrder} onClose={() => setShowInvoice(false)} />
      )}
    </>
  );
};
