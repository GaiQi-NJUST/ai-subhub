import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Search, MessageSquare, Menu, X } from 'lucide-react';
import { checkIsServiceOnline } from '../utils/format';
import { SITE_CONFIG } from '../config/siteConfig';

interface NavbarProps {
  onOpenOrderDrawer: () => void;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOrderDrawer, onOpenContact }) => {
  const [serviceStatus, setServiceStatus] = useState(checkIsServiceOnline());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setServiceStatus(checkIsServiceOnline());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F8F5]/85 backdrop-blur-md border-b border-[#E8E7E1] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo 区域 */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-neutral-900 font-sans">
                    AI·SubHub
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                    正规直充
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-normal tracking-wide hidden sm:block">
                  ChatGPT & Claude 远程直充服务中心
                </p>
              </div>
            </a>
          </div>

          {/* 营业时间指示器 (Wise 风格药丸胶囊) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E7E1] shadow-subtle">
            <div className="relative flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${serviceStatus.isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={`absolute w-3.5 h-3.5 rounded-full ${serviceStatus.isOnline ? 'bg-emerald-400 animate-pulse-glow' : 'bg-amber-400 animate-pulse'}`} />
            </div>
            <span className="text-xs font-medium text-neutral-700">
              {serviceStatus.isOnline ? '客服专人在线 (19:00~24:00)' : '非在线时段 · 预约次日优先安排'}
            </span>
          </div>

          {/* 桌面端导航链接 */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <a href="#plans" className="hover:text-neutral-900 transition-colors">
              套餐订阅
            </a>
            <a href="#process" className="hover:text-neutral-900 transition-colors">
              远程直充流程
            </a>
            <a href="#network" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
              网络环境篇
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200/70 text-neutral-700 font-mono">
                Clash
              </span>
            </a>
            <a href="#faq" className="hover:text-neutral-900 transition-colors">
              常见问答
            </a>
          </nav>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenOrderDrawer}
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-[#E8E7E1] rounded-xl shadow-subtle transition-all active:scale-95"
              title="根据单号或联系方式查询历史订单"
              aria-label="查询订单"
            >
              <Search className="w-4 h-4 text-neutral-500" />
              <span className="hidden sm:inline">查询订单</span>
            </button>

            <button
              onClick={onOpenContact}
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-forest-900 hover:bg-forest-800 rounded-xl shadow-subtle hover:shadow-premium transition-all active:scale-95"
              title="联系在线客服 (微信/支付宝)"
              aria-label="联系客服"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">联系客服</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端抽屉菜单 */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E8E7E1] px-4 pt-3 pb-5 space-y-3 shadow-elevated">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 text-xs text-neutral-600 border border-neutral-200/60">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>服务时间：{SITE_CONFIG.service.hours}（{serviceStatus.tip}）</span>
          </div>
          <div className="flex flex-col space-y-2 pt-1 font-medium text-sm text-neutral-700">
            <a
              href="#plans"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              套餐订阅列表
            </a>
            <a
              href="#process"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              向日葵/ToDesk 远程直充流程
            </a>
            <a
              href="#network"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              网络环境篇 (Clash Verge)
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              常见问题 FAQ
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
