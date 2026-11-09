import React, { useState } from 'react';
import {
  MessageSquare, Plus, Search, Archive, ArchiveRestore, Trash2,
  Edit2, Check, X, Clock, ShieldCheck, Cloud, AlertCircle, RefreshCw,
  FolderOpen, ChevronRight, HelpCircle, Database, Sparkles
} from 'lucide-react';
import { AIConversation } from '../../types';
import { chatService } from '../../services/chatService';

interface ChatHistorySidebarProps {
  conversations: AIConversation[];
  activeConversationId: string | null;
  customerUid: string;
  isFirebaseSynced: boolean;
  onSelectConversation: (conv: AIConversation) => void;
  onNewChat: () => void;
  onRefresh: () => void;
  onClose?: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversationId,
  customerUid,
  isFirebaseSynced,
  onSelectConversation,
  onNewChat,
  onRefresh,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'archived'>('active');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter conversations based on tab and search
  const filteredConversations = conversations.filter(conv => {
    if (viewTab === 'active' && conv.archived) return false;
    if (viewTab === 'archived' && !conv.archived) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = conv.title.toLowerCase().includes(q);
      const matchSnippet = conv.lastMessage?.toLowerCase().includes(q);
      return matchTitle || matchSnippet;
    }
    return true;
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleStartRename = (conv: AIConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.conversationId);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingTitle.trim()) return;
    await chatService.renameConversation(convId, customerUid, editingTitle.trim());
    setEditingId(null);
    onRefresh();
  };

  const handleToggleArchive = async (convId: string, currentArchived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await chatService.toggleArchiveConversation(convId, customerUid, !currentArchived);
    onRefresh();
  };

  const handleConfirmDelete = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await chatService.deleteConversation(convId, customerUid);
    setDeletingId(null);
    onRefresh();
  };

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2] border-r border-[#7A1238]/15 text-gray-800 w-full sm:w-80 overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[#7A1238]/10 bg-white/70 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#7A1238] text-white flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-[#F6E2B3]" />
            </div>
            <h4 className="font-bold text-xs font-bangla text-[#2A101A]">
              পূর্ববর্তী চ্যাট থ্রেডস
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`p-1.5 text-gray-400 hover:text-[#7A1238] rounded-lg transition-colors cursor-pointer ${
                isRefreshing ? 'animate-spin text-[#7A1238]' : ''
              }`}
              title="Firestore থেকে রিফ্রেশ করুন"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowPolicy(!showPolicy)}
              className="text-gray-400 hover:text-[#7A1238] p-1.5 rounded-lg transition-colors cursor-pointer"
              title="হিস্টোরি পলিসি জানুন"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="সাইডবার লুকান"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Firestore Database Sync Badge */}
        <div className="flex items-center justify-between text-[10px] font-bangla bg-emerald-50/80 text-emerald-800 px-2.5 py-1.5 rounded-xl border border-emerald-200/80">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="font-bold">Firestore ক্লাউড থ্রেডস</span>
          </div>
          <span className="font-mono text-emerald-700 bg-white px-1.5 py-0.2 rounded border border-emerald-200">
            {conversations.length} টি
          </span>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#7A1238] to-[#BE0750] hover:opacity-95 text-white font-bold text-xs font-bangla flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#F6E2B3]" />
          <span>নতুন চ্যাট শুরু করুন</span>
        </button>
      </div>

      {/* History Retention Policy Modal / Banner */}
      {showPolicy && (
        <div className="p-3 bg-amber-50/90 border-b border-amber-200 text-[11px] font-bangla text-amber-900 space-y-1.5 animate-fade-in shrink-0">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>স্থায়ী কথোপকথন সংরক্ষণ পলিসি</span>
            </span>
            <button onClick={() => setShowPolicy(false)} className="text-gray-500 hover:text-black">✕</button>
          </div>
          <p className="leading-relaxed text-[10px] text-amber-800">
            আপনার চ্যাট থ্রেডগুলো Firestore ডাটাবেসে স্থায়ীভাবে সংরক্ষিত থাকে। পেজ রিফ্রেশ, ডিভাইস পরিবর্তন কিংবা লগআউট করলেও হিস্টোরি অটুট থাকে। গ্রাহক নিজে চাইলে যেকোনো থ্রেড রিনেম, আর্কাইভ বা মুছতে পারবেন।
          </p>
        </div>
      )}

      {/* Search Input & Active/Archive Toggle */}
      <div className="p-2.5 space-y-2 border-b border-gray-100 bg-white/40 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="পূর্ববর্তী থ্রেড খুঁজুন..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:border-[#BE0750] text-gray-700 font-bangla"
          />
          <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bangla font-semibold">
          <button
            onClick={() => setViewTab('active')}
            className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center ${
              viewTab === 'active'
                ? 'bg-[#7A1238] text-white shadow-2xs'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            সক্রিয় ({conversations.filter(c => !c.archived).length})
          </button>
          <button
            onClick={() => setViewTab('archived')}
            className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center ${
              viewTab === 'archived'
                ? 'bg-[#7A1238] text-white shadow-2xs'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            আর্কাইভ ({conversations.filter(c => c.archived).length})
          </button>
        </div>
      </div>

      {/* Conversation Threads List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-400 space-y-2">
            <FolderOpen className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-xs font-bangla font-semibold text-gray-600">কোনো চ্যাট থ্রেড পাওয়া যায়নি</p>
            <p className="text-[10px] text-gray-400 font-bangla max-w-[200px] mx-auto">
              {searchQuery ? 'অন্য কোনো নাম দিয়ে সার্চ করুন' : 'নতুন চ্যাট শুরু করতে ওপরের বাটনে ক্লিক করুন'}
            </p>
          </div>
        ) : (
          filteredConversations.map(conv => {
            const isActive = conv.conversationId === activeConversationId;
            const isEditingThis = editingId === conv.conversationId;
            const isDeletingThis = deletingId === conv.conversationId;

            return (
              <div
                key={conv.conversationId}
                onClick={() => onSelectConversation(conv)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-white border-[#7A1238] shadow-xs ring-1 ring-[#7A1238]/30'
                    : 'bg-white/80 hover:bg-white border-gray-200/80 hover:border-gray-300'
                }`}
              >
                {/* Delete Confirmation Box */}
                {isDeletingThis ? (
                  <div className="p-2 bg-red-50 rounded-xl border border-red-200 space-y-1.5 text-xs font-bangla" onClick={e => e.stopPropagation()}>
                    <p className="text-red-700 font-bold text-[11px]">এই থ্রেডটি Firestore থেকে স্থায়ীভাবে মুছবেন?</p>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] bg-gray-200 text-gray-700 cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={e => handleConfirmDelete(conv.conversationId, e)}
                        className="px-2.5 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold cursor-pointer"
                      >
                        হ্যাঁ, মুছুন
                      </button>
                    </div>
                  </div>
                ) : isEditingThis ? (
                  /* Inline Title Editing */
                  <div className="space-y-1.5" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      autoFocus
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      className="w-full px-2 py-1 text-xs border rounded-lg focus:border-[#BE0750] font-bangla bg-white"
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => handleSaveRename(conv.conversationId, e)}
                        className="p-1 rounded bg-[#7A1238] text-white hover:bg-[#BE0750] cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Thread Card */
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h5 className={`font-bold text-xs font-bangla line-clamp-1 flex-1 ${isActive ? 'text-[#7A1238]' : 'text-gray-900'}`}>
                        {conv.title}
                      </h5>

                      {/* Management Action Buttons on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => handleStartRename(conv, e)}
                          className="p-1 text-gray-400 hover:text-[#7A1238] rounded-md transition-colors cursor-pointer"
                          title="রিনেম করুন"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={e => handleToggleArchive(conv.conversationId, conv.archived, e)}
                          className="p-1 text-gray-400 hover:text-amber-700 rounded-md transition-colors cursor-pointer"
                          title={conv.archived ? 'পুনরুদ্ধার করুন' : 'আর্কাইভ করুন'}
                        >
                          {conv.archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setDeletingId(conv.conversationId);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                          title="স্থায়ীভাবে মুছুন"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {conv.lastMessage && (
                      <p className="text-[11px] text-gray-500 font-bangla line-clamp-1 mt-0.5">
                        {conv.lastMessage}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5 pt-1 border-t border-gray-100 font-bangla">
                      <span>
                        {new Date(conv.updatedAt).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {conv.messageCount !== undefined && conv.messageCount > 0 && (
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-mono">
                          {conv.messageCount} বার্তা
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
