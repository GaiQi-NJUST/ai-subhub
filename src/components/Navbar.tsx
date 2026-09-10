import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Clock, Search, MessageSquare, Menu, X, User, LogOut, PackageCheck, ChevronDown } from 'lucide-react';
import { checkIsServiceOnline } from '../utils/format';
import { SITE_CONFIG } from '../config/siteConfig';
import { formatUserDisplayName } from '../utils/authStorage';
import type { UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenOrderDrawer: () => void;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenOrderDrawer,
  onOpenContact,
}) => {
  const [serviceStatus, setServiceStatus] = useState(checkIsServiceOnline());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setServiceStatus(checkIsServiceOnline());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 点击外部自动收起用户菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = formatUserDisplayName(currentUser);
  const initialChar = displayName ? displayName.charAt(0).toUpperCase() : 'U';

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
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* 查询订单按钮 */}
            <button
              onClick={onOpenOrderDrawer}
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-[#E8E7E1] rounded-xl shadow-subtle transition-all active:scale-95"
              title="根据单号或联系方式查询历史订单"
              aria-label="查询订单"
            >
              <Search className="w-4 h-4 text-neutral-500" />
              <span className="hidden sm:inline">查询订单</span>
            </button>

            {/* 用户登录 / 注册 或 会员胶囊 */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-white hover:bg-neutral-50 border border-[#E8E7E1] rounded-xl shadow-subtle transition-all active:scale-95 text-xs sm:text-sm font-medium text-neutral-800"
                  aria-label="会员中心菜单"
                >
                  <div className="w-6 h-6 rounded-lg bg-forest-900 text-white flex items-center justify-center text-xs font-semibold">
                    {initialChar}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:inline" />
                </button>

                {/* 下拉浮层菜单 */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E7E1] shadow-xl p-2 z-50 animate-scaleUp">
                    <div className="px-3 py-2.5 border-b border-[#E8E7E1]/80 mb-1">
                      <p className="text-[11px] font-mono uppercase text-neutral-400">已登录账号</p>
                      <p className="text-xs font-semibold text-neutral-900 truncate mt-0.5">{currentUser.account}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        {currentUser.id}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenOrderDrawer();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors text-left"
                    >
                      <PackageCheck className="w-4 h-4 text-emerald-600" />
                      <span>我的直充订单</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenContact();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors text-left"
                    >
                      <MessageSquare className="w-4 h-4 text-neutral-500" />
                      <span>联系专属客服</span>
                    </button>

                    <div className="border-t border-[#E8E7E1]/80 my-1" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>退出当前登录</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-[#E8E7E1] rounded-xl shadow-subtle transition-all active:scale-95"
                title="登录或注册会员账号"
                aria-label="登录注册"
              >
                <User className="w-4 h-4 text-neutral-500" />
                <span className="hidden sm:inline">登录 / 注册</span>
              </button>
            )}

            {/* 联系客服按钮 */}
            <button
              onClick={onOpenContact}
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-forest-900 hover:bg-forest-800 rounded-xl shadow-subtle hover:shadow-premium transition-all active:scale-95"
              title="联系在线客服 (微信/支付宝)"
              aria-label="联系客服"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">联系客服</span>
            </button>

            {/* 移动端汉堡折叠按钮 */}
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
          {/* 用户信息卡片 (移动端折叠菜单内) */}
          {currentUser ? (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest-900 text-white flex items-center justify-center text-sm font-semibold">
                  {initialChar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">{displayName}</p>
                  <p className="text-[11px] text-neutral-500">{currentUser.account}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="text-xs text-rose-600 font-medium px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="p-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-forest-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-subtle"
              >
                <User className="w-4 h-4 text-emerald-300" />
                <span>登录 / 注册专属会员账号</span>
              </button>
            </div>
          )}

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

