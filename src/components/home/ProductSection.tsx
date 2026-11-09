import React, { useMemo } from 'react';
import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';

export const ProductSection: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery
  } = useStore();

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category filter
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchEn = p.nameEn.toLowerCase().includes(q);
          const matchBn = p.nameBn.includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchTag = p.tags && p.tags.some(t => t.toLowerCase().includes(q));
          if (!matchEn && !matchBn && !matchDesc && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice ?? a.regularPrice;
        const priceB = b.discountPrice ?? b.regularPrice;
        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const activeCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <section id="product-catalog" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Catalog Header with Filters & Sorting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#7A1238]/10 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#BE0750] uppercase tracking-wider mb-1 font-serif-brand">
            <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>
              {selectedCategory === 'all'
                ? 'সকল ক্যাটাগরি'
                : `${activeCategoryObj?.nameBn} (${activeCategoryObj?.nameEn})`}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-bangla text-[#2A101A]">
            {searchQuery
              ? `"${searchQuery}" এর জন্য অনুসন্ধান ফলাফল (${filteredProducts.length})`
              : selectedCategory === 'all'
              ? 'প্রিমিয়াম কালেকশন ও ট্রেন্ডিং ড্রেস'
              : `${activeCategoryObj?.nameBn} কালেকশন`}
          </h2>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7A1238]" />
            <span className="font-medium hidden sm:inline">সর্ট করুন:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-hidden cursor-pointer"
            >
              <option value="featured">ফিচার্ড (Featured)</option>
              <option value="newest">নতুন কালেকশন (Newest)</option>
              <option value="price_asc">দাম: কম থেকে বেশি (Price: Low to High)</option>
              <option value="price_desc">দাম: বেশি থেকে কম (Price: High to Low)</option>
              <option value="rating">সর্বোচ্চ রেটিং (Top Rated)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <p className="text-gray-500 font-bangla text-base">
            দুঃখিত, আপনার অনুসন্ধানের সাথে মিলে এমন কোনো পণ্য পাওয়া যায়নি।
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-[#7A1238] text-white text-xs font-semibold rounded-xl hover:bg-[#BE0750] transition-colors"
          >
            সকল পণ্য দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
