import React from 'react';
import { SITE_CONFIG } from '../config/siteConfig';
import { X, MessageSquare, Copy, Clock, ShieldCheck } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyText: (text: string, label: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onCopyText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F141C] text-white rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden">
        
        {/* 头部 */}
        <div className="px-6 py-4 bg-[#141B26] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              联系专人代充客服
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 text-center space-y-5">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <span className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              官方直充微信号
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-black text-emerald-400 tracking-wider select-all">
                {SITE_CONFIG.service.wechat}
              </span>
              <span className="text-xs text-neutral-400 font-normal">
                ({SITE_CONFIG.service.wechatName})
              </span>
            </div>
            <button
              onClick={() => onCopyText(SITE_CONFIG.service.wechat, '客服微信号')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>一键复制客服微信号 (February41)</span>
            </button>
          </div>

          <div className="space-y-2.5 text-left text-xs text-neutral-300 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">在线服务时段：</strong> {SITE_CONFIG.service.hours}
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {SITE_CONFIG.service.hoursTip}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-2.5 border-t border-neutral-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">安全须知：</strong> 远程直充全程由您在自己电脑上登录账号，密码由您亲自键入，客服不看、不记录。
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-3 bg-[#141B26] border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700"
          >
            关闭
          </button>
        </div>

      </div>
    </div>
  );
};
