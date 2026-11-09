import React from 'react';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';
import { BrandLogo } from '../brand/BrandLogo';

interface InvoiceViewProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-6">
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">ইনভয়েস রসিদ (Invoice)</span>
            <span className="text-xs font-mono bg-gray-200 text-gray-800 px-2 py-0.5 rounded-sm">
              #{order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / PDF সংরক্ষণ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-6 sm:p-10 text-gray-800 bg-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-[#7A1238]">
            <div>
              <BrandLogo size="lg" />
              <p className="text-xs text-gray-500 mt-2 font-bangla">
                House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh<br />
                হটলাইন: +880 1700-000000 | ফেসবুক: facebook.com/Preyoshishop
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-xs uppercase tracking-widest text-[#BE0750] font-bold font-serif-brand">
                OFFICIAL INVOICE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-gray-900">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-gray-500">
                তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F8E8E9] text-[#7A1238]">
                স্ট্যাটাস: {order.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-gray-100 text-xs">
            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] text-[#7A1238] mb-2 font-serif-brand">
                প্রাপকের তথ্য (Bill To):
              </h4>
              <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
              <p className="text-gray-600 mt-0.5">মোবাইল: <strong className="font-mono">{order.phone}</strong></p>
              {order.email && <p className="text-gray-600">ইমেইল: {order.email}</p>}
            </div>

            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] text-[#7A1238] mb-2 font-serif-brand">
                ডেলিভারি ও পেমেন্ট (Shipping & Payment):
              </h4>
              <p className="text-gray-700 leading-relaxed font-bangla">
                {order.deliveryAddress}, {order.upazila}, {order.district}, {order.division}
              </p>
              <p className="text-gray-600 mt-1 font-bangla">
                পেমেন্ট মেথড: <strong className="uppercase">{order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : order.paymentMethod}</strong>
                {order.transactionId && ` (TrxID: ${order.transactionId})`}
              </p>
              {order.courierName && (
                <p className="text-gray-600 font-bangla">
                  কুরিয়ার: <strong>{order.courierName}</strong>
                  {order.trackingNumber && ` (ট্র্যাকিং: ${order.trackingNumber})`}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3">বিবরণ (Item Description)</th>
                  <th className="py-3 text-center">সাইজ / কালার</th>
                  <th className="py-3 text-center">পরিমাণ</th>
                  <th className="py-3 text-right">মূল্য (Price)</th>
                  <th className="py-3 text-right">মোট (Total)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-3">
                    <td className="py-3 font-semibold text-gray-800 font-bangla">
                      {item.nameBn}
                      <span className="block text-[11px] text-gray-500 font-normal">{item.nameEn}</span>
                    </td>
                    <td className="py-3 text-center text-gray-600">
                      {item.selectedSize || 'Standard'} {item.selectedColor ? `/ ${item.selectedColor}` : ''}
                    </td>
                    <td className="py-3 text-center font-bold text-gray-800">{item.quantity}</td>
                    <td className="py-3 text-right font-medium text-gray-700">৳{item.price.toLocaleString()}</td>
                    <td className="py-3 text-right font-bold text-gray-900">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="pt-4 border-t-2 border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-gray-500 max-w-sm space-y-1 font-bangla">
              <p>• পণ্য প্রাপ্তির সময় ডেলিভারি ম্যানের উপস্থিতিতে পণ্য পরীক্ষা করে নিন।</p>
              <p>• কোনো ধরনের অভিযোগ থাকলে আমাদের হটলাইনে ২৪ ঘণ্টার মধ্যে অবগত করুন।</p>
              <p className="pt-2 text-[11px] text-gray-400">
                Designed & Powered by <strong className="text-gray-700">Nurtaz Agency</strong> for Preyoshi Shop.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>সাবটোটাল (Subtotal):</span>
                <span className="font-semibold text-gray-900">৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি চার্জ (Delivery):</span>
                <span className="font-semibold text-gray-900">৳{order.deliveryCharge.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>ডিসকাউন্ট (Discount):</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-[#7A1238] pt-2 border-t border-gray-200">
                <span>সর্বমোট (Grand Total):</span>
                <span>৳{order.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Official Seal / Signature Line */}
          <div className="pt-12 flex items-end justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-semibold">PREYOSHI SHOP অফিশিয়াল ভেরিফাইড অর্ডার</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-gray-400 mb-1" />
              <span className="text-[11px] text-gray-500">অনুমোদিত স্বাক্ষরকারী</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
