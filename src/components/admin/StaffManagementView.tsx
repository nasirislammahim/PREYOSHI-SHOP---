import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, UserPlus, Users, Edit3, Trash2,
  CheckCircle2, XCircle, Search, AlertTriangle, Key, Briefcase,
  Building, UserX, UserCheck, RefreshCw, Eye, Database, Lock
} from 'lucide-react';
import { StaffMember, StaffRole, Permission, StaffRoleRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSuperAdminVerification } from '../../hooks/useSuperAdminVerification';
import {
  StaffService,
  SUPER_ADMIN_EMAIL,
  ROLE_LABELS,
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  ROLE_DEFAULT_PERMISSIONS
} from '../../services/staffService';

export const StaffManagementView: React.FC = () => {
  const { currentUser, isSuperAdmin, hasPermission, switchStaffRoleDemo } = useAuth();
  const {
    isServerVerified,
    isVerifying,
    designatedSuperAdmin,
    serverRoles,
    assignRoleThroughServerHook,
    toggleRoleThroughServerHook,
    revokeRoleThroughServerHook,
    verifySuperAdmin
  } = useSuperAdminVerification();

  const [staffList, setStaffList] = useState<StaffMember[]>(() => StaffService.getStaffList());
  const [activeTab, setActiveTab] = useState<'directory' | 'firestore_roles'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('employee');
  const [inviteDepartment, setInviteDepartment] = useState('Operations');
  const [inviteJobTitle, setInviteJobTitle] = useState('');
  const [inviteEmployeeId, setInviteEmployeeId] = useState('');
  const [inviteReportingManager, setInviteReportingManager] = useState('Mahim Islam');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(ROLE_DEFAULT_PERMISSIONS.employee);

  // Edit Permissions Modal
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editRole, setEditRole] = useState<StaffRole>('employee');
  const [editPermissions, setEditPermissions] = useState<Permission[]>([]);

  const refreshList = () => {
    setStaffList(StaffService.getStaffList());
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleRoleChangeInInvite = (newRole: StaffRole) => {
    setInviteRole(newRole);
    setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS[newRole] || []);
  };

  const handleTogglePermissionInInvite = (perm: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleTogglePermissionInEdit = (perm: Permission) => {
    setEditPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleOpenInvite = () => {
    if (!hasPermission('staff.invite') && !isSuperAdmin) {
      showMsg('error', 'আপনার নতুন স্টাফ আমন্ত্রণ জানানোর অনুমতি নেই।');
      return;
    }
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    setInviteRole('employee');
    setInviteDepartment('Customer Operations');
    setInviteJobTitle('Operations Officer');
    setInviteEmployeeId(`PRY-EMP-${Math.floor(100 + Math.random() * 900)}`);
    setInviteReportingManager('Mahim Islam');
    setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS.employee);
    setIsInviteOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!inviteName.trim() || !inviteEmail.trim() || !invitePhone.trim()) {
      showMsg('error', 'দয়া করে নাম, ইমেইল এবং ফোন নম্বর সঠিকভাবে পূরণ করুন।');
      return;
    }

    // 1. Invoke Server-Side Hook verification & role creation
    const serverResult = await assignRoleThroughServerHook({
      userEmail: inviteEmail.trim(),
      userName: inviteName.trim(),
      role: inviteRole,
      permissions: selectedPermissions,
      department: inviteDepartment.trim(),
      employeeId: inviteEmployeeId.trim()
    });

    if (!serverResult.success) {
      showMsg('error', `সার্ভার-সাইড ভেরিফিকেশন প্রত্যাখ্যাত: ${serverResult.message}`);
      return;
    }

    // 2. Also register in local staff repository
    const res = StaffService.inviteStaff(
      {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        phone: invitePhone.trim(),
        role: inviteRole,
        department: inviteDepartment.trim(),
        employeeId: inviteEmployeeId.trim(),
        jobTitle: inviteJobTitle.trim() || ROLE_LABELS[inviteRole]?.en || inviteRole,
        reportingManager: inviteReportingManager.trim(),
        permissions: selectedPermissions
      },
      currentUser
    );

    if (res.success) {
      showMsg('success', `${res.message} (Firestore StaffRoles ডকুমেন্টে যুক্ত হয়েছে)`);
      setIsInviteOpen(false);
      refreshList();
    } else {
      showMsg('error', res.message);
    }
  };

  const handleOpenEdit = (staff: StaffMember) => {
    if (staff.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      showMsg('error', 'প্রধান সুপার অ্যাডমিন অ্যাকাউন্ট সুরক্ষিত। পরিবর্তন সম্ভব নয়।');
      return;
    }
    setEditingStaff(staff);
    setEditRole(staff.role);
    setEditPermissions(staff.permissions);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editingStaff) return;

    // 1. Invoke Server-Side Hook verification & role update
    const serverResult = await assignRoleThroughServerHook({
      userEmail: editingStaff.email,
      userName: editingStaff.name,
      role: editRole,
      permissions: editPermissions,
      department: editingStaff.department,
      employeeId: editingStaff.employeeId
    });

    if (!serverResult.success) {
      showMsg('error', `সার্ভার-সাইড হুক প্রত্যাখ্যাত: ${serverResult.message}`);
      return;
    }

    // 2. Local update
    const res = StaffService.updateStaffRoleAndPermissions(
      editingStaff.id,
      editRole,
      editPermissions,
      currentUser
    );

    if (res.success) {
      showMsg('success', `${res.message} (Firestore StaffRoles ডকুমেন্টে সংরক্ষিত)`);
      setEditingStaff(null);
      refreshList();
    } else {
      showMsg('error', res.message);
    }
  };

  const handleToggleStatus = async (staff: StaffMember) => {
    if (!currentUser) return;
    if (staff.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      showMsg('error', 'সুপার অ্যাডমিন অ্যাকাউন্ট কখনো স্থগিত করা যায় না।');
      return;
    }

    // Also toggle via server hook
    const nextStatus = staff.status === 'active' ? 'suspended' : 'active';
    await toggleRoleThroughServerHook(staff.id, nextStatus);

    const res = StaffService.toggleStaffStatus(staff.id, currentUser);
    if (res.success) {
      showMsg('success', res.message);
      refreshList();
    } else {
      showMsg('error', res.message);
    }
  };

  const handleDelete = async (staff: StaffMember) => {
    if (!currentUser) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে স্টাফ '${staff.name}' কে অপসারণ করতে চান?`)) return;

    // Also revoke via server hook
    await revokeRoleThroughServerHook(staff.id);

    const res = StaffService.deleteStaff(staff.id, currentUser);
    if (res.success) {
      showMsg('success', res.message);
      refreshList();
    } else {
      showMsg('error', res.message);
    }
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header Banner & Security Status */}
      <div className="bg-gradient-to-r from-[#2A101A] to-[#4A0D22] text-white p-6 rounded-2xl shadow-md border border-[#BE0750]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#D9A441] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Enterprise Single Super Admin Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-bangla text-white mt-1">
              স্টাফ ও রোল ম্যানেজমেন্ট কন্ট্রোল প্যানেল
            </h2>
            <p className="text-xs text-rose-200 mt-1">
              একক সুপার অ্যাডমিন নীতি সক্রিয়: <span className="font-mono text-white bg-black/40 px-2 py-0.5 rounded">{SUPER_ADMIN_EMAIL}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenInvite}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#BE0750] hover:bg-[#A30644] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন স্টাফ ইনভাইট করুন</span>
            </button>
            <button
              onClick={refreshList}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Role Switcher for Testing/Demonstrating All 11 Roles */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-rose-200 font-semibold flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-[#D9A441]" />
            রোল প্রিভিউ সুইচ করুন (Role Simulator):
          </span>
          {(Object.keys(ROLE_LABELS) as StaffRole[]).map(roleKey => (
            <button
              key={roleKey}
              onClick={() => switchStaffRoleDemo(roleKey)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                currentUser?.role === roleKey
                  ? 'bg-[#D9A441] text-[#2A101A] font-bold shadow-xs'
                  : 'bg-white/10 text-rose-100 hover:bg-white/20'
              }`}
            >
              {ROLE_LABELS[roleKey].en}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Server-Side Super Admin Verification Hook & Firestore Status Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isServerVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Server-Side Hook Security Gate
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isServerVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-amber-50 text-amber-700 border border-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isServerVerified ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {isVerifying ? 'যাচাই করা হচ্ছে...' : isServerVerified ? 'Active & Verified' : 'Unverified Caller'}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-900 mt-0.5">
                একক অনুমতিপ্রাপ্ত সুপার অ্যাডমিন ভেরিফিকেশন হুক (<span className="text-[#BE0750]">{designatedSuperAdmin}</span>)
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                যেকোনো প্রশাসনিক ভূমিকা ও অনুমতি পরিবর্তন স্বয়ংক্রিয়ভাবে সার্ভার-সাইড হুক দ্বারা যাচাই হয়ে ফায়ারবেস <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-purple-700 font-bold">StaffRoles</code> কালেকশনে সংরক্ষিত হয়।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <button
              onClick={() => {
                verifySuperAdmin().then(ok => {
                  showMsg(ok ? 'success' : 'error', ok ? 'সার্ভার-সাইড সুপার অ্যাডমিন হুক সফলভাবে ভেরিফাই হয়েছে।' : 'ভেরিফিকেশন ব্যর্থ হয়েছে।');
                });
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>পুনরায় ভেরিফাই করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-[#7A1238] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>স্টাফ ডিরেক্টরি ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('firestore_roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'firestore_roles'
              ? 'bg-[#7A1238] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Database className="w-4 h-4 text-[#D9A441]" />
          <span>Firestore 'StaffRoles' কালেকশন ({serverRoles.length})</span>
        </button>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: Main Staff Directory */}
      {activeTab === 'directory' && (
        <>
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="নাম, ইমেইল বা আইডি দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-[#7A1238] focus:border-[#7A1238] outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-gray-500 whitespace-nowrap">পদবী ফিল্টার:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white text-gray-700 outline-hidden"
              >
                <option value="all">সকল পদবী ({staffList.length})</option>
                {(Object.keys(ROLE_LABELS) as StaffRole[]).map(roleKey => (
                  <option key={roleKey} value={roleKey}>
                    {ROLE_LABELS[roleKey].en} ({ROLE_LABELS[roleKey].bn})
                  </option>
                ))}
              </select>
            </div>
          </div>

      {/* Staff Members Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#FFF9F2] text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">কর্মকর্তা / স্টাফ</th>
                <th className="py-3 px-4">পদবী (Role)</th>
                <th className="py-3 px-4">ডিপার্টমেন্ট ও আইডি</th>
                <th className="py-3 px-4">অনুমতি সংখ্যা</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.map(staff => {
                const isSuperAdminUser = staff.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                const roleMeta = ROLE_LABELS[staff.role] || {
                  en: staff.role,
                  bn: staff.role,
                  badgeColor: 'bg-gray-100 text-gray-800'
                };

                return (
                  <tr key={staff.id} className="hover:bg-rose-50/30 transition-colors">
                    {/* User Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-2xs ${
                            isSuperAdminUser
                              ? 'bg-[#7A1238] text-white ring-2 ring-[#D9A441]'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-gray-900">
                            <span>{staff.name}</span>
                            {isSuperAdminUser && (
                              <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-bold border border-amber-300">
                                👑 Super Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono">{staff.email}</div>
                          <div className="text-[10px] text-gray-400">{staff.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border ${roleMeta.badgeColor}`}>
                        {roleMeta.en}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">{roleMeta.bn}</div>
                    </td>

                    {/* Department & ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{staff.department}</div>
                      <div className="text-[11px] font-mono text-gray-500">ID: {staff.employeeId}</div>
                      <div className="text-[10px] text-gray-400">{staff.jobTitle}</div>
                    </td>

                    {/* Permissions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#7A1238] bg-[#F8E8E9] px-2 py-0.5 rounded text-[11px]">
                          {isSuperAdminUser ? 'All (19)' : `${staff.permissions.length} টি`}
                        </span>
                        <span className="text-[10px] text-gray-400">অনুমোদিত</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {staff.status === 'active' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active
                        </span>
                      )}
                      {staff.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Suspended
                        </span>
                      )}
                      {staff.status === 'invited' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-200">
                          Invited
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isSuperAdminUser ? (
                        <span className="text-[11px] text-gray-400 italic">সুরক্ষিত (Protected)</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#F8E8E9] hover:text-[#7A1238] text-gray-600 transition-colors cursor-pointer"
                            title="রোল ও পারমিশন সম্পাদনা"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(staff)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              staff.status === 'active'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                            title={staff.status === 'active' ? 'অ্যাকাউন্ট স্থগিত করুন' : 'পুনরায় সক্রিয় করুন'}
                          >
                            {staff.status === 'active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDelete(staff)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="স্থায়ীভাবে অপসারণ করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* TAB 2: Live Firestore 'StaffRoles' Collection */}
      {activeTab === 'firestore_roles' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden animate-fade-in">
          <div className="p-4 bg-[#FFF9F2] border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#BE0750]" />
                <h3 className="text-sm font-bold text-gray-900 font-bangla">
                  ফায়ারবেস লাইভ 'StaffRoles' ডকুমেন্টস কালেকশন
                </h3>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  Firestore: /StaffRoles
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                এই কালেকশনের প্রতিটি রেকর্ড সার্ভার-সাইড হুক দ্বারা ভেরিফাইকৃত এবং শুধুমাত্র একক সুপার অ্যাডমিন কর্তৃক প্রদেয়।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-semibold bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                মোট রোল ডকুমেন্ট: {serverRoles.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">ডকুমেন্ট / রোল ID</th>
                  <th className="py-3 px-4">কর্মকর্তার নাম ও ইমেইল</th>
                  <th className="py-3 px-4">নির্ধারিত ভূমিকা (Role)</th>
                  <th className="py-3 px-4">অনুমতি সংখ্যা</th>
                  <th className="py-3 px-4">অ্যাসাইন করেছেন (Assigned By)</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">সার্ভার অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {serverRoles.map((roleRecord) => {
                  const isRootSuperAdmin = roleRecord.userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                  return (
                    <tr
                      key={roleRecord.id || roleRecord.roleId}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isRootSuperAdmin ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          {roleRecord.roleId || roleRecord.id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{roleRecord.userName}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{roleRecord.userEmail}</div>
                        {roleRecord.employeeId && (
                          <div className="text-[10px] text-rose-800 font-semibold">{roleRecord.employeeId}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          ROLE_LABELS[roleRecord.role as StaffRole]?.badgeColor || 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {ROLE_LABELS[roleRecord.role as StaffRole]?.en || roleRecord.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-800">{roleRecord.permissions?.length || 0}</span>
                        <span className="text-gray-400 text-[10px] ml-1">/ 19</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-purple-900 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{roleRecord.assignedBy}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(roleRecord.assignedAt).toLocaleDateString('bn-BD')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          roleRecord.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${roleRecord.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {roleRecord.status === 'active' ? 'সক্রিয় (Active)' : 'স্থগিত (Suspended)'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isRootSuperAdmin ? (
                          <span className="text-[11px] font-bold text-[#D9A441] bg-amber-100 px-2.5 py-1 rounded-lg">
                            Root Super Admin
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={async () => {
                                const next = roleRecord.status === 'active' ? 'suspended' : 'active';
                                const res = await toggleRoleThroughServerHook(roleRecord.id || roleRecord.roleId, next);
                                showMsg(res.success ? 'success' : 'error', res.message);
                              }}
                              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                roleRecord.status === 'active'
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                              title={roleRecord.status === 'active' ? 'স্থগিত করুন' : 'সক্রিয় করুন'}
                            >
                              {roleRecord.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={async () => {
                                if (!window.confirm(`Firestore থেকে '${roleRecord.userName}' এর রোল অপসারণ করতে চান?`)) return;
                                const res = await revokeRoleThroughServerHook(roleRecord.id || roleRecord.roleId);
                                showMsg(res.success ? 'success' : 'error', res.message);
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Firestore থেকে রোল মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#BE0750]" />
                <h3 className="text-base font-bold text-gray-900 font-bangla">
                  নতুন স্টাফ অ্যাকাউন্ট আমন্ত্রণ ও রেজিস্ট্রেশন
                </h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    placeholder="যেমন: Tanvir Ahmed"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">ইমেইল ঠিকানা *</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="staff@preyoshi.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">ফোন নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={invitePhone}
                    onChange={e => setInvitePhone(e.target.value)}
                    placeholder="01712-000000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">এমপ্লয়ী আইডি (ID) *</label>
                  <input
                    type="text"
                    required
                    value={inviteEmployeeId}
                    onChange={e => setInviteEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">ডিপার্টমেন্ট *</label>
                  <input
                    type="text"
                    required
                    value={inviteDepartment}
                    onChange={e => setInviteDepartment(e.target.value)}
                    placeholder="Operations / Accounts"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">পদবী (Enterprise Role) *</label>
                  <select
                    value={inviteRole}
                    onChange={e => handleRoleChangeInInvite(e.target.value as StaffRole)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238] bg-white"
                  >
                    {(Object.keys(ROLE_LABELS) as StaffRole[])
                      .filter(r => r !== 'super_admin') // Super Admin cannot be created publicly
                      .map(roleKey => (
                        <option key={roleKey} value={roleKey}>
                          {ROLE_LABELS[roleKey].en} ({ROLE_LABELS[roleKey].bn})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">রিপোর্টিং ম্যানেজার</label>
                  <input
                    type="text"
                    value={inviteReportingManager}
                    onChange={e => setInviteReportingManager(e.target.value)}
                    placeholder="Mahim Islam"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
                  />
                </div>
              </div>

              {/* Granular Permission Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-gray-900 font-bangla">
                    নির্দিষ্ট পারমিশনসমূহ ({selectedPermissions.length}/{ALL_PERMISSIONS.length})
                  </label>
                  <span className="text-[11px] text-gray-500">পদবী অনুযায়ী স্বয়ংক্রিয়ভাবে সাজানো</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {ALL_PERMISSIONS.map(permKey => {
                    const meta = PERMISSION_LABELS[permKey];
                    const isChecked = selectedPermissions.includes(permKey);
                    return (
                      <label
                        key={permKey}
                        className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-rose-50/50 border-[#BE0750]/30 text-gray-900 font-semibold'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermissionInInvite(permKey)}
                          className="mt-0.5 rounded text-[#BE0750] focus:ring-[#BE0750]"
                        />
                        <div>
                          <div>{meta.en}</div>
                          <div className="text-[10px] text-gray-400">{meta.bn}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7A1238] hover:bg-[#5C0D2A] text-white font-bold transition-colors cursor-pointer"
                >
                  আমন্ত্রণ নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role & Permissions Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#7A1238]" />
                <h3 className="text-base font-bold text-gray-900 font-bangla">
                  স্টাফের পদবী ও পারমিশন সম্পাদনা ({editingStaff.name})
                </h3>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">পদবী পরিবর্তন</label>
                <select
                  value={editRole}
                  onChange={e => {
                    const newR = e.target.value as StaffRole;
                    setEditRole(newR);
                    setEditPermissions(ROLE_DEFAULT_PERMISSIONS[newR] || []);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238] bg-white font-semibold"
                >
                  {(Object.keys(ROLE_LABELS) as StaffRole[])
                    .filter(r => r !== 'super_admin')
                    .map(roleKey => (
                      <option key={roleKey} value={roleKey}>
                        {ROLE_LABELS[roleKey].en} ({ROLE_LABELS[roleKey].bn})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-gray-900 font-bangla">
                    নির্দিষ্ট পারমিশনসমূহ ({editPermissions.length}/{ALL_PERMISSIONS.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditPermissions([...ALL_PERMISSIONS])}
                    className="text-[11px] text-[#BE0750] font-bold hover:underline"
                  >
                    সকল পারমিশন দিন
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {ALL_PERMISSIONS.map(permKey => {
                    const meta = PERMISSION_LABELS[permKey];
                    const isChecked = editPermissions.includes(permKey);
                    return (
                      <label
                        key={permKey}
                        className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-rose-50/50 border-[#BE0750]/30 text-gray-900 font-semibold'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermissionInEdit(permKey)}
                          className="mt-0.5 rounded text-[#BE0750] focus:ring-[#BE0750]"
                        />
                        <div>
                          <div>{meta.en}</div>
                          <div className="text-[10px] text-gray-400">{meta.bn}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7A1238] hover:bg-[#5C0D2A] text-white font-bold transition-colors cursor-pointer"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
