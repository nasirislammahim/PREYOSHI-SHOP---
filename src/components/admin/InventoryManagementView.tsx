import React, { useState } from 'react';
import {
  Package, AlertTriangle, CheckCircle2, Search, ArrowUpDown,
  Plus, Minus, RefreshCw, Filter, ShieldCheck, Edit
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { StaffService } from '../../services/staffService';

export const InventoryManagementView: React.FC = () => {
  const { products, updateProduct } = useStore();
  const { currentUser, hasPermission } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out_of_stock' | 'in_stock'>('all');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleQuickAdjust = (product: Product, delta: number) => {
    if (!hasPermission('inventory.update')) {
      showNotify('error', 'আপনার ইনভেন্টরি স্টক পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    const newStock = Math.max(0, product.stock + delta);
    updateProduct(product.id, {
      stock: newStock,
      status: newStock === 0 ? 'out_of_stock' : 'active'
    });

    StaffService.logAction(
      currentUser || { name: 'Staff' },
      'STOCK_ADJUSTMENT',
      `${product.sku} (${product.nameEn})`,
      `Adjusted stock by ${delta > 0 ? '+' : ''}${delta}. New stock: ${newStock}`
    );

    showNotify('success', `${product.nameEn} এর স্টক ${newStock} টি করা হয়েছে।`);
  };

  const handleSaveExactStock = (productId: string) => {
    if (!hasPermission('inventory.update')) {
      showNotify('error', 'আপনার ইনভেন্টরি স্টক পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    const safeStock = Math.max(0, Number(editStockValue) || 0);
    updateProduct(productId, {
      stock: safeStock,
      status: safeStock === 0 ? 'out_of_stock' : 'active'
    });

    StaffService.logAction(
      currentUser || { name: 'Staff' },
      'STOCK_SET_EXACT',
      `Product ${productId}`,
      `Set exact inventory stock level to ${safeStock}`
    );

    setEditingProductId(null);
    showNotify('success', 'স্টক সফলভাবে আপডেট করা হয়েছে।');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameBn.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (stockStatusFilter === 'low') return p.stock > 0 && p.stock <= 5;
    if (stockStatusFilter === 'out_of_stock') return p.stock <= 0;
    if (stockStatusFilter === 'in_stock') return p.stock > 5;
    return true;
  });

  const stats = {
    totalItems: products.length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock <= 0).length,
    healthyStock: products.filter(p => p.stock > 5).length
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* 1. Header & KPI Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#BE0750] uppercase tracking-wider font-serif-brand">
              <Package className="w-4 h-4 text-[#D9A441]" />
              <span>Enterprise Stock Control & Warehouse Management</span>
            </div>
            <h2 className="text-xl font-bold font-bangla text-[#2A101A] mt-0.5">
              ইনভেন্টরি ও রিয়েল-টাইম স্টক ট্র্যাকিং
            </h2>
          </div>
          {stats.lowStock > 0 && (
            <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{stats.lowStock}টি পণ্যের স্টক শেষ হওয়ার পথে (Low Stock Alert)</span>
            </div>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-[#FFF9F2] p-3 rounded-xl border border-[#D9A441]/30">
            <div className="text-[11px] text-gray-500 font-medium">মোট পণ্য সংখ্যা</div>
            <div className="text-xl font-bold text-[#2A101A] mt-0.5">{stats.totalItems}</div>
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
            <div className="text-[11px] text-emerald-700 font-medium">পর্যাপ্ত স্টক (&gt;5)</div>
            <div className="text-xl font-bold text-emerald-800 mt-0.5">{stats.healthyStock}</div>
          </div>
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200">
            <div className="text-[11px] text-amber-700 font-medium">কম স্টক লেভেল (১-৫)</div>
            <div className="text-xl font-bold text-amber-800 mt-0.5">{stats.lowStock}</div>
          </div>
          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200">
            <div className="text-[11px] text-rose-700 font-medium">স্টক শেষ (০)</div>
            <div className="text-xl font-bold text-rose-800 mt-0.5">{stats.outOfStock}</div>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* 2. Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="নাম বা SKU দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'in_stock', 'low', 'out_of_stock'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStockStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-all cursor-pointer ${
                stockStatusFilter === tab
                  ? 'bg-[#7A1238] text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'all'
                ? 'সকল'
                : tab === 'in_stock'
                ? 'পর্যাপ্ত স্টক'
                : tab === 'low'
                ? 'কম স্টক'
                : 'স্টক শেষ'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Product Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#FFF9F2] text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">পণ্য ও SKU</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4">বর্তমান মূল্য</th>
                <th className="py-3 px-4">বর্তমান মজুদ (Stock)</th>
                <th className="py-3 px-4">অবস্থা</th>
                <th className="py-3 px-4 text-right">দ্রুত অ্যাডজাস্ট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => {
                const isEditing = editingProductId === product.id;
                const isLow = product.stock > 0 && product.stock <= 5;
                const isOut = product.stock <= 0;

                return (
                  <tr key={product.id} className="hover:bg-rose-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.nameEn}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{product.nameEn}</div>
                          <div className="text-[11px] text-gray-500 font-bangla">{product.nameBn}</div>
                          <div className="text-[10px] font-mono text-gray-400">SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium capitalize text-gray-700">
                      {product.categoryId}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">৳{product.discountPrice || product.regularPrice}</div>
                      {product.discountPrice && (
                        <div className="text-[10px] text-gray-400 line-through">৳{product.regularPrice}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={editStockValue}
                            onChange={e => setEditStockValue(Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded border border-gray-300 text-xs font-bold text-gray-900"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveExactStock(product.id)}
                            className="px-2 py-1 rounded bg-[#7A1238] text-white font-bold text-[10px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingProductId(null)}
                            className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-bold text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                            }`}
                          >
                            {product.stock} টি
                          </span>
                          <button
                            onClick={() => {
                              setEditingProductId(product.id);
                              setEditStockValue(product.stock);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            title="নির্দিষ্ট স্টক সংখ্যা লিখুন"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded font-bold border border-rose-200">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-200">
                          Low Stock (Reorder)
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickAdjust(product, -1)}
                          disabled={product.stock <= 0}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                          title="১ টি কমান"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(product, 1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
                          title="১ টি বাড়ান"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(product, 5)}
                          className="px-2 h-7 rounded-lg bg-[#7A1238] hover:bg-[#5C0D2A] text-white font-bold flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                          title="৫ টি রিস্টক করুন"
                        >
                          +5 Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
