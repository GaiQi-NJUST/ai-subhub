import React, { useState } from 'react';
import type { Plan, BrandType } from '../types';
import { PLANS } from '../config/plans';
import { Check, ArrowRight, Shield, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: Plan) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [activeTab, setActiveTab] = useState<'all' | BrandType>('all');

  const filteredPlans = PLANS.filter(plan => {
    if (activeTab === 'all') return true;
    return plan.brand === activeTab;
  });

  return (
    <section id="plans" className="py-16 sm:py-24 border-t border-[#E8E7E1] bg-[#F8F8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 区域标题 */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            官方正版 · 专人远程直充
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            精选订阅套餐与价格
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-neutral-600">
            价格透明、到账迅速。全部通过向日葵 / ToDesk 远程协助，全程密码亲自输入不泄露
          </p>

          {/* 分类过滤器 Tab (全部 / ChatGPT / Claude) */}
          <div className="mt-7 inline-flex p-1 rounded-xl bg-white border border-[#E8E7E1] shadow-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              全部套餐 (6款)
            </button>
            <button
              onClick={() => setActiveTab('openai')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'openai'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>ChatGPT 专区</span>
            </button>
            <button
              onClick={() => setActiveTab('claude')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'claude'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#D96B43]" />
              <span>Claude 专区</span>
            </button>
          </div>
        </div>

        {/* 纯白质朴清爽卡片栅格 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => {
            const isOpenAI = plan.brand === 'openai';
            
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-7 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  plan.highlight
                    ? 'border-neutral-900 shadow-sm'
                    : 'border-[#E8E7E1] hover:border-neutral-300'
                }`}
              >
                {/* 推荐标识 */}
                {plan.badge && (
                  <div className="absolute -top-3 left-5">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide bg-neutral-900 text-white shadow-xs">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{plan.badge}</span>
                    </span>
                  </div>
                )}

                <div>
                  {/* 卡片头部 */}
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      isOpenAI
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                        : 'bg-amber-50 text-amber-900 border-amber-200/60'
                    }`}>
                      {isOpenAI ? 'OpenAI 官方' : 'Claude 官方'}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                      官网 ${plan.officialPriceUSD}/月
                    </span>
                  </div>

                  {/* 套餐名称与用量 */}
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {plan.quotaInfo}
                    </p>
                    <p className="mt-2 text-xs text-neutral-600 leading-relaxed min-h-[34px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* 价格区域 */}
                  <div className="mt-4 pb-4 border-b border-neutral-100 flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-neutral-900">￥</span>
                    <span className="text-4xl font-extrabold font-mono tracking-tight text-neutral-900">
                      {plan.price}
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">
                      / 月度代充
                    </span>
                  </div>

                  {/* 适用场景 */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-[#F8F8F5] text-[11px] text-neutral-700 leading-normal border border-neutral-200/60">
                    <strong className="text-neutral-900">适合群体：</strong>
                    {plan.suitedFor}
                  </div>

                  {/* 特性列表 */}
                  <ul className="mt-4 space-y-2 text-xs text-neutral-600">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 底部行动按钮 */}
                <div className="mt-6 pt-2">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all bg-forest-900 hover:bg-forest-800 text-white shadow-xs active:scale-[0.98]"
                  >
                    <span>立即预约代充</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[11px] text-center text-neutral-400 mt-2 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3 text-neutral-400" />
                    <span>向日葵/ToDesk 远程直充 · 密码自输</span>
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* 底部备注提示条 */}
        <div className="mt-10 p-4 rounded-xl bg-white border border-[#E8E7E1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600 shadow-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>关于成品号：</strong> 如有成品号需求，亦为本人纯手工官方直充，支持全程开通录屏验资。
            </span>
          </div>
          <div className="text-neutral-500 shrink-0 text-[11px]">
            支持软件：向日葵免安装版 / ToDesk 客户端
          </div>
        </div>

      </div>
    </section>
  );
};
