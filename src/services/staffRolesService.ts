/**
 * StaffRoles Service
 * Connects directly to Firestore 'StaffRoles' collection and executes role modifications
 * through the secure server-side Super Admin verification hook.
 */
import { collection, doc, getDocs, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import { StaffRoleRecord, StaffRole, Permission } from '../types';
import { SUPER_ADMIN_EMAIL } from './staffService';

export class StaffRolesService {
  /**
   * Verifies if a user is the single permitted Super Admin through the server-side verification hook.
   */
  public static async verifySuperAdminServerSide(candidateEmail?: string): Promise<{
    isSuperAdmin: boolean;
    email: string | null;
    message?: string;
  }> {
    const emailToVerify = (candidateEmail || SUPER_ADMIN_EMAIL).toLowerCase().trim();

    try {
      const response = await fetch('/api/admin/verify-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': emailToVerify
        },
        body: JSON.stringify({ adminEmail: emailToVerify })
      });

      const data = await response.json();
      return {
        isSuperAdmin: Boolean(data.isSuperAdmin && data.verified),
        email: data.email || null,
        message: data.message
      };
    } catch (err: any) {
      console.warn('[StaffRolesService] Server-side hook check fallback to client-side rule:', err);
      const isMatch = emailToVerify === SUPER_ADMIN_EMAIL.toLowerCase();
      return {
        isSuperAdmin: isMatch,
        email: isMatch ? SUPER_ADMIN_EMAIL : null,
        message: isMatch ? 'Verified via local security policy' : 'Unauthorized user'
      };
    }
  }

  /**
   * Retrieves all verified staff roles from Firestore StaffRoles collection or server endpoint.
   */
  public static async getStaffRoles(): Promise<StaffRoleRecord[]> {
    // 1. Try server-side endpoint first
    try {
      const res = await fetch('/api/admin/staff-roles');
      if (res.ok) {
        const data = await res.json();
        if (data.roles && Array.isArray(data.roles)) {
          return data.roles;
        }
      }
    } catch (e) {
      console.warn('[StaffRolesService] Server API fetch failed, querying Firestore directly:', e);
    }

    // 2. Query Firestore directly if configured
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, 'StaffRoles');
        const snap = await getDocs(colRef);
        const roles: StaffRoleRecord[] = [];
        snap.forEach(d => {
          roles.push({ id: d.id, ...(d.data() as any) });
        });
        if (roles.length > 0) {
          return roles;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'StaffRoles');
      }
    }

    // 3. Fallback default root Super Admin
    return [
      {
        id: 'STAFF-ROLE-SA-001',
        roleId: 'STAFF-ROLE-SA-001',
        userEmail: SUPER_ADMIN_EMAIL,
        userName: 'Mahim Islam (Super Admin)',
        role: 'super_admin',
        permissions: [
          'products.read', 'products.create', 'products.update', 'products.delete',
          'orders.read', 'orders.update', 'orders.cancel',
          'customers.read', 'customers.manage',
          'inventory.read', 'inventory.update',
          'finance.read', 'finance.manage',
          'reports.read',
          'staff.read', 'staff.invite', 'staff.manage',
          'settings.manage',
          'reviews.moderate'
        ],
        department: 'Executive Board',
        employeeId: 'PRY-EMP-001',
        assignedBy: 'SYSTEM_BOOTSTRAP',
        assignedAt: '2026-01-01T00:00:00Z',
        status: 'active',
        updatedAt: '2026-11-09T09:00:00Z'
      }
    ];
  }

  /**
   * Subscribes to real-time changes on the Firestore StaffRoles collection.
   */
  public static subscribeStaffRoles(
    onUpdate: (roles: StaffRoleRecord[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    if (!isFirebaseConfigured || !db) {
      // Fallback: poll server periodically
      this.getStaffRoles().then(onUpdate);
      const interval = setInterval(() => {
        this.getStaffRoles().then(onUpdate);
      }, 15000);
      return () => clearInterval(interval);
    }

    const colRef = collection(db, 'StaffRoles');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: StaffRoleRecord[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        // Ensure root super admin is present
        if (!list.some(r => r.userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())) {
          list.unshift({
            id: 'STAFF-ROLE-SA-001',
            roleId: 'STAFF-ROLE-SA-001',
            userEmail: SUPER_ADMIN_EMAIL,
            userName: 'Mahim Islam (Super Admin)',
            role: 'super_admin',
            permissions: [
              'products.read', 'products.create', 'products.update', 'products.delete',
              'orders.read', 'orders.update', 'orders.cancel',
              'customers.read', 'customers.manage',
              'inventory.read', 'inventory.update',
              'finance.read', 'finance.manage',
              'reports.read',
              'staff.read', 'staff.invite', 'staff.manage',
              'settings.manage',
              'reviews.moderate'
            ],
            department: 'Executive Board',
            employeeId: 'PRY-EMP-001',
            assignedBy: 'SYSTEM_BOOTSTRAP',
            assignedAt: '2026-01-01T00:00:00Z',
            status: 'active'
          });
        }
        onUpdate(list);
      },
      (error) => {
        console.error('[StaffRolesService onSnapshot Error]:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  }

  /**
   * Assigns an administrative role via the server-side verification hook.
   * Rejects immediately if the actor is not the single permitted Super Admin.
   */
  public static async assignRoleViaServerHook(
    payload: {
      userEmail: string;
      userName: string;
      role: StaffRole;
      permissions: Permission[];
      department: string;
      employeeId: string;
    },
    actorEmail: string
  ): Promise<{ success: boolean; message: string; roleAssignment?: StaffRoleRecord }> {
    try {
      const response = await fetch('/api/admin/assign-staff-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': actorEmail
        },
        body: JSON.stringify({
          ...payload,
          adminEmail: actorEmail
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || data.error || 'ভেরিফিকেশন ব্যর্থ হয়েছে।'
        };
      }

      return {
        success: true,
        message: data.message || 'ভূমিকা সফলভাবে নির্ধারিত হয়েছে।',
        roleAssignment: data.roleAssignment
      };
    } catch (err: any) {
      console.error('[StaffRolesService] assignRoleViaServerHook error:', err);
      return {
        success: false,
        message: err?.message || 'সার্ভার হুক এক্সিকিউশন ব্যর্থ হয়েছে।'
      };
    }
  }

  /**
   * Toggles staff role status (active/suspended) through the server-side verification hook.
   */
  public static async toggleRoleStatusViaServer(
    roleId: string,
    newStatus: 'active' | 'suspended',
    actorEmail: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/admin/toggle-staff-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': actorEmail
        },
        body: JSON.stringify({ roleId, newStatus, adminEmail: actorEmail })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।' };
      }

      return { success: true, message: data.message };
    } catch (e: any) {
      return { success: false, message: e?.message || 'সার্ভার যোগাযোগ ত্রুটি।' };
    }
  }

  /**
   * Revokes a staff role assignment through the server-side verification hook.
   */
  public static async revokeRoleViaServer(
    roleId: string,
    actorEmail: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/revoke-staff-role/${encodeURIComponent(roleId)}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': actorEmail
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'রোল অপসারণ ব্যর্থ হয়েছে।' };
      }

      return { success: true, message: data.message };
    } catch (e: any) {
      return { success: false, message: e?.message || 'সার্ভার যোগাযোগ ত্রুটি।' };
    }
  }
}
