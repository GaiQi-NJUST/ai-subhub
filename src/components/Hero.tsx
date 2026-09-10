import React from 'react';
import { ShieldCheck, Video, Lock, Headphones, ArrowRight } from 'lucide-react';

interface HeroProps {
  onExplorePlans: () => void;
  onExploreNetwork: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplorePlans, onExploreNetwork }) => {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-[#F8F8F5]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 顶部标签 */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E7E1] shadow-xs text-xs font-semibold text-neutral-800">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
            <span className="tracking-wide">支持 GPT-6-Astra / GPT-5.6 全系 · Claude Sonnet 5 / Opus 5 / Fable 模型</span>
            <span className="text-neutral-400">|</span>
            <span className="text-emerald-700 font-medium">正规卡池手动直充</span>
          </div>
        </div>

        {/* 主标题与导语 (不做大副标题，将“远程安全直充 · 拒绝账号泄露”置于正文小字强调) */}
        <div className="mt-8 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15]">
            ChatGPT & Claude 会员代充
          </h1>
          
          <p className="mt-5 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
            <span className="font-semibold text-neutral-900">远程安全直充 · 拒绝账号泄露。</span>长期稳定开通，价格透明，下单后快速到账。通过 <strong className="font-semibold text-neutral-900">向日葵 / ToDesk</strong> 远程手动直充至您的官方个人账号。非黑产 Access Token 危险操作，支持全程录屏留存，开通无忧。
          </p>

          {/* CTA 按钮组 */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onExplorePlans}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-sm shadow-sm transition-all active:scale-95 group"
            >
              <span>查看订阅套餐 · 立即预约</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onExploreNetwork}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-sm border border-[#E8E7E1] shadow-xs transition-all active:scale-95"
            >
              <span>配置科学网络环境 (Clash)</span>
            </button>
          </div>
        </div>

        {/* 4 大核心安全信任背书卡片 */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white border border-[#E8E7E1] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              0 密码泄露隐患
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              无需提供密码。仅通过远程协助点击支付按钮，登录及两步验证由您亲自输入。
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8E7E1] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              纯手工直充可录屏
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              绝非黑产 Access Token 逆向滥用。如需成品号亦为本人手工充值并支持录屏验资。
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8E7E1] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              30 天售后质量保证
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              承诺质保 30 天。因支付卡片问题导致的掉订阅全额退换；非频繁换区封号协助申诉。
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8E7E1] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <Headphones className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              一对一远程秒级响应
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              支持 ToDesk 与向日葵免安装版。工作日 19:00～24:00 专人守候，3 分钟极速直充。
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
