import { StaffRole, Permission, StaffMember, AuditLog, User } from '../types';
import { StaffRolesService } from './staffRolesService';

export const SUPER_ADMIN_EMAIL = 'nasirislammahimbd@gmail.com';
export const SUPER_ADMIN_NAME = 'Mahim Islam (Super Admin)';
export const SUPER_ADMIN_ID = 'STAFF-SA-001';

// All 19 granular enterprise permissions
export const ALL_PERMISSIONS: Permission[] = [
  'products.read',
  'products.create',
  'products.update',
  'products.delete',
  'orders.read',
  'orders.update',
  'orders.cancel',
  'customers.read',
  'customers.manage',
  'inventory.read',
  'inventory.update',
  'finance.read',
  'finance.manage',
  'reports.read',
  'staff.read',
  'staff.invite',
  'staff.manage',
  'settings.manage',
  'reviews.moderate'
];

// Role default permission mappings
export const ROLE_DEFAULT_PERMISSIONS: Record<StaffRole, Permission[]> = {
  super_admin: [...ALL_PERMISSIONS],
  admin: [
    'products.read', 'products.create', 'products.update', 'products.delete',
    'orders.read', 'orders.update', 'orders.cancel',
    'customers.read', 'customers.manage',
    'inventory.read', 'inventory.update',
    'finance.read', 'finance.manage',
    'reports.read',
    'staff.read', 'staff.invite',
    'settings.manage',
    'reviews.moderate'
  ],
  managing_director: [
    'products.read',
    'orders.read',
    'customers.read',
    'inventory.read',
    'finance.read',
    'reports.read',
    'staff.read',
    'settings.manage'
  ],
  manager: [
    'products.read', 'products.create', 'products.update',
    'orders.read', 'orders.update',
    'customers.read',
    'inventory.read', 'inventory.update',
    'reports.read',
    'reviews.moderate'
  ],
  order_manager: [
    'orders.read', 'orders.update', 'orders.cancel',
    'customers.read',
    'products.read'
  ],
  inventory_manager: [
    'inventory.read', 'inventory.update',
    'products.read', 'products.update'
  ],
  accounts_staff: [
    'finance.read', 'finance.manage',
    'orders.read',
    'reports.read'
  ],
  customer_support: [
    'orders.read',
    'customers.read',
    'reviews.moderate',
    'products.read'
  ],
  delivery_staff: [
    'orders.read',
    'orders.update'
  ],
  marketing_staff: [
    'products.read',
    'reviews.moderate',
    'reports.read'
  ],
  employee: [
    'products.read',
    'orders.read'
  ]
};

export const ROLE_LABELS: Record<StaffRole, { bn: string; en: string; badgeColor: string }> = {
  super_admin: { bn: 'সুপার অ্যাডমিন (একক প্রধান)', en: 'Super Admin', badgeColor: 'bg-purple-900 text-purple-100 border-purple-700' },
  admin: { bn: 'অ্যাডমিন', en: 'Administrator', badgeColor: 'bg-[#7A1238] text-white border-[#BE0750]' },
  managing_director: { bn: 'ম্যানেজিং ডিরেক্টর (MD)', en: 'Managing Director', badgeColor: 'bg-indigo-900 text-indigo-100 border-indigo-700' },
  manager: { bn: 'জেনারেল ম্যানেজার', en: 'General Manager', badgeColor: 'bg-blue-800 text-blue-100 border-blue-600' },
  order_manager: { bn: 'অর্ডার ম্যানেজার', en: 'Order Manager', badgeColor: 'bg-amber-800 text-amber-100 border-amber-600' },
  inventory_manager: { bn: 'ইনভেন্টরি ম্যানেজার', en: 'Inventory Manager', badgeColor: 'bg-emerald-800 text-emerald-100 border-emerald-600' },
  accounts_staff: { bn: 'অ্যাকাউন্টস অফিসার', en: 'Accounts Staff', badgeColor: 'bg-teal-800 text-teal-100 border-teal-600' },
  customer_support: { bn: 'কাস্টমার সাপোর্ট এক্সিকিউটিভ', en: 'Customer Support', badgeColor: 'bg-rose-800 text-rose-100 border-rose-600' },
  delivery_staff: { bn: 'ডেলিভারি কোঅর্ডিনেটর', en: 'Delivery Staff', badgeColor: 'bg-cyan-800 text-cyan-100 border-cyan-600' },
  marketing_staff: { bn: 'মার্কেটিং এক্সিকিউটিভ', en: 'Marketing Staff', badgeColor: 'bg-pink-800 text-pink-100 border-pink-600' },
  employee: { bn: 'স্টাফ কর্মকর্তা', en: 'Staff Employee', badgeColor: 'bg-gray-800 text-gray-200 border-gray-600' }
};

export const PERMISSION_LABELS: Record<Permission, { bn: string; en: string; group: string }> = {
  'products.read': { bn: 'পণ্য দেখার অনুমতি', en: 'View Products', group: 'Products' },
  'products.create': { bn: 'নতুন পণ্য যোগ করার অনুমতি', en: 'Create Products', group: 'Products' },
  'products.update': { bn: 'পণ্য তথ্য ও দাম পরিবর্তনের অনুমতি', en: 'Edit Products', group: 'Products' },
  'products.delete': { bn: 'পণ্য মুছে ফেলার অনুমতি', en: 'Delete Products', group: 'Products' },
  'orders.read': { bn: 'সকল অর্ডার দেখার অনুমতি', en: 'View Orders', group: 'Orders' },
  'orders.update': { bn: 'অর্ডারের স্ট্যাটাস ও ট্র্যাকিং আপডেট', en: 'Update Orders', group: 'Orders' },
  'orders.cancel': { bn: 'অর্ডার বাতিল বা রিফান্ড করার অনুমতি', en: 'Cancel Orders', group: 'Orders' },
  'customers.read': { bn: 'গ্রাহক তালিকা ও বিবরণ দেখা', en: 'View Customers', group: 'Customers' },
  'customers.manage': { bn: 'গ্রাহক তথ্য ও অ্যাক্সেস পরিচালনা', en: 'Manage Customers', group: 'Customers' },
  'inventory.read': { bn: 'স্টক এবং ইনভেন্টরি লেভেল দেখা', en: 'View Inventory', group: 'Inventory' },
  'inventory.update': { bn: 'স্টক সংখ্যা ও রিস্টক আপডেট করা', en: 'Update Inventory', group: 'Inventory' },
  'finance.read': { bn: 'আর্থিক হিসাব ও গেটওয়ে রিপোর্ট দেখা', en: 'View Financials', group: 'Finance' },
  'finance.manage': { bn: 'লেনদেন ও হিসাব পরিচালনা করা', en: 'Manage Finance', group: 'Finance' },
  'reports.read': { bn: 'সেলস ও ব্যবসায়িক অ্যানালিটিক্স দেখা', en: 'View Analytics', group: 'Analytics' },
  'staff.read': { bn: 'কর্মকর্তা ও স্টাফ তালিকা দেখা', en: 'View Staff', group: 'Staff' },
  'staff.invite': { bn: 'নতুন স্টাফ ইনভাইটেশন পাঠানো', en: 'Invite Staff', group: 'Staff' },
  'staff.manage': { bn: 'স্টাফ রোল, পারমিশন ও সাসপেন্ড পরিচালনা', en: 'Manage Staff Roles', group: 'Staff' },
  'settings.manage': { bn: 'দোকান ও ডেলিভারি সেটিংস পরিবর্তন', en: 'Manage Settings', group: 'Settings' },
  'reviews.moderate': { bn: 'রিভিউ যাচাই, অনুমোদন ও উত্তর প্রদান', en: 'Moderate Reviews', group: 'Reviews' }
};

// Seed staff list with initial bootstrap records
export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: SUPER_ADMIN_ID,
    uid: 'USR-ADMIN-01',
    name: 'Mahim Islam',
    email: SUPER_ADMIN_EMAIL,
    phone: '01712-345678',
    role: 'super_admin',
    department: 'Executive Board',
    employeeId: 'PRY-EMP-001',
    jobTitle: 'Sole Super Administrator & Founder',
    permissions: [...ALL_PERMISSIONS],
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
    createdBy: 'SYSTEM_BOOTSTRAP'
  },
  {
    id: 'STAFF-MD-002',
    name: 'Kazi Nurtaz',
    email: 'nurtaz.director@preyoshi.com',
    phone: '01711-223344',
    role: 'managing_director',
    department: 'Management',
    employeeId: 'PRY-EMP-002',
    jobTitle: 'Managing Director (MD)',
    reportingManager: 'Mahim Islam',
    permissions: ROLE_DEFAULT_PERMISSIONS.managing_director,
    status: 'active',
    invitedAt: '2026-02-15T09:00:00Z',
    lastLoginAt: '2026-11-08T14:30:00Z',
    createdBy: SUPER_ADMIN_EMAIL
  },
  {
    id: 'STAFF-OM-003',
    name: 'Tanvir Ahmed',
    email: 'tanvir.orders@preyoshi.com',
    phone: '01819-445566',
    role: 'order_manager',
    department: 'Operations & Dispatch',
    employeeId: 'PRY-EMP-003',
    jobTitle: 'Head of Order Fulfillment',
    reportingManager: 'Kazi Nurtaz',
    permissions: ROLE_DEFAULT_PERMISSIONS.order_manager,
    status: 'active',
    invitedAt: '2026-03-01T10:00:00Z',
    lastLoginAt: '2026-11-09T08:15:00Z',
    createdBy: SUPER_ADMIN_EMAIL
  },
  {
    id: 'STAFF-CS-004',
    name: 'Sadia Rahman',
    email: 'sadia.support@preyoshi.com',
    phone: '01912-778899',
    role: 'customer_support',
    department: 'Customer Experience',
    employeeId: 'PRY-EMP-004',
    jobTitle: 'Senior Customer Support Lead',
    reportingManager: 'Tanvir Ahmed',
    permissions: ROLE_DEFAULT_PERMISSIONS.customer_support,
    status: 'active',
    invitedAt: '2026-04-10T11:00:00Z',
    lastLoginAt: '2026-11-09T10:00:00Z',
    createdBy: SUPER_ADMIN_EMAIL
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-11-09T09:00:00Z',
    actorId: SUPER_ADMIN_ID,
    actorName: 'Mahim Islam',
    actorEmail: SUPER_ADMIN_EMAIL,
    actorRole: 'super_admin',
    action: 'SYSTEM_BOOTSTRAP',
    target: 'Security Engine',
    details: 'Single Super Admin access policy initialized and verified.'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-11-09T09:15:00Z',
    actorId: SUPER_ADMIN_ID,
    actorName: 'Mahim Islam',
    actorEmail: SUPER_ADMIN_EMAIL,
    actorRole: 'super_admin',
    action: 'STAFF_ROLE_SYNC',
    target: 'PRY-EMP-003 (Tanvir Ahmed)',
    details: 'Assigned Order Manager role with granular dispatch permissions.'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-11-09T09:40:00Z',
    actorId: 'STAFF-OM-003',
    actorName: 'Tanvir Ahmed',
    actorEmail: 'tanvir.orders@preyoshi.com',
    actorRole: 'order_manager',
    action: 'ORDER_DISPATCH_UPDATE',
    target: 'Order #PRY-2026-0813',
    details: 'Updated status to Shipped via Steadfast Courier (Tracking: ST-99214).'
  }
];

const STAFF_STORAGE_KEY = 'preyoshi_enterprise_staff';
const AUDIT_STORAGE_KEY = 'preyoshi_enterprise_audit_logs';

export class StaffService {
  private static loadStaff(): StaffMember[] {
    try {
      const stored = localStorage.getItem(STAFF_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StaffMember[];
        // Guarantee Super Admin is present and cannot be replaced or modified
        const hasSuperAdmin = parsed.some(s => s.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
        if (!hasSuperAdmin) {
          return [INITIAL_STAFF_MEMBERS[0], ...parsed];
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse staff members from storage', e);
    }
    return INITIAL_STAFF_MEMBERS;
  }

  private static saveStaff(staff: StaffMember[]) {
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
    } catch (e) {
      console.error('Failed to save staff members', e);
    }
  }

  public static getStaffList(): StaffMember[] {
    return this.loadStaff();
  }

  public static getStaffByEmail(email: string): StaffMember | undefined {
    if (!email) return undefined;
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return INITIAL_STAFF_MEMBERS[0];
    }
    return this.loadStaff().find(s => s.email.toLowerCase().trim() === cleanEmail);
  }

  public static isSuperAdmin(user?: User | null): boolean {
    if (!user) return false;
    return (
      (user.email && user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) ||
      user.role === 'super_admin'
    );
  }

  public static hasPermission(user: User | null | undefined, permission: Permission): boolean {
    if (!user) return false;
    // Super Admin has all 19 permissions irrevocably
    if (this.isSuperAdmin(user)) return true;
    if (user.role === 'customer') return false;

    // Check custom permissions assigned to user
    if (user.permissions && user.permissions.includes(permission)) return true;

    // Fallback to role-level default permissions
    const rolePermissions = ROLE_DEFAULT_PERMISSIONS[user.role as StaffRole];
    return Array.isArray(rolePermissions) && rolePermissions.includes(permission);
  }

  public static inviteStaff(
    newStaff: Omit<StaffMember, 'id' | 'invitedAt' | 'status' | 'createdBy'>,
    actor: User
  ): { success: boolean; message: string; staff?: StaffMember } {
    if (!this.hasPermission(actor, 'staff.invite') && !this.isSuperAdmin(actor)) {
      return { success: false, message: 'আপনার নতুন স্টাফ আমন্ত্রণ জানানোর অনুমতি নেই।' };
    }

    if (newStaff.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase() || newStaff.role === 'super_admin') {
      return { success: false, message: 'সুপার অ্যাডমিন পদবীতে নতুন কেউ রেজিস্ট্রেশন বা ইনভাইট হতে পারবে না।' };
    }

    const currentStaff = this.loadStaff();
    const existing = currentStaff.find(s => s.email.toLowerCase().trim() === newStaff.email.toLowerCase().trim());
    if (existing) {
      return { success: false, message: 'এই ইমেইল ঠিকানায় ইতোমধ্যে স্টাফ অ্যাকাউন্ট বিদ্যমান।' };
    }

    const createdMember: StaffMember = {
      ...newStaff,
      id: 'STAFF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      status: 'invited',
      invitedAt: new Date().toISOString(),
      createdBy: actor.email || actor.name,
      permissions: newStaff.permissions.length > 0 ? newStaff.permissions : ROLE_DEFAULT_PERMISSIONS[newStaff.role]
    };

    const updated = [...currentStaff, createdMember];
    this.saveStaff(updated);

    // Sync to Firestore StaffRoles collection via the server-side Super Admin hook
    StaffRolesService.assignRoleViaServerHook(
      {
        userEmail: createdMember.email,
        userName: createdMember.name,
        role: createdMember.role,
        permissions: createdMember.permissions,
        department: createdMember.department,
        employeeId: createdMember.employeeId
      },
      actor.email || SUPER_ADMIN_EMAIL
    ).catch(e => console.warn('[StaffService] Background server role sync warning:', e));

    this.logAction(
      actor,
      'STAFF_INVITE',
      `${createdMember.employeeId} (${createdMember.name})`,
      `Invited as ${ROLE_LABELS[createdMember.role]?.en || createdMember.role} in ${createdMember.department} department.`
    );

    return { success: true, message: 'স্টাফ ইনভাইটেশন সফলভাবে প্রস্তুত ও পাঠানো হয়েছে!', staff: createdMember };
  }

  public static updateStaffRoleAndPermissions(
    targetStaffId: string,
    newRole: StaffRole,
    customPermissions: Permission[],
    actor: User
  ): { success: boolean; message: string } {
    if (!this.hasPermission(actor, 'staff.manage') && !this.isSuperAdmin(actor)) {
      return { success: false, message: 'আপনার স্টাফ রোল পরিবর্তন করার অনুমতি নেই।' };
    }

    const currentStaff = this.loadStaff();
    const target = currentStaff.find(s => s.id === targetStaffId);

    if (!target) {
      return { success: false, message: 'স্টাফ সদস্য খুঁজে পাওয়া যায়নি।' };
    }

    // Super Admin cannot be downgraded or altered by anyone
    if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || target.role === 'super_admin') {
      return { success: false, message: 'সুপার অ্যাডমিন অ্যাকাউন্টের ভূমিকা পরিবর্তন বা ডাউনগ্রেড করা কঠোরভাবে নিষিদ্ধ।' };
    }

    if (newRole === 'super_admin') {
      return { success: false, message: 'সিস্টেমে শুধুমাত্র একজন সুপার অ্যাডমিন অনুমোদিত।' };
    }

    const updated = currentStaff.map(s => {
      if (s.id === targetStaffId) {
        return {
          ...s,
          role: newRole,
          permissions: customPermissions
        };
      }
      return s;
    });

    this.saveStaff(updated);

    // Sync to Firestore StaffRoles collection via the server-side Super Admin hook
    StaffRolesService.assignRoleViaServerHook(
      {
        userEmail: target.email,
        userName: target.name,
        role: newRole,
        permissions: customPermissions,
        department: target.department,
        employeeId: target.employeeId
      },
      actor.email || SUPER_ADMIN_EMAIL
    ).catch(e => console.warn('[StaffService] Background server role sync warning:', e));

    this.logAction(
      actor,
      'STAFF_ROLE_CHANGE',
      `${target.employeeId} (${target.name})`,
      `Changed role to ${ROLE_LABELS[newRole]?.en || newRole} with ${customPermissions.length} permissions.`
    );

    return { success: true, message: 'স্টাফের ভূমিকা ও পারমিশন সফলভাবে আপডেট করা হয়েছে।' };
  }

  public static toggleStaffStatus(
    targetStaffId: string,
    actor: User
  ): { success: boolean; message: string } {
    if (!this.hasPermission(actor, 'staff.manage') && !this.isSuperAdmin(actor)) {
      return { success: false, message: 'আপনার স্টাফ স্ট্যাটাস পরিবর্তন করার অনুমতি নেই।' };
    }

    const currentStaff = this.loadStaff();
    const target = currentStaff.find(s => s.id === targetStaffId);

    if (!target) {
      return { success: false, message: 'স্টাফ সদস্য পাওয়া যায়নি।' };
    }

    if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, message: 'সুপার অ্যাডমিন অ্যাকাউন্ট সাসপেন্ড করা অসম্ভব।' };
    }

    const nextStatus = target.status === 'active' ? 'suspended' : 'active';
    const updated = currentStaff.map(s => {
      if (s.id === targetStaffId) {
        return { ...s, status: nextStatus as 'active' | 'suspended' };
      }
      return s;
    });

    this.saveStaff(updated);

    this.logAction(
      actor,
      nextStatus === 'suspended' ? 'STAFF_SUSPEND' : 'STAFF_ACTIVATE',
      `${target.employeeId} (${target.name})`,
      `Access was set to ${nextStatus}.`
    );

    return {
      success: true,
      message: nextStatus === 'suspended' ? 'স্টাফ অ্যাকাউন্টটি সফলভাবে সাসপেন্ড করা হয়েছে।' : 'স্টাফ অ্যাকাউন্টটি পুনরায় সক্রিয় করা হয়েছে।'
    };
  }

  public static deleteStaff(targetStaffId: string, actor: User): { success: boolean; message: string } {
    if (!this.isSuperAdmin(actor)) {
      return { success: false, message: 'শুধুমাত্র প্রধান সুপার অ্যাডমিন কোনো স্টাফ অ্যাকাউন্ট স্থায়ীভাবে অপসারণ করতে পারেন।' };
    }

    const currentStaff = this.loadStaff();
    const target = currentStaff.find(s => s.id === targetStaffId);
    if (!target) {
      return { success: false, message: 'স্টাফ সদস্য পাওয়া যায়নি।' };
    }

    if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || target.role === 'super_admin') {
      return { success: false, message: 'সুপার অ্যাডমিন অ্যাকাউন্ট কখনো মুছে ফেলা সম্ভব নয়।' };
    }

    const updated = currentStaff.filter(s => s.id !== targetStaffId);
    this.saveStaff(updated);

    this.logAction(
      actor,
      'STAFF_REMOVE',
      `${target.employeeId} (${target.name})`,
      `Staff member removed permanently from the enterprise directory.`
    );

    return { success: true, message: 'স্টাফ সদস্যকে তালিকা থেকে অপসারিত করা হয়েছে।' };
  }

  // Audit Logging
  public static getAuditLogs(): AuditLog[] {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AuditLog[];
      }
    } catch (e) {
      console.warn('Failed to load audit logs', e);
    }
    return INITIAL_AUDIT_LOGS;
  }

  public static logAction(
    actor: User | { name: string; email?: string; role?: string; id?: string },
    action: string,
    target: string,
    details: string
  ) {
    const newLog: AuditLog = {
      id: 'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      actorId: actor.id || 'ANONYMOUS',
      actorName: actor.name || 'Staff User',
      actorEmail: actor.email || 'system@preyoshi.com',
      actorRole: actor.role || 'staff',
      action,
      target,
      details
    };

    try {
      const logs = this.getAuditLogs();
      const updated = [newLog, ...logs.slice(0, 499)]; // Keep latest 500 audit logs
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save audit log', e);
    }

    return newLog;
  }
}
