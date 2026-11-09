import { Category, Product, Banner, Coupon, StoreSettings, Review, NewsletterSubscriber, PriceDropAlert, ReviewTemplate } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'saree',
    nameEn: 'Saree',
    nameBn: 'শাড়ি',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    itemCount: 4,
    isFeatured: true
  },
  {
    id: 'womens-fashion',
    nameEn: "Women's Fashion",
    nameBn: 'মহিলাদের ফ্যাশন',
    icon: 'Crown',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    itemCount: 3,
    isFeatured: true
  },
  {
    id: 'jewellery',
    nameEn: 'Jewellery',
    nameBn: 'জুয়েলারি',
    icon: 'Gem',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    itemCount: 3,
    isFeatured: true
  },
  {
    id: 'cosmetics-beauty',
    nameEn: 'Cosmetics & Beauty',
    nameBn: 'কসমেটিকস ও রূপচর্চা',
    icon: 'HeartHandshake',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    itemCount: 3,
    isFeatured: true
  },
  {
    id: 'bags-accessories',
    nameEn: 'Bags & Accessories',
    nameBn: 'ব্যাগ ও অ্যাক্সেসরিজ',
    icon: 'ShoppingBag',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    isFeatured: true
  },
  {
    id: 'mens-fashion',
    nameEn: "Men's Fashion",
    nameBn: 'পুরুষদের ফ্যাশন',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    isFeatured: false
  },
  {
    id: 'electronics',
    nameEn: 'Electronics',
    nameBn: 'ইলেকট্রনিক্স',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    isFeatured: false
  },
  {
    id: 'home-living',
    nameEn: 'Home & Living',
    nameBn: 'হোম ও লিভিং',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: false
  },
  {
    id: 'kids-baby',
    nameEn: 'Kids & Baby',
    nameBn: 'বাচ্চাদের কালেকশন',
    icon: 'Smile',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: false
  },
  {
    id: 'gifts',
    nameEn: 'Gifts & Combos',
    nameBn: 'উপহার ও কম্বো',
    icon: 'Gift',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: false
  },
  {
    id: 'grocery-daily',
    nameEn: 'Grocery & Daily Needs',
    nameBn: 'মুদি ও নিত্যপ্রয়োজনীয়',
    icon: 'Coffee',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: false
  },
  {
    id: 'other-products',
    nameEn: 'Other Products',
    nameBn: 'অন্যান্য পণ্য',
    icon: 'Box',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: false
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'PRY-1001',
    nameEn: 'Dhakai Traditional Jamdani Saree - Burgundy & Gold',
    nameBn: 'ঢাকাই ঐতিহ্যবাহী জামদানি শাড়ি - মেরুন ও সোনালী',
    sku: 'PRY-SR-01',
    categoryId: 'saree',
    description: 'Handwoven by master artisans of Narayanganj using fine 84-count Egyptian combed cotton yarn. Features elaborate gold zari floral motifs (Kolka & Jaal design) with heavy designer aachol. Comes with unstitched blouse piece.',
    regularPrice: 7500,
    discountPrice: 5850,
    stock: 8,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: true,
    flashSaleEnds: '2026-11-05T23:59:59Z',
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['12 Hand Standard (১২ হাত)', '14 Hand Extended (১৪ হাত)'],
    colors: ['Burgundy & Gold', 'Royal Emerald Green', 'Navy Blue Gold', 'Blush Crimson'],
    rating: 4.9,
    reviewCount: 38,
    tags: ['Jamdani', 'Handloom', 'Festive', 'Traditional'],
    fabric: 'Pure Cotton with Gold Zari',
    createdAt: '2026-10-15T10:00:00Z'
  },
  {
    id: 'PRY-1002',
    nameEn: 'Mirpur Katan Silk Bridal Saree - Royal Maroon',
    nameBn: 'মিরপুর কাতান সিল্ক ব্রাইডাল শাড়ি - রাজকীয় মেরুন',
    sku: 'PRY-SR-02',
    categoryId: 'saree',
    description: 'Authentic Mirpur Banarasi Katan silk saree woven with rich meenakari floral jaal. High shine and rich drape ideal for bridal celebrations, weddings, and formal receptions.',
    regularPrice: 12000,
    discountPrice: 9490,
    stock: 5,
    status: 'active',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['12 Hand Standard'],
    colors: ['Royal Maroon', 'Deep Crimson', 'Golden Mustard'],
    rating: 5.0,
    reviewCount: 22,
    tags: ['Bridal', 'Katan Silk', 'Mirpur', 'Wedding'],
    fabric: 'Pure Katan Silk',
    createdAt: '2026-10-12T14:30:00Z'
  },
  {
    id: 'PRY-1003',
    nameEn: 'Pure Chanderi Silk Saree with Resham Buti',
    nameBn: 'খাঁটি চান্দেরি সিল্ক শাড়ি রেশম বুটি সহ',
    sku: 'PRY-SR-03',
    categoryId: 'saree',
    description: 'Lightweight, breathable pure Chanderi silk with delicate silver and gold thread work. Perfect for morning events, family get-togethers, and festive occasions.',
    regularPrice: 4200,
    discountPrice: 3450,
    stock: 14,
    status: 'active',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1583391733975-0b04bc4924c2?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['12 Hand Standard'],
    colors: ['Blush Pink', 'Mint Green', 'Ivory Cream'],
    rating: 4.7,
    reviewCount: 15,
    tags: ['Silk', 'Lightweight', 'Elegant'],
    fabric: 'Chanderi Silk',
    createdAt: '2026-10-20T08:00:00Z'
  },
  {
    id: 'PRY-1004',
    nameEn: 'Luxury Hand-Embroidered Georgette Three Piece',
    nameBn: 'লাক্সারি হ্যান্ড-এমব্রয়ডারি জর্জেট থ্রি পিস',
    sku: 'PRY-WF-01',
    categoryId: 'womens-fashion',
    description: 'Premium weight Fox Georgette kameez with heavy zardozi embroidery and pearl accents. Includes matching butter silk inner, santoon bottom pant, and sequence-worked digital dupatta.',
    regularPrice: 5200,
    discountPrice: 3990,
    stock: 12,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: true,
    flashSaleEnds: '2026-11-05T23:59:59Z',
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['38 (M)', '40 (L)', '42 (XL)', '44 (XXL)'],
    colors: ['Burgundy Wine', 'Dusty Rose', 'Midnight Black', 'Teal Blue'],
    rating: 4.8,
    reviewCount: 29,
    tags: ['Three Piece', 'Salwar Kameez', 'Embroidery'],
    fabric: 'Fox Georgette with Butter Silk Inner',
    createdAt: '2026-10-18T11:20:00Z'
  },
  {
    id: 'PRY-1005',
    nameEn: 'Designer Muslin Kurti & Pant Co-Ord Set',
    nameBn: 'ডিজাইনার মসলিন কুর্তি ও প্যান্ট কো-অর্ড সেট',
    sku: 'PRY-WF-02',
    categoryId: 'womens-fashion',
    description: 'Chic modern cut tailored from soft Bengali muslin with minimalist gold border stitching. Breathable comfort with effortless urban sophistication.',
    regularPrice: 3200,
    discountPrice: 2490,
    stock: 18,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['36 (S)', '38 (M)', '40 (L)', '42 (XL)'],
    colors: ['Warm White', 'Blush Peach', 'Lavender'],
    rating: 4.6,
    reviewCount: 19,
    tags: ['Co-ord', 'Muslin', 'Casual'],
    fabric: 'Dhakai Muslin Cotton',
    createdAt: '2026-10-19T09:15:00Z'
  },
  {
    id: 'PRY-1006',
    nameEn: '24K Gold Plated Kundan Bridal Choker Set',
    nameBn: '২৪ ক্যারেট গোল্ড প্লেটেড কুন্দন ব্রাইডাল চোকার সেট',
    sku: 'PRY-JW-01',
    categoryId: 'jewellery',
    description: 'High-grade brass base with genuine micro gold electroplating. Features handset uncut Kundan polki gemstones and cascading cluster freshwater pearls. Set contains: Choker, Jhumka Earrings, and Maang Tikka.',
    regularPrice: 6500,
    discountPrice: 4890,
    stock: 6,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: true,
    flashSaleEnds: '2026-11-05T23:59:59Z',
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['Free Size Adjustable'],
    colors: ['Ruby Red & Pearl', 'Emerald Green & Gold', 'Champagne Pearl'],
    rating: 4.9,
    reviewCount: 44,
    tags: ['Bridal', 'Kundan', 'Gold Plated', 'Choker'],
    fabric: 'Brass, Glass Kundan, Cultured Pearl',
    createdAt: '2026-10-14T16:45:00Z'
  },
  {
    id: 'PRY-1007',
    nameEn: 'Handcrafted Meenakari Jhumka Earrings',
    nameBn: 'হস্তশিল্প মীনাকারি ঝুমকা কানের দুল',
    sku: 'PRY-JW-02',
    categoryId: 'jewellery',
    description: 'Traditional Rajshahi-inspired filigree enamel work in vibrant royal hues with miniature hanging ghungroo beads. Lightweight on the earlobes for prolonged festive wear.',
    regularPrice: 1850,
    discountPrice: 1390,
    stock: 25,
    status: 'active',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['Standard Length (3.2 inch)'],
    colors: ['Burgundy & Mint', 'Deep Blue & Gold', 'Pink Peacock'],
    rating: 4.8,
    reviewCount: 31,
    tags: ['Jhumka', 'Earrings', 'Meenakari'],
    createdAt: '2026-10-10T12:00:00Z'
  },
  {
    id: 'PRY-1008',
    nameEn: 'Organic Saffron Glowing Facial Serum & Night Crème',
    nameBn: 'অর্গানিক জাফরান গ্লোয়িং ফেসিয়াল সিরাম ও নাইট ক্রিম',
    sku: 'PRY-CB-01',
    categoryId: 'cosmetics-beauty',
    description: 'Infused with premium Kashmiri saffron stigmas, niacinamide 5%, hyaluronic acid, and rosehip oil. Deeply nourishes the skin barrier, reduces pigmentation, and imparts natural luminous glow.',
    regularPrice: 2200,
    discountPrice: 1750,
    stock: 30,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['30ml Serum + 50g Cream (Combo)'],
    colors: ['Natural Herbal'],
    rating: 4.9,
    reviewCount: 52,
    tags: ['Skincare', 'Saffron', 'Halal', 'Organic'],
    createdAt: '2026-10-16T18:00:00Z'
  },
  {
    id: 'PRY-1009',
    nameEn: 'Matte Velvet Liquid Lipstick Combo (Set of 4)',
    nameBn: 'ম্যাট ভেলভেট লিকুইড লিপস্টিক কম্বো (৪টির সেট)',
    sku: 'PRY-CB-02',
    categoryId: 'cosmetics-beauty',
    description: 'Transfer-proof 16-hour stay enriched with Vitamin E and shea butter. Specially formulated shades tailored to enhance warm South Asian undertones without drying lips.',
    regularPrice: 1600,
    discountPrice: 1190,
    stock: 22,
    status: 'active',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['4 x 5ml Travel Pack'],
    colors: ['Preyoshi Nude Edit', 'Festive Reds & Plums'],
    rating: 4.7,
    reviewCount: 27,
    tags: ['Lipstick', 'Matte', 'Makeup'],
    createdAt: '2026-10-17T11:00:00Z'
  },
  {
    id: 'PRY-1010',
    nameEn: 'Structured Vegan Leather Luxury Tote Bag',
    nameBn: 'স্ট্রাকচার্ড ভেগান লেদার লাক্সারি টোট ব্যাগ',
    sku: 'PRY-BG-01',
    categoryId: 'bags-accessories',
    description: 'Durable water-resistant textured vegan PU leather with custom gold-finished hardware and signature monogram clasp. Features 3 interior zippered dividers, laptop sleeve, and adjustable crossbody strap.',
    regularPrice: 3800,
    discountPrice: 2890,
    stock: 10,
    status: 'active',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['Large (Fits 14" Laptop)'],
    colors: ['Burgundy Wine', 'Warm Tan Cognac', 'Midnight Black'],
    rating: 4.8,
    reviewCount: 35,
    tags: ['Handbag', 'Tote', 'Office & Party'],
    createdAt: '2026-10-11T15:00:00Z'
  },
  {
    id: 'PRY-1011',
    nameEn: 'Festive Embroidered Silk Panjabi for Men',
    nameBn: 'উৎসবের এমব্রয়ডারি সিল্ক পাঞ্জাবি',
    sku: 'PRY-MF-01',
    categoryId: 'mens-fashion',
    description: 'Finely spun semi-silk fabric with intricate collar and placket thread work. Classic tailored cut suited for Eid prayers, weddings, and formal occasions.',
    regularPrice: 3400,
    discountPrice: 2650,
    stock: 15,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['38 (M)', '40 (L)', '42 (XL)', '44 (XXL)'],
    colors: ['Maroon Gold', 'Royal White', 'Navy Blue'],
    rating: 4.7,
    reviewCount: 18,
    tags: ['Panjabi', 'Menswear', 'Eid Collection'],
    fabric: 'Semi Silk with Cotton Blend',
    createdAt: '2026-10-19T14:00:00Z'
  },
  {
    id: 'PRY-1012',
    nameEn: 'Wireless Noise Cancelling Studio Earbuds',
    nameBn: 'ওয়্যারলেস নয়েজ ক্যানসেলিং স্টুডিও ইয়ারবাডস',
    sku: 'PRY-EL-01',
    categoryId: 'electronics',
    description: 'Active Noise Cancellation (ANC) up to 35dB with Bluetooth 5.4, 40 hours battery life with charging case, and IPX5 sweat resistance. Crystal clear calling with 4-mic ENC.',
    regularPrice: 2900,
    discountPrice: 2190,
    stock: 20,
    status: 'active',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isDemo: true,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['One Size (3 Ear Tip Sizes)'],
    colors: ['Matte Black', 'Pearl White'],
    rating: 4.6,
    reviewCount: 64,
    tags: ['Audio', 'Earbuds', 'ANC'],
    createdAt: '2026-10-08T09:00:00Z'
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'BAN-01',
    titleEn: 'Signature Dhakai Jamdani & Katan Collection',
    titleBn: 'ঢাকাই জামদানি ও এক্সক্লুসিভ কাতান কালেকশন',
    subtitleEn: 'Handwoven luxury sarees crafted by heritage Bengali artisans with unstitched matching blouse.',
    subtitleBn: 'আভিজাত্য ও ঐতিহ্যের সেরা সংমিশ্রণে উৎসবের সেরা সাজ। ক্যাশ অন ডেলিভারি সুবিধা।',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    link: 'saree',
    badgeText: 'FESTIVE COLLECTION 2026',
    isActive: true
  },
  {
    id: 'BAN-02',
    titleEn: 'Royal Bridal Kundan & Gold Plated Jewellery',
    titleBn: 'রাজকীয় ব্রাইডাল কুন্দন ও গোল্ড প্লেটেড জুয়েলারি',
    subtitleEn: 'Intricately handcrafted choker sets, jhumkas and maang tikkas designed to steal every heart.',
    subtitleBn: 'বিশেষ ডিসকাউন্টে প্রিমিয়াম কুন্দন সেট সংগ্রহ করুন। সারাদেশে হোম ডেলিভারি।',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80',
    link: 'jewellery',
    badgeText: 'UP TO 30% OFF',
    isActive: true
  },
  {
    id: 'BAN-03',
    titleEn: 'Modern Women’s Fashion & Designer Three Pieces',
    titleBn: 'লেটেস্ট ট্রেন্ডি থ্রি পিস ও স্টাইলিশ কুর্তি কালেকশন',
    subtitleEn: 'Elevate your daily presence with comfortable luxury fabrics, fine embroidery, and flawless silhouettes.',
    subtitleBn: 'আপনার স্টাইল, আমাদের প্রাধান্য। স্পেশাল কুপন কোডে উপভোগ করুন অতিরিক্ত ছাড়।',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80',
    link: 'womens-fashion',
    badgeText: 'NEW ARRIVALS',
    isActive: true
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'PREYOSHI10',
    type: 'percentage',
    value: 10,
    minOrder: 1500,
    description: 'Get 10% instant discount on orders above ৳1500',
    isActive: true
  },
  {
    code: 'EID150',
    type: 'fixed',
    value: 150,
    minOrder: 2000,
    description: 'Flat ৳150 OFF on orders above ৳2000',
    isActive: true
  },
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrder: 1000,
    description: '10% OFF Welcome Coupon for Newsletter Subscribers',
    isActive: true
  },
  {
    code: 'WELCOME',
    type: 'fixed',
    value: 100,
    minOrder: 1000,
    description: 'Flat ৳100 OFF for new customers',
    isActive: true
  }
];

export const SAMPLE_REVIEW_TEMPLATES: ReviewTemplate[] = [
  {
    id: 'TMPL-01',
    titleBn: 'শাড়ি ও কাপড়ের আভিজাত্য',
    titleEn: 'Saree & Fabric Quality',
    category: 'saree_fabric',
    rating: 5,
    sampleTextBn: 'ঢাকাই জামদানি শাড়ির কাপড় খুবই প্রিমিয়াম ও নরম। রঙ ছবির চেয়েও বাস্তব চোখে অনেক বেশি উজ্জ্বল এবং আভিজাত্যপূর্ণ। আঁচলের নকশা ও বুনন নিখুঁত। যেকোনো বিয়ে বা বিশেষ অনুষ্ঠানে পরার জন্য চমৎকার।',
    sampleTextEn: 'The Dhakai Jamdani saree quality is supremely soft and luxurious. The zari border work is authentic and looks even more radiant in real light.'
  },
  {
    id: 'TMPL-02',
    titleBn: 'প্রবাসী ও পরিবারে উপহার',
    titleEn: 'Overseas & Family Gift',
    category: 'overseas_gift',
    rating: 5,
    sampleTextBn: 'আমি প্রবাস থেকে দেশে পরিবারের জন্মদিনের বিশেষ উপহার হিসেবে অর্ডার করেছিলাম। প্রেয়সী শপের টিম চমৎকার গিফট প্যাকেজিং ও সময়ে পৌঁছে দিয়েছে। পরিবারের সবাই ভীষণ খুশি!',
    sampleTextEn: 'Ordered from overseas as a surprise gift for my family in Bangladesh. Preyoshi team packed it beautifully with luxury wrap and delivered promptly.'
  },
  {
    id: 'TMPL-03',
    titleBn: 'দ্রুত হোম ডেলিভারি অভিজ্ঞতা',
    titleEn: 'Fast & Secure Home Delivery',
    category: 'bangladesh_delivery',
    rating: 5,
    sampleTextBn: 'অর্ডার করার পর মাত্র ২৪-৩৬ ঘণ্টার মধ্যে ঢাকায় ক্যাশ অন ডেলিভারিতে চেক করে পার্সেল হাতে পেয়েছি। ডেলিভারি রাইডারের ব্যবহার খুব অমায়িক ছিল।',
    sampleTextEn: 'Received the delivery within 36 hours in Dhaka. Rider was polite and allowed me to verify the parcel upon cash on delivery.'
  },
  {
    id: 'TMPL-04',
    titleBn: 'জুয়েলারি ও কারুকার্য ফিনিশিং',
    titleEn: 'Jewellery & Craftsmanship',
    category: 'jewellery_craft',
    rating: 5,
    sampleTextBn: 'কুন্দন জুয়েলারি সেটের গোল্ড প্লেটিং এবং পাথরের ফিনিশিং সত্যি রাজকীয়। মেটাল অত্যন্ত মজবুত এবং বিয়ে বাড়ির লাইটিংয়ে চোখ ধাঁধানো দেখায়।',
    sampleTextEn: 'The Kundan jewellery set finish is exquisitely royal. Looks magnificent under festive lights and stone settings are rock solid.'
  },
  {
    id: 'TMPL-05',
    titleBn: 'প্রিমিয়াম বক্স ও সুরক্ষিত প্যাকেজিং',
    titleEn: 'Premium Packaging & Safety',
    category: 'packaging_safety',
    rating: 5,
    sampleTextBn: 'প্যাকেজিং অত্যন্ত আকর্ষণীয় ও মজবুত ছিল। ডাবল বাবল র‍্যাপ ও প্রেয়সী ব্র্যান্ডেড বক্সে অক্ষত অবস্থায় পেয়েছি। নিখুঁত সেবা!',
    sampleTextEn: 'The product arrived in a rigid Preyoshi branded luxury box with double protective wrap. Zero damage during transit.'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'REV-01',
    productId: 'PRY-1001',
    customerName: 'Samira Akter',
    userId: 'USR-CUST-101',
    rating: 5,
    comment: 'অসাধারণ শাড়ি! ছবির চেয়েও বাস্তবে আরও সুন্দর ও নরম। ঢাকai জামদানির কাজ খুব সূক্ষ্ম এবং ফিনিশিং নিখুঁত। ধন্যবাদ প্রেয়সী শপকে দ্রুত হোম ডেলিভারি দেওয়ার জন্য।',
    location: 'Gulshan, Dhaka',
    verifiedPurchase: true,
    orderId: 'PRY-2026-0813',
    category: 'saree_fabric',
    status: 'approved',
    helpfulCount: 18,
    votedUserIds: ['USR-DEMO-1', 'USR-DEMO-2'],
    adminResponse: {
      authorName: 'PREYOSHI Official',
      authorRole: 'Customer Experience Lead',
      message: 'ধন্যবাদ সামিরা আপু আপনার আন্তরিক মতামতের জন্য! প্রেয়সী শপের সাথে থাকার জন্য আমরা কৃতজ্ঞ।',
      respondedAt: '2026-10-24T14:30:00Z'
    },
    createdAt: '2026-10-24T12:00:00Z'
  },
  {
    id: 'REV-02',
    productId: 'PRY-1006',
    customerName: 'Tanjila Rahman',
    userId: 'USR-CUST-102',
    rating: 5,
    comment: 'The Kundan choker set is truly regal. The gold plating quality is superior and it shines gracefully under wedding lights. Received so many compliments!',
    location: 'Agrabad, Chattogram',
    verifiedPurchase: true,
    orderId: 'PRY-2026-0790',
    category: 'jewellery_craft',
    status: 'approved',
    helpfulCount: 14,
    votedUserIds: ['USR-DEMO-3'],
    adminResponse: {
      authorName: 'PREYOSHI Official',
      authorRole: 'Quality & Design Lead',
      message: 'We are thrilled that you loved the bridal set! Wishing you endless joyful moments.',
      respondedAt: '2026-10-25T17:00:00Z'
    },
    createdAt: '2026-10-25T15:20:00Z'
  },
  {
    id: 'REV-03',
    productId: 'PRY-1004',
    customerName: 'Farhana Hossain',
    userId: 'USR-CUST-103',
    rating: 5,
    comment: 'জর্জেট থ্রি পিসের এমব্রয়ডারি আর ওড়নার কাজ খুবই চমৎকার। সাইজ চার্ট পারফেক্ট হয়েছে। ক্যাশ অন ডেলিভারিতে চেক করে নিতে পেরেছি।',
    location: 'Zindabazar, Sylhet',
    verifiedPurchase: true,
    orderId: 'PRY-2026-0745',
    category: 'bangladesh_delivery',
    status: 'approved',
    helpfulCount: 9,
    votedUserIds: [],
    createdAt: '2026-10-26T09:45:00Z'
  },
  {
    id: 'REV-04',
    productId: 'PRY-1010',
    customerName: 'Dr. Nusrat Jahan',
    userId: 'USR-CUST-104',
    rating: 5,
    comment: 'The vegan tote bag is spacious and holds my 14-inch laptop easily. Premium leather texture and great stitching. Delivery was within 48 hours.',
    location: 'Dhanmondi, Dhaka',
    verifiedPurchase: true,
    orderId: 'PRY-2026-0720',
    category: 'packaging_safety',
    status: 'approved',
    helpfulCount: 22,
    votedUserIds: ['USR-DEMO-5'],
    createdAt: '2026-10-27T17:10:00Z'
  },
  {
    id: 'REV-05',
    productId: 'PRY-1001',
    customerName: 'Ayesha Chowdhury',
    userId: 'USR-CUST-105',
    rating: 5,
    comment: 'লন্ডন থেকে প্রবাসে বসে আম্মুর জন্য ঢাকাই জামদানি উপহার পাঠিয়েছিলাম। প্রেয়সী শপ প্যাকেজিংয়ে বিশেষ শুভেচ্ছা কার্ড যুক্ত করে দিয়েছিল। আমার মা আনন্দে কেঁদে ফেলেছিলেন। অতুলনীয় আন্তরিকতা!',
    location: 'London, United Kingdom (Delivered to Sylhet)',
    verifiedPurchase: true,
    orderId: 'PRY-2026-0689',
    category: 'overseas_gift',
    status: 'approved',
    helpfulCount: 31,
    votedUserIds: ['USR-DEMO-7'],
    adminResponse: {
      authorName: 'PREYOSHI Official',
      authorRole: 'Managing Director',
      message: 'প্রবাসের ভাই-বোনদের ভালোবাসা দেশে পরিবারের কাছে পৌঁছে দিতে পারা আমাদের সবচেয়ে বড় তৃপ্তি। অনেক শুভকামনা আয়েশা আপু!',
      respondedAt: '2026-10-29T10:15:00Z'
    },
    createdAt: '2026-10-28T16:00:00Z'
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeNameEn: 'PREYOSHI SHOP',
  storeNameBn: 'প্রেয়সী শপ',
  tagline: 'Your Style ♥ Our Priority',
  supportPhone: '+880 1700-000000',
  supportEmail: 'support@preyoshishop.com',
  supportAddress: 'House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh',
  facebookUrl: 'https://www.facebook.com/Preyoshishop/',
  whatsappNumber: '+8801700000000',
  designerCredit: 'Nurtaz Agency',
  delivery: {
    insideDhakaCharge: 70,
    outsideDhakaCharge: 130,
    ownDeliveryCharge: 60,
    courierDeliveryCharge: 120,
    freeDeliveryThreshold: 2000
  },
  payment: {
    codEnabled: true,
    bkashEnabled: true,
    bkashNumber: '01700-000000',
    bkashAccountType: 'Merchant',
    nagadEnabled: true,
    nagadNumber: '01800-000000',
    nagadAccountType: 'Merchant',
    rocketEnabled: true,
    rocketNumber: '01900-000000',
    rocketAccountType: 'Personal'
  }
};

export const INITIAL_NEWSLETTER_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'SUB-101',
    email: 'samira.akter@example.com',
    name: 'Samira Akter',
    phone: '01711223344',
    couponCode: 'WELCOME10',
    source: 'Homepage VIP Signup',
    subscribedAt: '2026-10-25T11:20:00Z',
    status: 'active'
  },
  {
    id: 'SUB-102',
    email: 'tanjila.r@example.com',
    name: 'Tanjila Rahman',
    phone: '01812334455',
    couponCode: 'WELCOME10',
    source: 'Homepage VIP Signup',
    subscribedAt: '2026-10-29T14:45:00Z',
    status: 'active'
  },
  {
    id: 'SUB-103',
    email: 'dr.nusrat.jahan@gmail.com',
    name: 'Dr. Nusrat Jahan',
    phone: '01923456789',
    couponCode: 'WELCOME10',
    source: 'Footer Newsletter',
    subscribedAt: '2026-11-01T09:15:00Z',
    status: 'active'
  },
  {
    id: 'SUB-104',
    email: 'farhana.hossain@yahoo.com',
    name: 'Farhana Hossain',
    phone: '01678901234',
    couponCode: 'WELCOME10',
    source: 'Homepage VIP Signup',
    subscribedAt: '2026-11-03T16:30:00Z',
    status: 'active'
  }
];

export const INITIAL_PRICE_DROP_ALERTS: PriceDropAlert[] = [
  {
    id: 'PDA-101',
    userId: 'USR-GUEST',
    productId: 'PRY-1006',
    productNameEn: '24K Gold Plated Kundan Bridal Choker Set',
    productNameBn: '২৪ ক্যারেট গোল্ড প্লেটেড কুন্দন ব্রাইডাল চোকার সেট',
    productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    currentPriceAtSet: 4890,
    targetPrice: 4400,
    userEmail: 'nasirislammahimbd@gmail.com',
    userPhone: '01712-345678',
    notifyVia: 'both',
    createdAt: '2026-10-29T10:15:00Z',
    status: 'active'
  },
  {
    id: 'PDA-102',
    userId: 'USR-GUEST',
    productId: 'PRY-1001',
    productNameEn: 'Dhakai Traditional Jamdani Saree - Burgundy & Gold',
    productNameBn: 'ঢাকাই ঐতিহ্যবাহী জামদানি শাড়ি - মেরুন ও সোনালী',
    productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    currentPriceAtSet: 5850,
    targetPrice: 5200,
    userEmail: 'nasirislammahimbd@gmail.com',
    userPhone: '01712-345678',
    notifyVia: 'both',
    createdAt: '2026-11-01T15:30:00Z',
    status: 'active'
  }
];


