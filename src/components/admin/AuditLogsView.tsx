import React, { useState, useMemo } from 'react';
import {
  ShieldAlert, ShieldCheck, Search, Filter, Download,
  Clock, User, RefreshCw, Key, FileText, CheckCircle2
} from 'lucide-react';
import { StaffService } from '../../services/staffService';
import { AuditLog } from '../../types';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => StaffService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const refreshLogs = () => {
    setLogs(StaffService.getAuditLogs());
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);

      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, actionFilter]);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `preyoshi_audit_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#BE0750] uppercase tracking-wider font-serif-brand">
            <ShieldCheck className="w-4 h-4 text-[#D9A441]" />
            <span>Immutable Security Trail & Compliance</span>
          </div>
          <h2 className="text-xl font-bold font-bangla text-[#2A101A] mt-0.5">
            নিরাপত্তা অডিট লগ ও সিস্টেম অ্যাক্টিভিটি ট্র্যাকিং
          </h2>
          <p className="text-[11px] text-gray-500 mt-1">
            সকল প্রশাসনিক পরিবর্তন, স্টাফ ইনভাইটেশন ও অর্ডার অ্যাকশন স্বয়ংক্রিয়ভাবে রেকর্ড করা হয়।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshLogs}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7A1238] hover:bg-[#5C0D2A] text-white font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON অডিট লগ এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="অ্যাক্টর, অ্যাকশন বা বিবরণ দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-[#7A1238]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-500">ইভেন্ট ফিল্টার:</span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 outline-hidden"
          >
            <option value="all">সকল ইভেন্ট ({logs.length})</option>
            <option value="STAFF">স্টাফ ও রোল সম্পর্কিত (STAFF)</option>
            <option value="LOGIN">লগইন ও সেশন (LOGIN)</option>
            <option value="ORDER">অর্ডার পরিচালনা (ORDER)</option>
            <option value="STOCK">ইনভেন্টরি স্টক (STOCK)</option>
            <option value="REVIEW">রিভিউ মডারেশন (REVIEW)</option>
          </select>
        </div>
      </div>

      {/* 3. Audit Logs Timeline Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#FFF9F2] text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">সময় ও তারিখ (BD Time)</th>
                <th className="py-3 px-4">অ্যাক্টর (স্টাফ সদস্য)</th>
                <th className="py-3 px-4">ইভেন্ট অ্যাকশন</th>
                <th className="py-3 px-4">টার্গেট রিসোর্স</th>
                <th className="py-3 px-4">বিস্তারিত তথ্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {filteredLogs.map(log => {
                const isSuperAdminActor = log.actorEmail === 'nasirislammahimbd@gmail.com' || log.actorRole === 'super_admin';

                return (
                  <tr key={log.id} className="hover:bg-rose-50/20 transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap font-sans">
                      <div className="font-bold text-gray-800">
                        {new Date(log.timestamp).toLocaleTimeString('bn-BD', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(log.timestamp).toLocaleDateString('bn-BD')}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900">{log.actorName}</span>
                        {isSuperAdminActor && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded font-bold">
                            👑 Super Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">{log.actorEmail}</div>
                      <div className="text-[9px] text-[#7A1238] font-semibold">{log.actorRole}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-bold text-[10px] border border-gray-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-gray-800 font-sans">
                      {log.target}
                    </td>

                    <td className="py-3 px-4 text-gray-600 font-sans leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
