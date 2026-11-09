import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { StaffRolesService } from '../services/staffRolesService';
import { StaffRole, Permission, StaffRoleRecord } from '../types';
import { SUPER_ADMIN_EMAIL } from '../services/staffService';

export function useSuperAdminVerification() {
  const { currentUser, isSuperAdmin: localIsSuperAdmin } = useAuth();
  const [isServerVerified, setIsServerVerified] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [serverRoles, setServerRoles] = useState<StaffRoleRecord[]>([]);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const activeEmail = currentUser?.email || (localIsSuperAdmin ? SUPER_ADMIN_EMAIL : '');

  // Verify through server-side hook
  const verifySuperAdmin = useCallback(async () => {
    setIsVerifying(true);
    setVerificationError(null);
    try {
      const result = await StaffRolesService.verifySuperAdminServerSide(activeEmail);
      setIsServerVerified(result.isSuperAdmin);
      if (!result.isSuperAdmin) {
        setVerificationError(result.message || 'User is not the permitted Super Admin.');
      }
      return result.isSuperAdmin;
    } catch (e: any) {
      setVerificationError(e?.message || 'Verification check failed');
      setIsServerVerified(false);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [activeEmail]);

  // Load and subscribe to Firestore StaffRoles
  useEffect(() => {
    verifySuperAdmin();

    const unsubscribe = StaffRolesService.subscribeStaffRoles(
      (roles) => {
        setServerRoles(roles);
      },
      (err) => {
        console.warn('[useSuperAdminVerification] Subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [verifySuperAdmin]);

  // Execute role assignment strictly through server-side hook
  const assignRoleThroughServerHook = async (payload: {
    userEmail: string;
    userName: string;
    role: StaffRole;
    permissions: Permission[];
    department: string;
    employeeId: string;
  }) => {
    return StaffRolesService.assignRoleViaServerHook(payload, activeEmail);
  };

  // Toggle status through server-side hook
  const toggleRoleThroughServerHook = async (roleId: string, newStatus: 'active' | 'suspended') => {
    return StaffRolesService.toggleRoleStatusViaServer(roleId, newStatus, activeEmail);
  };

  // Revoke through server-side hook
  const revokeRoleThroughServerHook = async (roleId: string) => {
    return StaffRolesService.revokeRoleViaServer(roleId, activeEmail);
  };

  return {
    isServerVerified,
    isVerifying,
    designatedSuperAdmin: SUPER_ADMIN_EMAIL,
    serverRoles,
    verificationError,
    verifySuperAdmin,
    assignRoleThroughServerHook,
    toggleRoleThroughServerHook,
    revokeRoleThroughServerHook
  };
}
