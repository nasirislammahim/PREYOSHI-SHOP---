import React, { useState } from 'react';
import {
  Bot, Sparkles, Check, Save, RotateCcw, Plus, Trash2, HelpCircle,
  BarChart3, MessageSquare, ShieldCheck, Settings, Power, Clock
} from 'lucide-react';
import { chatService, DEFAULT_AI_SETTINGS } from '../../services/chatService';
import { useStore } from '../../context/StoreContext';

export const AdminAISettings: React.FC = () => {
  const { orders } = useStore();
  const [settings, setSettings] = useState(chatService.getAISettings());
  const [isSaved, setIsSaved] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  const stats = chatService.getConversationStats(orders.length);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    chatService.saveAISettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('আপনি কি AI সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
      setSettings(DEFAULT_AI_SETTINGS);
      chatService.saveAISettings(DEFAULT_AI_SETTINGS);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const newFaq = {
      id: 'faq-' + Date.now(),
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      category: 'general'
    };
    const updated = {
      ...settings,
      faqs: [...settings.faqs, newFaq]
    };
    setSettings(updated);
    chatService.saveAISettings(updated);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const handleDeleteFaq = (faqId: string) => {
    const updated = {
      ...settings,
      faqs: settings.faqs.filter((f: { id: string; question: string; answer: string; category?: string }) => f.id !== faqId)
    };
    setSettings(updated);
    chatService.saveAISettings(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#7A1238] to-[#BE0750] text-[#F6E2B3] flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#2A101A] font-bangla">
              AI শপিং অ্যাসিস্ট্যান্ট সেটিংস ও নিয়ন্ত্রণ
            </h3>
            <p className="text-xs text-gray-500 font-bangla">
              গ্রাহক সহায়তা রোবটের বার্তা, পলিসি ও রিয়েল-টাইম পারফরম্যান্স পরিচালনা করুন
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-bold font-bangla text-gray-700">
            AI অ্যাসিস্ট্যান্ট সক্রিয়:
          </span>
          <button
            type="button"
            onClick={() => {
              const updated = { ...settings, enabled: !settings.enabled };
              setSettings(updated);
              chatService.saveAISettings(updated);
            }}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.enabled ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                settings.enabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 1. Conversation Privacy-Safe Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bangla mb-1">
            <MessageSquare className="w-4 h-4 text-[#7A1238]" />
            <span>মোট কথোপকথন</span>
          </div>
          <p className="text-xl font-black text-gray-900 font-mono">
            {stats.totalConversations}
          </p>
          <span className="text-[10px] text-gray-400 font-bangla">সকল গ্রাহক সেশন</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bangla mb-1">
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>সফল সমাধান হার</span>
          </div>
          <p className="text-xl font-black text-emerald-600 font-mono">
            {stats.aiResolutionRate}
          </p>
          <span className="text-[10px] text-gray-400 font-bangla">স্বয়ংক্রিয় সমাধান</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bangla mb-1">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>মোট বার্তা বিনিময়</span>
          </div>
          <p className="text-xl font-black text-indigo-700 font-mono">
            {stats.totalMessages}
          </p>
          <span className="text-[10px] text-gray-400 font-bangla">গ্রাহক ও AI বার্তা</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bangla mb-1">
            <ShieldCheck className="w-4 h-4 text-[#D9A441]" />
            <span>প্রাইভেসি নিরাপত্তা</span>
          </div>
          <p className="text-sm font-bold text-gray-800 font-bangla mt-1">
            ABAC সুরক্ষিত
          </p>
          <span className="text-[10px] text-gray-400 font-bangla">ব্যক্তিগত বার্তা গোপনীয়</span>
        </div>
      </div>

      {/* 2. Configuration Form */}
      <form onSubmit={handleSave} className="space-y-5 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs">
        {/* Welcome Message */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-800 font-bangla">
            AI স্বাগতম বার্তা (বাংলা):
          </label>
          <textarea
            rows={3}
            value={settings.welcomeMessageBn}
            onChange={e => setSettings({ ...settings, welcomeMessageBn: e.target.value })}
            className="w-full p-3 text-xs border border-gray-200 rounded-2xl focus:border-[#BE0750] font-bangla"
            placeholder="গ্রাহক প্রথম চ্যাট খুললে প্রদর্শিত বার্তা..."
          />
        </div>

        {/* Business Information */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-800 font-bangla">
            ব্যবসার বিবরণ ও ব্র্যান্ড তথ্য (AI জ্ঞানের উৎস):
          </label>
          <textarea
            rows={2}
            value={settings.businessInfoBn}
            onChange={e => setSettings({ ...settings, businessInfoBn: e.target.value })}
            className="w-full p-3 text-xs border border-gray-200 rounded-2xl focus:border-[#BE0750] font-bangla"
            placeholder="দোকানের অবস্থান, পণ্য কালেকশন ও স্পেশালিটি..."
          />
        </div>

        {/* Support Instructions */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-800 font-bangla">
            AI সাপোর্ট আচরণ ও প্রাইসিং নির্দেশনা (System Instructions):
          </label>
          <textarea
            rows={3}
            value={settings.instructions}
            onChange={e => setSettings({ ...settings, instructions: e.target.value })}
            className="w-full p-3 text-xs border border-gray-200 rounded-2xl focus:border-[#BE0750] font-bangla text-gray-700"
            placeholder="AI কীভাবে উত্তর দেবে, ছাড় কীভাবে হিসাব করবে..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 font-bangla flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিসেট</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-xs font-bangla flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4 text-[#D9A441]" />}
            <span>{isSaved ? 'সংরক্ষিত হয়েছে!' : 'সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>

      {/* 3. Frequently Asked Questions (FAQ) Manager */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h4 className="font-bold text-sm text-[#2A101A] font-bangla">
              সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ Management)
            </h4>
            <p className="text-xs text-gray-500 font-bangla">
              এই প্রশ্ন-উত্তরগুলো AI গ্রাহককে তাৎক্ষণিক ও সঠিক উত্তর দিতে ব্যবহার করে
            </p>
          </div>
          <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-lg font-mono font-bold text-gray-700">
            {settings.faqs.length} টি FAQ
          </span>
        </div>

        {/* Existing FAQ List */}
        <div className="space-y-2.5">
          {settings.faqs.map((faq: { id: string; question: string; answer: string; category?: string }) => (
            <div key={faq.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <h5 className="font-bold text-xs text-gray-900 font-bangla flex items-center gap-1.5">
                  <span className="text-[#BE0750]">Q:</span>
                  <span>{faq.question}</span>
                </h5>
                <p className="text-[11px] text-gray-600 font-bangla pl-4 leading-relaxed">
                  <span className="text-emerald-700 font-bold mr-1">Ans:</span>
                  <span>{faq.answer}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteFaq(faq.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                title="FAQ মুছুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New FAQ Row */}
        <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#D9A441]/30 space-y-3">
          <h5 className="font-bold text-xs text-[#7A1238] font-bangla flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>নতুন সাধারণ প্রশ্নোত্তর যুক্ত করুন</span>
          </h5>

          <input
            type="text"
            value={newFaqQuestion}
            onChange={e => setNewFaqQuestion(e.target.value)}
            placeholder="প্রশ্ন লিখুন (যেমন: এক্সচেঞ্জের সময়সীমা কত?)"
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-[#BE0750] font-bangla"
          />

          <textarea
            rows={2}
            value={newFaqAnswer}
            onChange={e => setNewFaqAnswer(e.target.value)}
            placeholder="উত্তর লিখুন..."
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-[#BE0750] font-bangla"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddFaq}
              disabled={!newFaqQuestion.trim() || !newFaqAnswer.trim()}
              className="px-4 py-2 bg-[#7A1238] hover:bg-[#BE0750] disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl text-xs font-bold font-bangla transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>FAQ যুক্ত করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
