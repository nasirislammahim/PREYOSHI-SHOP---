import React, { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, CreditCard, Download, Calendar,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, PaymentMethod } from '../../types';

export const FinancialReportView: React.FC = () => {
  const { orders, settings } = useStore();
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (gatewayFilter !== 'all' && o.paymentMethod !== gatewayFilter) return false;
      if (dateRange === 'all') return true;

      const orderDate = new Date(o.createdAt);
      const now = new Date();
      if (dateRange === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateRange === 'this_week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= oneWeekAgo;
      }
      if (dateRange === 'this_month') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, dateRange, gatewayFilter]);

  const financialSummary = useMemo(() => {
    const validOrders = filteredOrders.filter(o => o.status !== 'cancelled');
    const grossRevenue = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const subtotal = validOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalDeliveryFees = validOrders.reduce((sum, o) => sum + o.deliveryCharge, 0);
    const totalDiscounts = validOrders.reduce((sum, o) => sum + o.discount, 0);

    const gatewayBreakdown: Record<PaymentMethod, { count: number; total: number }> = {
      cod: { count: 0, total: 0 },
      bkash: { count: 0, total: 0 },
      nagad: { count: 0, total: 0 },
      rocket: { count: 0, total: 0 }
    };

    validOrders.forEach(o => {
      const pm = o.paymentMethod || 'cod';
      if (gatewayBreakdown[pm]) {
        gatewayBreakdown[pm].count += 1;
        gatewayBreakdown[pm].total += o.grandTotal;
      }
    });

    return {
      grossRevenue,
      subtotal,
      totalDeliveryFees,
      totalDiscounts,
      orderCount: validOrders.length,
      cancelledCount: filteredOrders.filter(o => o.status === 'cancelled').length,
      gatewayBreakdown
    };
  }, [filteredOrders]);

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Phone', 'Payment Method', 'Payment Status', 'Subtotal', 'Delivery', 'Discount', 'Grand Total', 'Order Status'];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toISOString().split('T')[0],
      `"${o.customerName}"`,
      o.phone,
      o.paymentMethod.toUpperCase(),
      o.paymentStatus,
      o.subtotal,
      o.deliveryCharge,
      o.discount,
      o.grandTotal,
      o.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `preyoshi_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* 1. Header & Quick Controls */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#BE0750] uppercase tracking-wider font-serif-brand">
            <DollarSign className="w-4 h-4 text-[#D9A441]" />
            <span>Enterprise Financial Ledger & Audit</span>
          </div>
          <h2 className="text-xl font-bold font-bangla text-[#2A101A] mt-0.5">
            আর্থিক হিসাব, সেলস রিপোর্ট ও পেমেন্ট গেটওয়ে
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 outline-hidden font-medium"
          >
            <option value="all">সর্বমোট সময় (All Time)</option>
            <option value="today">আজকের হিসাব (Today)</option>
            <option value="this_week">চলতি সপ্তাহ (This Week)</option>
            <option value="this_month">চলতি মাস (This Month)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7A1238] hover:bg-[#5C0D2A] text-white font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV লেজার এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] font-medium text-gray-500">মোট গ্রস রেভিনিউ (Gross Sales)</div>
          <div className="text-2xl font-bold text-[#2A101A] mt-1">৳{financialSummary.grossRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{financialSummary.orderCount}টি সফল অর্ডার</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] font-medium text-gray-500">পণ্য বিক্রয় মূল্য (Net Subtotal)</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">৳{financialSummary.subtotal.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 mt-1">ডেলিভারি ও ছাড় ব্যতীত</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] font-medium text-gray-500">সংগৃহীত ডেলিভারি চার্জ</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">৳{financialSummary.totalDeliveryFees.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 mt-1">কুরিয়ার ও নিজস্ব ডেলিভারি</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] font-medium text-gray-500">প্রদত্ত কুপন ও ডিসকাউন্ট</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">৳{financialSummary.totalDiscounts.toLocaleString()}</div>
          <div className="text-[10px] text-rose-500 mt-1">কুপন ক্যাম্পেইন ব্যয়</div>
        </div>
      </div>

      {/* 3. Payment Gateway Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <h3 className="font-bold text-gray-900 font-bangla text-sm mb-4">
          পেমেন্ট চ্যানেল অনুযায়ী লেনদেন বিশ্লেষণ
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* COD */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">ক্যাশ অন ডেলিভারি (COD)</span>
              <span className="text-[11px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold">
                {financialSummary.gatewayBreakdown.cod.count} অর্ডার
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900 mt-2">
              ৳{financialSummary.gatewayBreakdown.cod.total.toLocaleString()}
            </div>
          </div>

          {/* bKash */}
          <div className="p-4 rounded-xl bg-pink-50 border border-pink-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#E2136E]">বিকাশ (bKash)</span>
              <span className="text-[11px] bg-pink-100 text-[#E2136E] px-2 py-0.5 rounded font-bold">
                {financialSummary.gatewayBreakdown.bkash.count} অর্ডার
              </span>
            </div>
            <div className="text-xl font-bold text-[#E2136E] mt-2">
              ৳{financialSummary.gatewayBreakdown.bkash.total.toLocaleString()}
            </div>
          </div>

          {/* Nagad */}
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F7941D]">নগদ (Nagad)</span>
              <span className="text-[11px] bg-orange-100 text-[#F7941D] px-2 py-0.5 rounded font-bold">
                {financialSummary.gatewayBreakdown.nagad.count} অর্ডার
              </span>
            </div>
            <div className="text-xl font-bold text-[#F7941D] mt-2">
              ৳{financialSummary.gatewayBreakdown.nagad.total.toLocaleString()}
            </div>
          </div>

          {/* Rocket */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#8C3494]">রকেট (Rocket)</span>
              <span className="text-[11px] bg-purple-100 text-[#8C3494] px-2 py-0.5 rounded font-bold">
                {financialSummary.gatewayBreakdown.rocket.count} অর্ডার
              </span>
            </div>
            <div className="text-xl font-bold text-[#8C3494] mt-2">
              ৳{financialSummary.gatewayBreakdown.rocket.total.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Transactions Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#FFF9F2] border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-gray-800 font-bangla">লেনদেন বিবরণী (Transaction Ledger)</span>
          <span className="text-gray-500 font-medium">{filteredOrders.length}টি লেনদেন তালিকাভুক্ত</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">অর্ডার নম্বর</th>
                <th className="py-3 px-4">তারিখ ও সময়</th>
                <th className="py-3 px-4">গ্রাহক</th>
                <th className="py-3 px-4">মাধ্যম</th>
                <th className="py-3 px-4">সাবটোটাল</th>
                <th className="py-3 px-4">ডেলিভারি</th>
                <th className="py-3 px-4">সর্বমোট</th>
                <th className="py-3 px-4">পেমেন্ট অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.slice(0, 50).map(order => (
                <tr key={order.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">{order.orderNumber}</td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-800">{order.customerName}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{order.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="uppercase font-bold text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4">৳{order.subtotal}</td>
                  <td className="py-3 px-4">৳{order.deliveryCharge}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">৳{order.grandTotal}</td>
                  <td className="py-3 px-4">
                    {order.paymentStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {order.paymentStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {order.paymentStatus === 'failed' && (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
