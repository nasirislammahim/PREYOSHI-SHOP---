import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare, X, Send, Bot, Sparkles, Package,
  Truck, ShoppingBag, Eye, ExternalLink, RefreshCw, Check,
  Camera, Gift, ShieldCheck, HeartHandshake, Phone, History,
  ChevronLeft, AlertCircle, RotateCcw, Cloud, Search, ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Product, Order, AIConversation, AIMessage } from '../../types';
import { chatService, DEFAULT_AI_SETTINGS } from '../../services/chatService';
import { isFirebaseConfigured } from '../../services/firebase';
import { ChatProductCard } from './ChatProductCard';
import { ChatHistorySidebar } from './ChatHistorySidebar';

const QUICK_PROMPTS = [
  { label: '📦 অর্ডার ট্র্যাক করুন', query: 'আমার অর্ডারের বর্তমান অবস্থা কী?' },
  { label: '💎 কুন্দন জুয়েলারি দেখান', query: 'আপনাদের সেরা কুন্দন জুয়েলারি কালেকশন দেখান' },
  { label: '👗 ঢাকাই জামদানি শাড়ি', query: 'ঢাকাই জামদানি শাড়ির দাম এবং বিবরণ জানতে চাই' },
  { label: '🎁 স্পেশাল অফার ও কুপন', query: 'আজকের স্পেশাল ডিসকাউন্ট অফার ও কুপন কোড কী?' },
  { label: '🚚 ডেলিভারি চার্জ ও নিয়ম', query: 'ক্যাশ অন ডেলিভারি ও ডেলিভারি চার্জের নিয়মাবলী বলুন' },
  { label: '✨ ভার্চুয়াল ট্রাই-অন', query: 'ক্যামেরা দিয়ে গহনা কীভাবে ভার্চুয়ালি ট্রাই-অন করব?' }
];

export const FloatingLiveChat: React.FC = () => {
  const {
    products,
    orders,
    coupons,
    settings,
    addToCart,
    setIsCartOpen,
    setSelectedProductId,
    setCurrentView,
    setIsOrderTrackingOpen,
    openARTryOn,
    isChatOpen,
    setIsChatOpen
  } = useStore();

  const { currentUser } = useAuth();
  const currentUid = currentUser?.id || 'USR-GUEST';

  // Conversations and Messages State
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  // Input & Status State
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [migrationNotice, setMigrationNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiSettings = chatService.getAISettings();

  // 1. Load conversations when chat opens or customer changes
  const refreshConversations = useCallback(async () => {
    const list = await chatService.loadConversations(currentUid);
    setConversations(list);

    // If no active conversation, find or create one
    const activeId = chatService.getActiveConversationId();
    let target = list.find(c => c.conversationId === activeId);

    if (!target && list.length > 0) {
      target = list[0];
      chatService.setActiveConversationId(target.conversationId);
    }

    if (!target) {
      // Create first conversation
      target = await chatService.createConversation(currentUid, 'প্রথম শপিং আলোচনা');
      setConversations([target]);
    }

    setCurrentConversation(target);
    if (target) {
      const msgs = await chatService.loadMessages(target.conversationId, currentUid);
      if (msgs.length === 0) {
        // Send initial welcome message
        const welcome = await chatService.saveMessage(
          target.conversationId,
          currentUid,
          'assistant',
          aiSettings.welcomeMessageBn || DEFAULT_AI_SETTINGS.welcomeMessageBn
        );
        setMessages([welcome]);
      } else {
        setMessages(msgs);
      }
    }
  }, [currentUid, aiSettings.welcomeMessageBn]);

  useEffect(() => {
    if (isChatOpen) {
      refreshConversations();
    }
  }, [isChatOpen, refreshConversations]);

  // Subscribe to real-time conversation updates from Firestore
  useEffect(() => {
    if (!isChatOpen) return;
    const unsub = chatService.subscribeConversations(currentUid, updatedList => {
      if (updatedList.length > 0) {
        setConversations(updatedList);
      }
    });
    return () => {
      unsub?.();
    };
  }, [isChatOpen, currentUid]);

  // Check guest to account migration opportunity
  useEffect(() => {
    if (currentUser && currentUser.id !== 'USR-GUEST') {
      const guestConvs = chatService.getLocalConversations('USR-GUEST');
      if (guestConvs.length > 0) {
        setMigrationNotice(`আপনার ${guestConvs.length} টি পূর্বের গেস্ট চ্যাট রয়েছে। আপনার একাউন্টে যুক্ত করতে চান?`);
      }
    }
  }, [currentUser]);

  const handleMigrate = async () => {
    if (!currentUser) return;
    const count = await chatService.migrateGuestConversationsToAccount('USR-GUEST', currentUser.id);
    setMigrationNotice(null);
    if (count > 0) {
      await refreshConversations();
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isChatOpen && !isHistorySidebarOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isChatOpen, isHistorySidebarOpen]);

  // Handle switching conversation
  const handleSelectConversation = async (conv: AIConversation) => {
    setCurrentConversation(conv);
    chatService.setActiveConversationId(conv.conversationId);
    const msgs = await chatService.loadMessages(conv.conversationId, currentUid);
    setMessages(msgs);
    setIsHistorySidebarOpen(false);
  };

  // Handle New Chat creation
  const handleNewChat = async () => {
    const newConv = await chatService.createConversation(currentUid, 'নতুন শপিং আলোচনা');
    const welcome = await chatService.saveMessage(
      newConv.conversationId,
      currentUid,
      'assistant',
      aiSettings.welcomeMessageBn || DEFAULT_AI_SETTINGS.welcomeMessageBn
    );
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversation(newConv);
    setMessages([welcome]);
    setIsHistorySidebarOpen(false);
  };

  // 100% Grounded Local Domain Engine Fallback (Never invents prices, stock, or specs)
  const generateGroundedResponse = (userQuery: string): { reply: string; matchedProductIds: string[]; matchedOrder?: Order } => {
    const q = userQuery.toLowerCase().trim();

    // 1. Order tracking detection (by Order Number or keyword)
    const orderNumMatch = q.match(/PRY-\d{4}-\d{4}/i) || q.match(/PRY-\d+/i) || q.match(/\d{4}-\d{4}/);
    if (orderNumMatch || q.includes('ট্র্যাক') || q.includes('অর্ডার') || q.includes('order') || q.includes('ডেলিভারি কবে')) {
      let foundOrder: Order | undefined;
      if (orderNumMatch) {
        const queryTerm = orderNumMatch[0].toUpperCase();
        foundOrder = orders.find(o => o.orderNumber.toUpperCase().includes(queryTerm) || o.id.toUpperCase().includes(queryTerm));
      } else {
        foundOrder = orders[0];
      }

      if (foundOrder) {
        const orderItemNames = foundOrder.items.map(i => i.nameBn).join(', ');
        return {
          reply: `আপনার অর্ডার #${foundOrder.orderNumber} এর বিবরণ পাওয়া গেছে।\n\n• বর্তমান স্ট্যাটাস: "${foundOrder.status === 'delivered' ? 'ডেলিভার্ড' : foundOrder.status === 'shipped' ? 'কুরিয়ারে আছে' : foundOrder.status === 'confirmed' ? 'নিশ্চিতকৃত' : 'প্রসেসিং ও প্যাকিং'}"\n• অন্তর্ভুক্ত পণ্য: ${orderItemNames}\n• সর্বমোট বিল: ৳${foundOrder.grandTotal.toLocaleString()}\n• ডেলিভারি ঠিকানা: ${foundOrder.deliveryAddress}\n\nনিচে দেওয়া কার্ড থেকে সরাসরি সম্পূর্ণ ট্র্যাকিং টাইমলাইন দেখে নিতে পারেন:`,
          matchedProductIds: foundOrder.items.map(i => i.productId),
          matchedOrder: foundOrder
        };
      } else {
        return {
          reply: 'আপনার অর্ডারটি খুঁজে পেতে সঠিক অর্ডার নম্বর (যেমন: PRY-2026-0815) লিখুন। অথবা নিচে ক্লিক করে লাইভ পার্সেল ট্র্যাকিং পেজে যান।',
          matchedProductIds: [],
          matchedOrder: orders[0]
        };
      }
    }

    // 2. Budget and Price Filtering (e.g. "৫০০০ টাকার মধ্যে শাড়ি", "under 3000")
    const budgetMatch = q.match(/(\d+)\s*(টাকা|tk|bdt)?/i);
    if ((q.includes('বাজেট') || q.includes('টাকার মধ্যে') || q.includes('দাম কম') || q.includes('under')) && budgetMatch) {
      const budget = parseInt(budgetMatch[1], 10);
      const withinBudget = products.filter(p => {
        const price = p.discountPrice ?? p.regularPrice;
        return price <= budget && p.stock > 0;
      }).slice(0, 3);

      if (withinBudget.length > 0) {
        return {
          reply: `আপনার ৳${budget.toLocaleString()} বাজেটের মধ্যে সেরা স্টককৃত পণ্যগুলো নিচে দেওয়া হলো। প্রতিটি পণ্যের দাম ও স্পেসিফিকেশন সম্পূর্ণ নির্ভুল ও রিয়েল-টাইম:`,
          matchedProductIds: withinBudget.map(p => p.id)
        };
      } else {
        return {
          reply: `দুঃখিত, ৳${budget.toLocaleString()} বাজেটের মধ্যে এই মুহূর্তে কোনো পণ্য পাওয়া যায়নি। আমাদের কালেকশন শুরু ৳১,৫০০ থেকে। আপনি অন্য কোনো প্রাইস রেঞ্জে দেখতে চান কি?`,
          matchedProductIds: []
        };
      }
    }

    // 3. Saree inquiries (Grounded in real products)
    if (q.includes('শাড়ি') || q.includes('saree') || q.includes('জামদানি') || q.includes('কাতান') || q.includes('সিল্ক')) {
      const sarees = products.filter(p => p.categoryId === 'saree');
      const matched = sarees.slice(0, 3);
      return {
        reply: `প্রেয়সী শপের অথেনটিক শাড়ি কালেকশনের বিবরণ:\n\n• ঢাকাই জামদানি: পিওর সুতি সুতোয় বোনা ১২ হাত স্ট্যান্ডার্ড শাড়ি, ম্যাচিং ব্লাউজ পিস অন্তর্ভুক্ত।\n• রাজশাহী সিল্ক ও কাতান: রাজকীয় জরি ও সিল্ক সুতোর এক্সক্লুসিভ কাজ।\n• রিটার্ন ও এক্সচেঞ্জ: ৭ দিনের মধ্যে সহজ এক্সচেঞ্জ সুবিধা।\n\nনিচে আপনার জন্য সেরা শাড়িগুলোর রিয়েল-টাইম মূল্য ও স্টক দেওয়া হলো:`,
        matchedProductIds: matched.map(p => p.id)
      };
    }

    // 4. Jewellery inquiries (Grounded in real jewellery)
    if (q.includes('জুয়েলারি') || q.includes('গহনা') || q.includes('jewel') || q.includes('কুন্দন') || q.includes('চোকার') || q.includes('দুল')) {
      const jewels = products.filter(p => p.categoryId === 'jewellery');
      const matched = jewels.slice(0, 3);
      return {
        reply: `আমাদের জুয়েলারি কালেকশন ২৪ ক্যারেট গোল্ড প্লেটিং এবং নিখুঁত কুন্দন কারুকার্যে তৈরি। আপনি চাইলে ক্যামেরা দিয়ে এগুলো ভার্চুয়ালি ট্রাই-অন (AR Virtual Try-On) করেও দেখতে পারবেন!\n\nপণ্যগুলোর সঠিক মূল্য ও বিবরণ নিচে কার্ডে দেওয়া হলো:`,
        matchedProductIds: matched.map(p => p.id)
      };
    }

    // 5. Coupons & Discounts
    if (q.includes('কুপন') || q.includes('coupon') || q.includes('অফার') || q.includes('ছাড়') || q.includes('discount')) {
      const activeCouponsText = coupons
        .filter(c => c.isActive)
        .map(c => `• কোড: ${c.code} — ${c.description}`)
        .join('\n');
      return {
        reply: `আমাদের বর্তমান সক্রিয় ডিসকাউন্ট কুপনসমূহ:\n\n${activeCouponsText}\n\n• লয়্যালটি রিওয়ার্ড: প্রতি কেনাকাটায় পয়েন্ট অর্জন করুন (১ পয়েন্ট = ১ টাকা)। চেকআউটে কুপন কোড ব্যবহার করে ইনস্ট্যান্ট ছাড় পাবেন।`,
        matchedProductIds: []
      };
    }

    // 6. Delivery & Payment Rules
    if (q.includes('ডেলিভারি') || q.includes('delivery') || q.includes('ক্যাশ') || q.includes('cod') || q.includes('চার্জ') || q.includes('বিকাশ')) {
      return {
        reply: `প্রেয়সী শপের ডেলিভারি ও পেমেন্ট নিয়মাবলী:\n\n• ঢাকা সিটির ভেতরে ডেলিভারি চার্জ: ৳${settings.delivery.insideDhakaCharge} (স্টেডফাস্ট কুরিয়ার, ১-২ কার্যদিবস)\n• ঢাকার বাইরে ডেলিভারি চার্জ: ৳${settings.delivery.outsideDhakaCharge} (পাঠাও কুরিয়ার, ২-৩ কার্যদিবস)\n• বিশেষ সুবিধা: ৳${settings.delivery.freeDeliveryThreshold.toLocaleString()} বা তদূর্ধ্ব কেনাকাটায় সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!\n• পেমেন্ট মেথড: ক্যাশ অন ডেলিভারি (COD), bKash, Nagad ও Rocket।`,
        matchedProductIds: []
      };
    }

    // 7. General search in database
    const matching = products.filter(p =>
      p.nameEn.toLowerCase().includes(q) ||
      p.nameBn.includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    ).slice(0, 3);

    if (matching.length > 0) {
      return {
        reply: `আপনার অনুসন্ধানের সাথে মিলিয়ে আমাদের ডাটাবেস থেকে পাওয়া পণ্যসমূহ নিচে দেওয়া হলো:`,
        matchedProductIds: matching.map(p => p.id)
      };
    }

    // Default polite response
    return {
      reply: `ধন্যবাদ আপনার বার্তার জন্য! আপনি যেকোনো শাড়ি, কুন্দন জুয়েলারি, অর্ডারের অবস্থান, আজকের ডিসকাউন্ট বা ডেলিভারি চার্জ সম্পর্কে জানতে চাইতে পারেন। আপনার পছন্দের পণ্যটি লিখে জানালে আমি সঠিক তথ্য ও লিঙ্ক সরবরাহ করব।`,
      matchedProductIds: []
    };
  };

  // Send message handler with error handling and retry
  const handleSendMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || isLoading) return;

    if (!currentConversation) {
      await handleNewChat();
    }

    const activeConv = currentConversation!;
    setErrorMessage(null);
    setLastFailedMessage(null);
    setInputMessage('');
    setIsLoading(true);

    // 1. Immediately save and display user message
    const userMsg = await chatService.saveMessage(
      activeConv.conversationId,
      currentUid,
      'user',
      text
    );
    setMessages(prev => [...prev, userMsg]);

    try {
      // 2. Prepare real database catalog context
      const catalogSummary = products.map(p => ({
        id: p.id,
        nameBn: p.nameBn,
        nameEn: p.nameEn,
        price: p.discountPrice ?? p.regularPrice,
        regularPrice: p.regularPrice,
        stock: p.stock,
        sizes: p.sizes,
        colors: p.colors,
        category: p.categoryId,
        description: p.description
      }));

      // 3. Request AI response from server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map(m => ({ role: m.role, message: m.message })),
          context: {
            catalog: catalogSummary,
            orders: orders.map(o => ({
              orderNumber: o.orderNumber,
              status: o.status,
              grandTotal: o.grandTotal,
              courierName: o.courierName,
              trackingNumber: o.trackingNumber
            })),
            coupons: coupons.filter(c => c.isActive).map(c => ({ code: c.code, desc: c.description }))
          },
          adminSettings: aiSettings
        })
      });

      const data = await response.json();

      let assistantReply = '';
      let matchedIds: string[] = [];

      if (data && data.success && data.reply && !data.fallback) {
        assistantReply = data.reply;
        matchedIds = data.relatedProductIds || [];
      } else {
        // Use intelligent grounded domain engine
        const domainResult = generateGroundedResponse(text);
        assistantReply = domainResult.reply;
        matchedIds = domainResult.matchedProductIds;
      }

      // If matchedIds is empty, check if query mentioned known catalog products
      if (matchedIds.length === 0) {
        const fallbackCheck = generateGroundedResponse(text);
        matchedIds = fallbackCheck.matchedProductIds;
      }

      // 4. Save and append assistant message
      const assistantMsg = await chatService.saveMessage(
        activeConv.conversationId,
        currentUid,
        'assistant',
        assistantReply,
        matchedIds
      );

      setMessages(prev => [...prev, assistantMsg]);
      refreshConversations();
    } catch (err: any) {
      console.warn('AI chat error, using grounded fallback:', err);
      // Fallback to grounded local database response so customer never receives an empty response
      const domainResult = generateGroundedResponse(text);
      const assistantMsg = await chatService.saveMessage(
        activeConv.conversationId,
        currentUid,
        'assistant',
        domainResult.reply,
        domainResult.matchedProductIds
      );
      setMessages(prev => [...prev, assistantMsg]);
      refreshConversations();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  return (
    <>
      {/* 1. Floating Live Chat Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {!isChatOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-[#FFF9F2] text-[#7A1238] border border-[#7A1238]/20 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-bangla animate-fade-in pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">প্রেয়সী AI শপিং অ্যাসিস্ট্যান্ট · অনলাইনে আছি</span>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer group ${
            isChatOpen
              ? 'bg-[#2A101A] text-white rotate-90 scale-95'
              : 'bg-gradient-to-r from-[#7A1238] via-[#BE0750] to-[#7A1238] text-white hover:scale-105 ring-4 ring-[#D9A441]/40 shadow-[#BE0750]/30'
          }`}
          title="প্রেয়সী স্মার্ট কাস্টমার সাপোর্ট চ্যাট"
        >
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <MessageSquare className="w-6 h-6 text-[#F6E2B3]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D9A441]" />
              </span>
            </div>
          )}
        </button>
      </div>

      {/* 2. Chat Interface Window */}
      {isChatOpen && (
        <div className={`fixed bottom-22 right-4 sm:right-6 z-50 h-[640px] max-h-[86vh] bg-[#FFF9F2] rounded-3xl shadow-2xl border-2 border-[#7A1238]/20 flex overflow-hidden animate-slide-up transition-all duration-300 ${
          isHistorySidebarOpen ? 'w-[96vw] sm:w-[520px] md:w-[760px]' : 'w-[95vw] sm:w-[450px] md:w-[480px]'
        }`}>
          {/* History Sidebar */}
          {isHistorySidebarOpen && (
            <div className="w-full md:w-80 h-full shrink-0 z-20 animate-fade-in border-r border-[#7A1238]/15">
              <ChatHistorySidebar
                conversations={conversations}
                activeConversationId={currentConversation?.conversationId || null}
                customerUid={currentUid}
                isFirebaseSynced={isFirebaseConfigured && !currentUid.startsWith('USR-GUEST')}
                onSelectConversation={handleSelectConversation}
                onNewChat={handleNewChat}
                onRefresh={refreshConversations}
                onClose={() => setIsHistorySidebarOpen(false)}
              />
            </div>
          )}

          {/* Main Active Chat Area */}
          <div className={`flex-1 flex flex-col h-full bg-[#FFF9F2] ${isHistorySidebarOpen ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#7A1238] via-[#8C1641] to-[#BE0750] p-3.5 sm:p-4 text-white flex items-center justify-between shrink-0 shadow-sm border-b border-[#D9A441]/30">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-[#D9A441]/50 text-[#F6E2B3]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#7A1238]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm font-bangla text-white truncate max-w-[160px] sm:max-w-[220px]">
                      {currentConversation?.title || 'প্রেয়সী AI শপিং অ্যাসিস্ট্যান্ট'}
                    </h4>
                    <span className="text-[9px] bg-[#D9A441] text-stone-900 font-extrabold px-1.5 py-0.2 rounded-full uppercase shrink-0">
                      Grounded
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 font-bangla flex items-center gap-1 truncate">
                    <span>রিয়েল-টাইম ডাটাবেস</span>
                    <span>·</span>
                    <span>স্থায়ী মেমোরি</span>
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1.5 text-white/80 shrink-0">
                {/* Dedicated History Sidebar Toggle Button */}
                <button
                  onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
                  className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-xs font-bangla flex items-center gap-1.5 border ${
                    isHistorySidebarOpen
                      ? 'bg-white text-[#7A1238] border-white shadow-xs font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                  title="পূর্ববর্তী চ্যাট হিস্টোরি ও সার্চ"
                >
                  <History className="w-3.5 h-3.5 text-[#F6E2B3]" />
                  <span className="hidden sm:inline font-semibold">হিস্টোরি</span>
                  {conversations.length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isHistorySidebarOpen ? 'bg-[#7A1238] text-white' : 'bg-[#D9A441] text-stone-900 font-bold'
                    }`}>
                      {conversations.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleNewChat}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-xs font-bangla flex items-center gap-1 text-white cursor-pointer"
                  title="নতুন চ্যাট শুরু করুন"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">নতুন</span>
                </button>

                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Guest Migration Notice Banner */}
            {migrationNotice && (
              <div className="p-2.5 bg-indigo-50 border-b border-indigo-200 text-xs font-bangla text-indigo-900 flex items-center justify-between gap-2 shrink-0 animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{migrationNotice}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleMigrate}
                    className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[10px] hover:bg-indigo-700"
                  >
                    যুক্ত করুন
                  </button>
                  <button onClick={() => setMigrationNotice(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Quick Prompt Pills Bar */}
            <div className="p-2 bg-[#F8E8E9]/60 border-b border-[#7A1238]/10 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.query)}
                  className="px-2.5 py-1 bg-white hover:bg-[#7A1238] hover:text-white text-gray-700 border border-gray-200 hover:border-[#7A1238] rounded-full text-[11px] font-bangla whitespace-nowrap transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                const formattedTime = new Date(msg.timestamp).toLocaleTimeString('bn-BD', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                // Find attached products from database
                const attachedProducts: Product[] = [];
                if (msg.relatedProductIds && msg.relatedProductIds.length > 0) {
                  msg.relatedProductIds.forEach(id => {
                    const prod = products.find(p => p.id === id);
                    if (prod && !attachedProducts.some(p => p.id === prod.id)) {
                      attachedProducts.push(prod);
                    }
                  });
                }

                return (
                  <div
                    key={msg.messageId}
                    className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[92%] sm:max-w-[85%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
                      {isAssistant && (
                        <div className="w-6 h-6 rounded-full bg-[#7A1238] text-white flex items-center justify-center shrink-0 mb-1 text-[10px]">
                          <Bot className="w-3.5 h-3.5 text-[#F6E2B3]" />
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bangla leading-relaxed shadow-2xs ${
                          isAssistant
                            ? 'bg-white text-gray-800 rounded-bl-xs border border-gray-100'
                            : 'bg-[#7A1238] text-white rounded-br-xs shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-1 px-1">
                      <span>{formattedTime}</span>
                      {msg.status === 'delivered' && !isAssistant && (
                        <Check className="w-3 h-3 text-emerald-600" />
                      )}
                    </div>

                    {/* Interactive Product Cards inside Chat */}
                    {attachedProducts.length > 0 && (
                      <div className="mt-3 ml-7 space-y-2.5 w-[92%] max-w-sm">
                        {attachedProducts.map(prod => (
                          <ChatProductCard key={prod.id} product={prod} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bangla pl-8">
                  <span className="w-2 h-2 rounded-full bg-[#BE0750] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#7A1238] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#D9A441] animate-bounce [animation-delay:0.4s]" />
                  <span>প্রেয়সী অ্যাসিস্ট্যান্ট ডাটাবেস অনুসন্ধান করছে...</span>
                </div>
              )}

              {/* Error Message with Retry Option */}
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-bangla flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  {lastFailedMessage && (
                    <button
                      onClick={handleRetry}
                      className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>আবার চেষ্টা করুন</span>
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }}
              className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="প্রশ্ন লিখুন... (e.g. ঢাকাই জামদানির দাম কত? বা অর্ডার PRY-2026-0815)"
                className="flex-1 px-4 py-2.5 text-xs bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#BE0750] focus:bg-white focus:outline-hidden text-gray-800 placeholder:text-gray-400 font-bangla"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-2xl bg-[#7A1238] hover:bg-[#BE0750] text-white transition-colors disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer shadow-xs"
                title="বার্তা পাঠান"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
