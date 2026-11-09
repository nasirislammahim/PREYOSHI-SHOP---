import React, { useState } from 'react';
import {
  Star, CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  MessageSquare, Filter, Search, ThumbsUp, Send, RefreshCw, Eye
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Review, ReviewModerationStatus, ReviewAdminResponse } from '../../types';
import { StaffService } from '../../services/staffService';

export const ReviewModerationView: React.FC = () => {
  const { reviews, products, moderateReview } = useStore();
  const { currentUser, hasPermission } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [respondingReview, setRespondingReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseRole, setResponseRole] = useState('Customer Experience Lead');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStatusChange = (review: Review, newStatus: ReviewModerationStatus) => {
    if (!hasPermission('reviews.moderate')) {
      showNotify('error', 'আপনার রিভিউ মডারেট করার অনুমতি নেই।');
      return;
    }
    moderateReview(review.id, newStatus);
    StaffService.logAction(
      currentUser || { name: 'Admin' },
      'REVIEW_MODERATION',
      `Review ${review.id} for ${review.productId}`,
      `Changed status to ${newStatus}`
    );
    showNotify('success', `রিভিউ স্ট্যাটাস '${newStatus}' এ পরিবর্তন করা হয়েছে।`);
  };

  const handleOpenResponseModal = (review: Review) => {
    setRespondingReview(review);
    setResponseText(review.adminResponse?.message || '');
    setResponseRole(review.adminResponse?.authorRole || 'Customer Experience Lead');
  };

  const handleSaveResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingReview) return;

    if (!responseText.trim()) {
      showNotify('error', 'দয়া করে উত্তরের বার্তা লিখুন।');
      return;
    }

    const adminResponsePayload: ReviewAdminResponse = {
      authorName: 'PREYOSHI Official',
      authorRole: responseRole.trim(),
      message: responseText.trim(),
      respondedAt: new Date().toISOString()
    };

    moderateReview(respondingReview.id, respondingReview.status || 'approved', adminResponsePayload);

    StaffService.logAction(
      currentUser || { name: 'Admin' },
      'REVIEW_ADMIN_REPLY',
      `Review ${respondingReview.id}`,
      `Added official store response: "${responseText.substring(0, 40)}..."`
    );

    showNotify('success', 'প্রেয়সী অফিশিয়াল উত্তর সফলভাবে যুক্ত করা হয়েছে!');
    setRespondingReview(null);
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location && r.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.orderId && r.orderId.toLowerCase().includes(searchQuery.toLowerCase()));

    const currentStatus = r.status || 'approved';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => (r.status || 'approved') === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    flagged: reviews.filter(r => r.status === 'flagged').length,
    verifiedCount: reviews.filter(r => r.verifiedPurchase).length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Stats Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#BE0750] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#D9A441]" />
              <span>Verified Customer Review Moderation</span>
            </div>
            <h2 className="text-xl font-bold font-bangla text-[#2A101A] mt-0.5">
              যাচাইকৃত কাস্টমার রিভিউ ও মডারেশন কিউ
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{stats.verifiedCount}টি যাচাইকৃত ডেলিভারি রিভিউ</span>
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-[#FFF9F2] p-3 rounded-xl border border-[#D9A441]/30">
            <div className="text-[11px] text-gray-500 font-medium">মোট রিভিউ</div>
            <div className="text-xl font-bold text-[#2A101A] mt-0.5">{stats.total}</div>
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
            <div className="text-[11px] text-emerald-700 font-medium">অনুমোদিত (Live)</div>
            <div className="text-xl font-bold text-emerald-800 mt-0.5">{stats.approved}</div>
          </div>
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200">
            <div className="text-[11px] text-amber-700 font-medium">অপেক্ষমাণ (Pending)</div>
            <div className="text-xl font-bold text-amber-800 mt-0.5">{stats.pending}</div>
          </div>
          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200">
            <div className="text-[11px] text-rose-700 font-medium">স্প্যাম / ফ্ল্যাগড</div>
            <div className="text-xl font-bold text-rose-800 mt-0.5">{stats.flagged}</div>
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

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="গ্রাহকের নাম, মন্তব্য বা অর্ডার আইডি দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'approved', 'pending', 'rejected', 'flagged'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#7A1238] text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'all' ? 'সকল' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500 text-xs">
            কোনো রিভিউ খুঁজে পাওয়া যায়নি।
          </div>
        ) : (
          filteredReviews.map(review => {
            const product = products.find(p => p.id === review.productId);
            const currentStatus = review.status || 'approved';

            return (
              <div
                key={review.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:border-[#BE0750]/30 transition-all text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {product?.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.nameEn}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200"
                      />
                    )}
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{review.customerName}</div>
                      <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{product?.nameBn || product?.nameEn || review.productId}</span>
                        {review.location && <span>• {review.location}</span>}
                        <span>• {new Date(review.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {/* Rating Stars */}
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Verified Purchase Badge */}
                        {review.verifiedPurchase ? (
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            যাচাইকৃত ক্রেতা (Verified Purchase)
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            সাধারণ রিভিউ
                          </span>
                        )}

                        {review.orderId && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-blue-200">
                            অর্ডার: {review.orderId}
                          </span>
                        )}

                        {review.category && (
                          <span className="bg-[#FFF9F2] text-[#7A1238] text-[10px] px-2 py-0.5 rounded font-bold border border-[#D9A441]/30">
                            {review.category.replace('_', ' ').toUpperCase()}
                          </span>
                        )}

                        {/* Helpful Votes */}
                        <span className="text-gray-400 text-[10px] flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {review.helpfulCount || 0} লাইক
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                        currentStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : currentStatus === 'pending'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : currentStatus === 'flagged'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {currentStatus}
                    </span>

                    {currentStatus !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(review, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
                        title="অনুমোদন করুন"
                      >
                        Approve
                      </button>
                    )}

                    {currentStatus !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(review, 'rejected')}
                        className="px-2.5 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition-colors cursor-pointer"
                        title="বাতিল করুন"
                      >
                        Reject
                      </button>
                    )}

                    {currentStatus !== 'flagged' && (
                      <button
                        onClick={() => handleStatusChange(review, 'flagged')}
                        className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold transition-colors cursor-pointer"
                        title="স্প্যাম হিসেবে ফ্ল্যাগ করুন"
                      >
                        Flag Spam
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenResponseModal(review)}
                      className="px-3 py-1 rounded-lg bg-[#7A1238] hover:bg-[#5C0D2A] text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{review.adminResponse ? 'উত্তর পরিবর্তন' : 'অফিশিয়াল উত্তর'}</span>
                    </button>
                  </div>
                </div>

                {/* Review Text */}
                <div className="mt-3.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-800 leading-relaxed font-bangla text-xs">
                  "{review.comment}"
                </div>

                {/* Official Admin Response Display */}
                {review.adminResponse && (
                  <div className="mt-3 p-3.5 rounded-xl bg-rose-50/60 border border-[#BE0750]/20 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#BE0750] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#7A1238] font-serif-brand">PREYOSHI Official Response</span>
                        <span className="text-[10px] text-gray-500 font-medium">({review.adminResponse.authorRole})</span>
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {new Date(review.adminResponse.respondedAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700 mt-1 font-bangla leading-relaxed">
                        {review.adminResponse.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Admin Response Modal */}
      {respondingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#7A1238]" />
                <h3 className="text-sm font-bold text-gray-900 font-bangla">
                  প্রেয়সী শপ অফিশিয়াল উত্তর প্রদান ({respondingReview.customerName})
                </h3>
              </div>
              <button
                onClick={() => setRespondingReview(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResponse} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">প্রতিনিধির পদবী (Designation)</label>
                <input
                  type="text"
                  value={responseRole}
                  onChange={e => setResponseRole(e.target.value)}
                  placeholder="যেমন: Customer Experience Lead / Managing Director"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">অফিশিয়াল উত্তর বার্তা *</label>
                <textarea
                  rows={4}
                  required
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="গ্রাহকের আন্তরিক মতামতের জন্য ধন্যবাদ জানিয়ে সুন্দর ও সৌজন্যমূলক উত্তর লিখুন..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238] font-bangla text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setRespondingReview(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7A1238] hover:bg-[#5C0D2A] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>উত্তর প্রকাশ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
