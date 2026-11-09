export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface ProductVariant {
  size?: string;
  color?: string;
  sku?: string;
  additionalPrice?: number;
  stock?: number;
}

export interface Product {
  id: string;
  nameEn: string;
  nameBn: string;
  sku: string;
  categoryId: string;
  description: string;
  regularPrice: number;
  discountPrice?: number;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFlashSale?: boolean;
  flashSaleEnds?: string;
  isDemo?: boolean;
  images: string[];
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  tags?: string[];
  fabric?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  icon?: string;
  image: string;
  itemCount?: number;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string; // unique item key: productId-size-color
  productId: string;
  nameEn: string;
  nameBn: string;
  image: string;
  price: number;
  regularPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  maxStock: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket';
export type DeliveryType = 'courier' | 'own';

export interface OrderItem {
  productId: string;
  nameEn: string;
  nameBn: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  division: string;
  district: string;
  upazila: string;
  areaVillage: string;
  deliveryAddress: string;
  orderNotes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'verified' | 'failed';
  transactionId?: string;
  deliveryType: DeliveryType;
  courierName?: string;
  trackingNumber?: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  couponCode?: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  userId?: string;
  isDemo?: boolean;
}

export type ReviewCategory =
  | 'bangladesh_delivery'
  | 'overseas_gift'
  | 'saree_fabric'
  | 'jewellery_craft'
  | 'packaging_safety'
  | 'general';

export type ReviewModerationStatus = 'approved' | 'pending' | 'rejected' | 'flagged';

export interface ReviewAdminResponse {
  authorName: string;
  authorRole: string;
  message: string;
  respondedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  userId?: string;
  rating: number;
  comment: string;
  location?: string;
  verifiedPurchase: boolean;
  orderId?: string;
  category?: ReviewCategory;
  status?: ReviewModerationStatus;
  helpfulCount?: number;
  votedUserIds?: string[];
  images?: string[];
  adminResponse?: ReviewAdminResponse;
  createdAt: string;
}

export interface ReviewTemplate {
  id: string;
  titleBn: string;
  titleEn: string;
  category: ReviewCategory;
  rating: number;
  sampleTextBn: string;
  sampleTextEn: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage (e.g. 10%) or fixed amount (e.g. 150 BDT)
  minOrder?: number;
  description: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  image: string;
  link?: string;
  badgeText?: string;
  isActive: boolean;
}

export interface DeliverySettings {
  insideDhakaCharge: number;
  outsideDhakaCharge: number;
  ownDeliveryCharge: number;
  courierDeliveryCharge: number;
  freeDeliveryThreshold: number;
}

export interface PaymentSettings {
  codEnabled: boolean;
  bkashEnabled: boolean;
  bkashNumber: string;
  bkashAccountType: 'Merchant' | 'Personal';
  nagadEnabled: boolean;
  nagadNumber: string;
  nagadAccountType: 'Merchant' | 'Personal';
  rocketEnabled: boolean;
  rocketNumber: string;
  rocketAccountType: 'Merchant' | 'Personal';
}

export interface StoreSettings {
  storeNameEn: string;
  storeNameBn: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  supportAddress: string;
  facebookUrl: string;
  whatsappNumber: string;
  designerCredit: string;
  delivery: DeliverySettings;
  payment: PaymentSettings;
}

export interface LoyaltyTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'earned' | 'redeemed';
  description: string;
  orderNumber?: string;
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type StaffRole =
  | 'super_admin'
  | 'admin'
  | 'managing_director'
  | 'manager'
  | 'employee'
  | 'order_manager'
  | 'inventory_manager'
  | 'accounts_staff'
  | 'customer_support'
  | 'delivery_staff'
  | 'marketing_staff';

export type UserRole = StaffRole | 'customer';

export type Permission =
  | 'products.read'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'orders.read'
  | 'orders.update'
  | 'orders.cancel'
  | 'customers.read'
  | 'customers.manage'
  | 'inventory.read'
  | 'inventory.update'
  | 'finance.read'
  | 'finance.manage'
  | 'reports.read'
  | 'staff.read'
  | 'staff.invite'
  | 'staff.manage'
  | 'settings.manage'
  | 'reviews.moderate';

export interface StaffMember {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: string;
  employeeId: string;
  jobTitle: string;
  reportingManager?: string;
  permissions: Permission[];
  status: 'active' | 'suspended' | 'invited';
  invitedAt: string;
  lastLoginAt?: string;
  createdBy: string;
}

export interface StaffRoleRecord {
  id: string; // Document ID in StaffRoles collection
  roleId: string;
  userUid?: string;
  userEmail: string;
  userName: string;
  role: StaffRole;
  permissions: Permission[];
  department?: string;
  employeeId?: string;
  assignedBy: string; // Must be nasirislammahimbd@gmail.com
  assignedAt: string;
  status: 'active' | 'suspended';
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
  ipAddress?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  address?: string;
  division?: string;
  district?: string;
  upazila?: string;
  avatarUrl?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  permissions?: Permission[];
  staffProfile?: StaffMember;
  savedAddresses?: {
    id?: string;
    label: string;
    address: string;
    division: string;
    district: string;
    upazila?: string;
    phone: string;
    isDefault?: boolean;
  }[];
  loyaltyPoints?: number;
  loyaltyTier?: LoyaltyTier;
  loyaltyHistory?: LoyaltyTransaction[];
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  couponCode: string;
  source: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface PriceDropAlert {
  id: string;
  userId: string;
  productId: string;
  productNameEn: string;
  productNameBn: string;
  productImage: string;
  currentPriceAtSet: number;
  targetPrice: number;
  userEmail?: string;
  userPhone?: string;
  notifyVia: 'both' | 'email' | 'sms';
  createdAt: string;
  status: 'active' | 'triggered' | 'cancelled';
}

export interface AIConversation {
  conversationId: string;
  customerUid: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  messageCount?: number;
  lastMessage?: string;
}

export interface AIMessage {
  messageId: string;
  conversationId: string;
  customerUid: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  timestamp: string;
  relatedProductIds?: string[];
  status: 'sent' | 'delivered' | 'failed';
}

export interface AISettings {
  enabled: boolean;
  welcomeMessageBn: string;
  welcomeMessageEn: string;
  businessInfoBn: string;
  businessInfoEn: string;
  instructions: string;
  faqs: { id: string; question: string; answer: string; category?: string }[];
}


