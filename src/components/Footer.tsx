import React from 'react';
import { ShieldCheck, ArrowUp, Lock } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* 品牌列 */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest-800 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                AI·SubHub 直充服务站
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
              专注于提供安全、透明、正规的 ChatGPT Plus / Pro 与 Claude Pro / Max 会员代缴直充服务。向日葵与 ToDesk 远程桌面直充，绝不索要账号密码，提供 30 天售后保障。
            </p>
            <div className="text-xs text-neutral-500 font-mono">
              客服微信：{SITE_CONFIG.service.wechat} | 服务时段：{SITE_CONFIG.service.hours}
            </div>
          </div>

          {/* 快捷导航 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-3">
              导航链接
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#plans" className="hover:text-white transition-colors">
                  套餐订阅列表
                </a>
              </li>
              <li>
                <a href="#process" className="hover:text-white transition-colors">
                  远程直充操作流程
                </a>
              </li>
              <li>
                <a href="#network" className="hover:text-white transition-colors">
                  科学网络环境教程 (Clash)
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  常见问题解答 FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* 免责与合规声明 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-3">
              安全与合规声明
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              本站仅提供正规海外信用卡官方账单代缴与远程技术协助，非官方授权代理。所有商标与知识产权归 OpenAI 及 Anthropic 所有。建议用户严格遵守服务条款与国家法律法规。
            </p>
          </div>

        </div>

        {/* 底栏 */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} AI·SubHub. All rights reserved. 隐私零上传</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1 text-neutral-500 hover:text-amber-400 transition-colors ml-2 py-0.5 px-2 rounded bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60"
                title="店主专属后台管理与订单解析控制台"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>商家管理后台</span>
              </button>
            )}
          </div>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span>返回顶部</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
