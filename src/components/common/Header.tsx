import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, ShoppingBag, Heart, User, ShieldCheck,
  Phone, MessageCircle, Truck, Package, X, ChevronRight, Menu,
  Sparkles, Tag, ArrowRight, Camera, Bot, CornerDownLeft, Layers, Check
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../brand/BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { Product } from '../../types';


// Popular predictive search suggestions
const TRENDING_SEARCH_TAGS = [
  { label: 'জামদানি শাড়ি', query: 'জামদানি' },
  { label: 'কুন্দন জুয়েলারি', query: 'কুন্দন' },
  { label: 'কাতান শাড়ি', query: 'কাতান' },
  { label: 'থ্রি পিস', query: 'থ্রি পিস' },
  { label: 'সিল্ক শাড়ি', query: 'সিল্ক' },
  { label: 'লেডিস ব্যাগ', query: 'ব্যাগ' },
  { label: 'কানের দুল', query: 'কানের দুল' },
  { label: 'ব্রাইডাল সেট', query: 'ব্রাইডাল' }
];

export const Header: React.FC = () => {
  const {
    cartCount,
    cartSubtotal,
    wishlist,
    products,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    addToCart,
    setIsCartOpen,
    setIsAuthOpen,
    setIsProfileOpen,
    setIsOrderTrackingOpen,
    currentView,
    setCurrentView,
    setSelectedProductId,
    settings,
    openARTryOn,
    setIsChatOpen

  } = useStore();

  const { currentUser } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Selected suggestion index for keyboard navigation (-1 = none)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  // Substring matcher with highlight
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase().trim();
    const index = lowerText.indexOf(lowerQuery);
    if (index === -1) return <span>{text}</span>;

    const before = text.slice(0, index);
    const match = text.slice(index, index + lowerQuery.length);
    const after = text.slice(index + lowerQuery.length);

    return (
      <span>
        {before}
        <mark className="bg-[#D9A441]/40 text-[#7A1238] font-bold px-0.5 rounded-xs">
          {match}
        </mark>
        {after}
      </span>
    );
  };

  // Comprehensive Live Autocomplete Suggestions
  const autocompleteData = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        phrases: [],
        categories: [],
        products: [],
        categorized: { saree: [], jewellery: [], fashion: [], others: [], totalCount: 0 },
        totalItems: 0
      };
    }

    const q = searchQuery.toLowerCase().trim();

    // 1. Matched Search Phrases (Autocomplete completion suggestions)
    const phraseSet = new Set<string>();

    // From trending tags
    TRENDING_SEARCH_TAGS.forEach(t => {
      if (t.query.toLowerCase().includes(q) || t.label.toLowerCase().includes(q)) {
        phraseSet.add(t.label);
      }
    });

    // From categories
    categories.forEach(c => {
      if (c.nameBn.toLowerCase().includes(q)) phraseSet.add(c.nameBn);
      if (c.nameEn.toLowerCase().includes(q)) phraseSet.add(c.nameEn);
    });

    // From product names and tags
    products.forEach(p => {
      if (p.nameBn.toLowerCase().includes(q)) phraseSet.add(p.nameBn);
      if (p.nameEn.toLowerCase().includes(q)) phraseSet.add(p.nameEn);
      p.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(q)) phraseSet.add(tag);
      });
      if (p.fabric && p.fabric.toLowerCase().includes(q)) phraseSet.add(p.fabric);
    });

    const phrases = Array.from(phraseSet).slice(0, 4);

    // 2. Direct Category Matches (Quick Jumps)
    const matchingCategories = categories.filter(c =>
      c.nameBn.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q)
    ).slice(0, 3);

    // 3. Live Matching Products
    const matchingProducts = products.filter(p =>
      p.nameEn.toLowerCase().includes(q) ||
      p.nameBn.includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
      (p.fabric && p.fabric.toLowerCase().includes(q))
    );

    // Grouping
    const saree: Product[] = [];
    const jewellery: Product[] = [];
    const fashion: Product[] = [];
    const others: Product[] = [];

    matchingProducts.forEach(product => {
      const catId = product.categoryId.toLowerCase();
      const name = (product.nameEn + ' ' + product.nameBn).toLowerCase();

      if (catId === 'saree' || name.includes('saree') || name.includes('শাড়ি')) {
        saree.push(product);
      } else if (catId === 'jewellery' || name.includes('jewel') || name.includes('কুন্দন') || name.includes('গহনা') || name.includes('দুল')) {
        jewellery.push(product);
      } else if (
        catId === 'womens-fashion' ||
        catId === 'mens-fashion' ||
        name.includes('dress') ||
        name.includes('থ্রি পিস') ||
        name.includes('কুর্তি') ||
        name.includes('পাঞ্জাবি')
      ) {
        fashion.push(product);
      } else {
        others.push(product);
      }
    });

    const topProducts = matchingProducts.slice(0, 5);
    const totalItems = phrases.length + matchingCategories.length + topProducts.length;

    return {
      phrases,
      categories: matchingCategories,
      products: topProducts,
      categorized: {
        saree: saree.slice(0, 3),
        jewellery: jewellery.slice(0, 3),
        fashion: fashion.slice(0, 3),
        others: others.slice(0, 3),
        totalCount: matchingProducts.length
      },
      totalItems
    };
  }, [searchQuery, products, categories]);

  // Click outside listener for search popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setIsMobileSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product_detail');
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
    setActiveSuggestionIndex(-1);
  };

  const handleApplySearchTag = (tagQuery: string) => {
    setSearchQuery(tagQuery);
    setIsSearchFocused(true);
    setIsMobileSearchFocused(true);
    setActiveSuggestionIndex(-1);
  };

  const handleViewAllResults = () => {
    setCurrentView('store');
    setSelectedCategory('all');
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
    setActiveSuggestionIndex(-1);
  };

  const handleQuickAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setQuickAddedId(product.id);
    setTimeout(() => setQuickAddedId(null), 1800);
  };

  // Keyboard navigation listener (Arrow keys, Tab to complete, Enter to select, Escape to close)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { phrases, categories: catMatches, products: prodMatches, totalItems } = autocompleteData;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsSearchFocused(true);
      setIsMobileSearchFocused(true);
      if (totalItems > 0) {
        setActiveSuggestionIndex(prev => (prev + 1) % totalItems);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsSearchFocused(true);
      setIsMobileSearchFocused(true);
      if (totalItems > 0) {
        setActiveSuggestionIndex(prev => (prev - 1 + totalItems) % totalItems);
      }
    } else if (e.key === 'Tab' || (e.key === 'ArrowRight' && e.currentTarget.selectionStart === searchQuery.length)) {
      if (phrases.length > 0) {
        e.preventDefault();
        const fillText = activeSuggestionIndex >= 0 && activeSuggestionIndex < phrases.length
          ? phrases[activeSuggestionIndex]
          : phrases[0];
        setSearchQuery(fillText);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && totalItems > 0) {
        let idx = activeSuggestionIndex;
        // Check if in phrases
        if (idx < phrases.length) {
          handleApplySearchTag(phrases[idx]);
          return;
        }
        idx -= phrases.length;
        // Check if in categories
        if (idx < catMatches.length) {
          setSelectedCategory(catMatches[idx].id);
          setCurrentView('store');
          setIsSearchFocused(false);
          setIsMobileSearchFocused(false);
          return;
        }
        idx -= catMatches.length;
        // Check if in products
        if (idx < prodMatches.length) {
          handleSelectSearchResult(prodMatches[idx].id);
          return;
        }
      }
      handleViewAllResults();
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setIsMobileSearchFocused(false);
      setActiveSuggestionIndex(-1);
    }
  };

  // Reusable Live Autocomplete Dropdown
  const renderSearchResultsDropdown = () => {
    const { phrases, categories: catMatches, products: prodMatches, categorized } = autocompleteData;
    let runningIndex = 0;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#7A1238]/15 overflow-hidden z-50 animate-slide-up max-h-[78vh] flex flex-col">
        {/* Search Header Bar with Autocomplete & Keyboard Hint */}
        <div className="p-3 bg-[#FFF9F2] border-b border-[#7A1238]/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#7A1238] font-bangla">
            <Sparkles className="w-3.5 h-3.5 text-[#BE0750]" />
            <span>
              {searchQuery.trim()
                ? `লাইভ অটো-কমপ্লিট (${categorized.totalCount} টি পণ্য পাওয়া গেছে)`
                : 'জনপ্রিয় অনুসন্ধান ও ক্যাটাগরি'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-gray-500 font-mono bg-white px-1.5 py-0.5 rounded-md border border-gray-200">
              <span>↑↓ নেভিগেশন</span>
              <span>·</span>
              <span>Tab পূরণ</span>
            </span>

            {searchQuery.trim() && (
              <button
                onClick={handleViewAllResults}
                className="text-[11px] font-bold text-[#BE0750] hover:underline flex items-center gap-1 cursor-pointer font-bangla"
              >
                <span>সব পণ্য</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto divide-y divide-gray-100 p-2 space-y-2">
          {/* Autocomplete Phrases Section */}
          {searchQuery.trim() && phrases.length > 0 && (
            <div className="p-2 bg-gradient-to-r from-amber-50/50 to-pink-50/40 rounded-xl space-y-1.5">
              <div className="text-[11px] font-bold text-gray-600 font-bangla flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Search className="w-3 h-3 text-[#7A1238]" />
                  <span>অটো-কমপ্লিট কিওয়ার্ড সাজেশন (Autocomplete):</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">Tab / Click to Complete</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {phrases.map((phrase, idx) => {
                  const itemIndex = idx;
                  const isSelected = activeSuggestionIndex === itemIndex;
                  return (
                    <button
                      key={phrase}
                      onClick={() => handleApplySearchTag(phrase)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bangla flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#7A1238] text-white border-[#7A1238] font-bold shadow-xs'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-[#BE0750] hover:text-[#BE0750]'
                      }`}
                    >
                      <Search className="w-3 h-3 text-[#D9A441]" />
                      <span>{highlightMatch(phrase, searchQuery)}</span>
                      <CornerDownLeft className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Direct Category Jump Section */}
          {searchQuery.trim() && catMatches.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="text-[11px] font-bold text-gray-500 font-bangla flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#BE0750]" />
                <span>সরাসরি ক্যাটাগরিতে যান (Category Shortcuts):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {catMatches.map((cat, idx) => {
                  const itemIndex = phrases.length + idx;
                  const isSelected = activeSuggestionIndex === itemIndex;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentView('store');
                        setIsSearchFocused(false);
                        setIsMobileSearchFocused(false);
                      }}
                      className={`p-2 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-[#7A1238] text-white border-[#7A1238] shadow-xs'
                          : 'bg-[#F8E8E9]/60 hover:bg-[#F8E8E9] border-[#BE0750]/20 text-gray-900'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 text-[#7A1238] font-bold text-xs shadow-2xs">
                        {cat.nameBn.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bangla font-bold text-xs truncate block">
                          {cat.nameBn}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate block">
                          {cat.nameEn}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Matching Products List */}
          {searchQuery.trim() && (
            <div className="space-y-1 pt-1">
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-[#7A1238] bg-[#F8E8E9]/80 rounded-lg">
                <span className="font-bangla">লাইভ পণ্য অনুসন্ধান ({categorized.totalCount} টি পাওয়া গেছে)</span>
                <span className="text-[10px] text-gray-500 font-mono">তাত্ক্ষণিক নির্বাচন</span>
              </div>

              {categorized.totalCount === 0 ? (
                <div className="p-6 text-center text-gray-500 font-bangla text-xs space-y-1">
                  <p className="font-semibold text-gray-700">"{searchQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি।</p>
                  <p className="text-[11px] text-gray-400">বানান সঠিক কিনা দেখুন অথবা উপরের সাজেস্টেড কিওয়ার্ডগুলো ট্রাই করুন।</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {prodMatches.map((product, idx) => {
                    const itemIndex = phrases.length + catMatches.length + idx;
                    const isSelected = activeSuggestionIndex === itemIndex;
                    const currentPrice = product.discountPrice ?? product.regularPrice;
                    const isQuickAdded = quickAddedId === product.id;

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectSearchResult(product.id)}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#7A1238]/10 border-[#7A1238] shadow-xs'
                            : 'hover:bg-[#F8E8E9]/60 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={product.images[0]}
                            alt={product.nameEn}
                            className="w-12 h-12 object-cover rounded-xl shrink-0 border border-gray-100 shadow-2xs"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 font-bangla truncate">
                                {highlightMatch(product.nameBn, searchQuery)}
                              </h4>
                              {product.stock > 0 ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                                  ইন স্টক
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 shrink-0">
                                  স্টক শেষ
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate">
                              {highlightMatch(product.nameEn, searchQuery)}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-black text-[#7A1238] font-mono">
                                ৳{currentPrice.toLocaleString()}
                              </span>
                              {product.discountPrice && (
                                <span className="text-[10px] text-gray-400 line-through font-mono">
                                  ৳{product.regularPrice.toLocaleString()}
                                </span>
                              )}
                              {product.discountPrice && (
                                <span className="text-[10px] font-bold text-[#BE0750] bg-pink-100 px-1.5 py-0.2 rounded-md">
                                  ছাড়
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct action triggers right inside autocomplete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleQuickAddToCart(e, product)}
                            disabled={product.stock <= 0}
                            className={`py-1.5 px-2.5 rounded-xl text-xs font-bold font-bangla transition-all flex items-center gap-1 cursor-pointer ${
                              isQuickAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 hover:bg-[#7A1238] hover:text-white text-gray-700'
                            }`}
                            title="কার্ট-এ দ্রুত যোগ করুন"
                          >
                            {isQuickAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span className="hidden sm:inline text-[11px]">যুক্ত হয়েছে</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[11px]">কার্ট</span>
                              </>
                            )}
                          </button>

                          <div className="p-1 text-gray-400 group-hover:text-[#BE0750]">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Initial State when no query is typed: Trending Tags */}
          {!searchQuery.trim() && (
            <div className="space-y-3 p-1">
              <div className="p-3 bg-gray-50/70 rounded-2xl">
                <div className="text-xs font-bold text-gray-700 font-bangla mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>জনপ্রিয় অনুসন্ধান (Trending Searches):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCH_TAGS.map(tag => (
                    <button
                      key={tag.label}
                      onClick={() => handleApplySearchTag(tag.query)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bangla bg-white border border-gray-200 text-gray-700 hover:border-[#BE0750] hover:text-[#BE0750] transition-all cursor-pointer shadow-2xs"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-gray-100">
                <span className="text-xs font-bold text-gray-700 font-bangla block mb-2">
                  জনপ্রিয় ক্যাটাগরি সমূহ:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.slice(0, 6).map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategory(c.id);
                        setCurrentView('store');
                        setIsSearchFocused(false);
                        setIsMobileSearchFocused(false);
                      }}
                      className="p-2 rounded-xl bg-gray-50 hover:bg-[#F8E8E9] text-gray-800 text-left text-xs font-bangla font-semibold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{c.nameBn}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer link to view full catalog */}
        {categorized.totalCount > 0 && (
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <button
              onClick={handleViewAllResults}
              className="w-full py-2.5 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold font-bangla transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>সকল ফলাফল দেখুন ({categorized.totalCount} টি পণ্য)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };


  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F2] border-b border-[#7A1238]/10 shadow-xs">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#7A1238] via-[#BE0750] to-[#7A1238] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${settings.supportPhone}`}
              className="flex items-center gap-1.5 hover:text-[#F6E2B3] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#D9A441]" />
              <span className="hidden sm:inline font-bangla">হটলাইন:</span>
              <span className="font-semibold">{settings.supportPhone}</span>
            </a>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Preyoshi%20Shop`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 hover:text-[#F6E2B3] transition-colors"
            >
              <MessageCircle className="w-3 h-3 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1 hover:text-[#F6E2B3] transition-colors"
            >
              <span className="text-[#F6E2B3] font-bold">f</span>
              <span>Facebook Page</span>
            </a>
          </div>

          <div className="flex items-center gap-2 text-center truncate">
            <Truck className="w-3.5 h-3.5 text-[#D9A441] shrink-0 hidden sm:inline" />
            <span className="truncate">
              ক্যাশ অন ডেলিভারি সুবিধা · ৳{settings.delivery.freeDeliveryThreshold.toLocaleString()} এর অর্ডারে ফ্রি ডেলিভারি!
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              onClick={() => openARTryOn()}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-[#D9A441] hover:text-stone-900 px-2.5 py-0.5 rounded-full transition-all font-semibold cursor-pointer border border-[#D9A441]/40 text-[#F6E2B3] text-[10px] sm:text-xs shadow-xs"
              title="Launch AR Virtual Try-On Studio"
            >
              <Camera className="w-3 h-3" />
              <span>AR ট্রাই-অন</span>
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              className="hidden sm:flex items-center gap-1 hover:text-[#F6E2B3] transition-colors font-medium cursor-pointer"
              title="Chat with Preyoshi AI Support"
            >
              <Bot className="w-3 h-3 text-[#D9A441]" />
              <span>AI সহায়তা</span>
            </button>

            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="flex items-center gap-1 hover:text-[#F6E2B3] transition-colors font-medium cursor-pointer"
            >
              <Package className="w-3 h-3 text-[#D9A441]" />
              <span>অর্ডার ট্র্যাক</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo */}
        <button
          onClick={() => {
            setCurrentView('store');
            setSelectedCategory('all');
          }}
          className="text-left shrink-0 cursor-pointer focus:outline-hidden"
        >
          <BrandLogo size="md" />
        </button>

        {/* Enhanced Desktop Live Search Bar with Predictive Categorized Results */}
        <div ref={searchRef} className="relative flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="পণ্য বা ক্যাটাগরি সার্চ করুন... (e.g. জামদানি, শাড়ি, জুয়েলারি, থ্রি পিস)"

              className="w-full bg-white pl-10 pr-9 py-2 text-xs sm:text-sm rounded-full border border-[#D9A441]/40 focus:border-[#BE0750] focus:ring-2 focus:ring-[#BE0750]/20 focus:outline-hidden text-gray-800 placeholder:text-gray-400 shadow-2xs transition-all font-bangla"
            />
            <Search className="w-4 h-4 text-[#7A1238] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categorized Dropdown on Focus */}
          {isSearchFocused && renderSearchResultsDropdown()}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Wishlist Button with Dedicated View Navigation */}
          <button
            onClick={() => {
              setCurrentView('wishlist');
            }}
            className={`relative p-2 rounded-xl transition-all cursor-pointer ${
              currentView === 'wishlist'
                ? 'bg-[#7A1238] text-white shadow-xs'
                : 'text-[#7A1238] hover:bg-[#F8E8E9]'
            }`}
            title="Wishlist (পছন্দের তালিকা)"
          >
            <Heart className={`w-5 h-5 ${currentView === 'wishlist' ? 'fill-current text-[#F6E2B3]' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#BE0750] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Customer / Auth Profile */}
          <button
            onClick={() => {
              if (currentUser) {
                setIsProfileOpen(true);
              } else {
                setIsAuthOpen(true);
              }
            }}
            className="flex items-center gap-1.5 p-2 rounded-xl text-[#7A1238] hover:bg-[#F8E8E9] transition-colors cursor-pointer"
            title={currentUser ? `Logged in as ${currentUser.name}` : 'Customer Login'}
          >
            <User className="w-5 h-5" />
            <span className="hidden xl:inline text-xs font-semibold">
              {currentUser ? currentUser.name.split(' ')[0] : 'লগইন'}
            </span>
          </button>

          {/* Admin Dashboard Switcher Button */}
          <button
            onClick={() => setCurrentView(currentView === 'admin' ? 'store' : 'admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              currentView === 'admin'
                ? 'bg-[#7A1238] text-white ring-2 ring-[#D9A441]'
                : 'bg-[#F8E8E9] text-[#7A1238] hover:bg-[#7A1238] hover:text-white border border-[#BE0750]/20'
            }`}
            title="Admin Management Panel"
          >
            <ShieldCheck className="w-4 h-4 text-[#D9A441]" />
            <span className="hidden sm:inline">{currentView === 'admin' ? 'স্টোর ভিউ' : 'অ্যাডমিন'}</span>
          </button>

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#7A1238] hover:bg-[#5e0c29] text-white px-3 sm:px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#F6E2B3] group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#BE0750] text-white text-[10px] font-extrabold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold text-xs sm:text-sm">
              ৳{cartSubtotal.toLocaleString()}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden text-[#7A1238] rounded-lg hover:bg-[#F8E8E9]"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Search Bar with Predictive Categorized Dropdown */}
      <div ref={mobileSearchRef} className="relative px-3 pb-2.5 md:hidden">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsMobileSearchFocused(true);
            }}
            onFocus={() => setIsMobileSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="পণ্য সার্চ করুন (e.g. শাড়ি, জুয়েলারি, থ্রি পিস)..."

            className="w-full bg-white pl-9 pr-8 py-2 text-xs rounded-full border border-[#D9A441]/40 focus:border-[#BE0750] text-gray-800 placeholder:text-gray-400 shadow-2xs font-bangla"
          />
          <Search className="w-3.5 h-3.5 text-[#7A1238] absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Dropdown on Focus */}
        {isMobileSearchFocused && renderSearchResultsDropdown()}
      </div>

      {/* 3. Category Navigation Tabs */}
      <nav className="border-t border-[#7A1238]/10 bg-[#FFF9F2]/90 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 no-scrollbar text-xs">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentView('store');
              }}
              className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-all cursor-pointer ${
                selectedCategory === 'all' && currentView === 'store'
                  ? 'bg-[#7A1238] text-white font-semibold shadow-xs'
                  : 'text-gray-700 hover:text-[#7A1238] hover:bg-[#F8E8E9]'
              }`}
            >
              <span>সকল পণ্য (All)</span>
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentView('store');
                }}
                className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id && currentView === 'store'
                    ? 'bg-[#7A1238] text-white font-semibold shadow-xs'
                    : 'text-gray-700 hover:text-[#7A1238] hover:bg-[#F8E8E9]'
                }`}
              >
                <span className="font-bangla">{cat.nameBn}</span>
                <span className="text-[10px] opacity-75 hidden lg:inline">({cat.nameEn})</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

// Reusable individual search item
const SearchResultItem: React.FC<{ product: Product; onSelect: (id: string) => void }> = ({
  product,
  onSelect
}) => {
  const currentPrice = product.discountPrice ?? product.regularPrice;
  return (
    <button
      onClick={() => onSelect(product.id)}
      className="w-full text-left p-2 rounded-xl hover:bg-[#F8E8E9]/60 flex items-center gap-3 transition-colors cursor-pointer group"
    >
      <img
        src={product.images[0]}
        alt={product.nameEn}
        className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-100 shadow-2xs"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-gray-800 font-bangla truncate group-hover:text-[#BE0750]">
          {product.nameBn}
        </h4>
        <p className="text-[10px] text-gray-400 truncate">{product.nameEn}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-bold text-[#7A1238]">
            ৳{currentPrice.toLocaleString()}
          </span>
          {product.discountPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ৳{product.regularPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#BE0750] group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
};
