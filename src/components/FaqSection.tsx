import React, { useState } from 'react';
import { FAQS } from '../config/faq';
import { ChevronDown, HelpCircle, MessageSquareQuote } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-t border-[#E8E7E1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 标题 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            问答文档篇 · 答疑解惑
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600">
            涵盖充值安全、隐私保护、网络配置与 30 天售后保障的核心问题
          </p>
        </div>

        {/* 手风琴列表 */}
        <div className="mt-12 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#FAF8F5] border-neutral-300 shadow-subtle'
                    : 'bg-white border-[#E8E7E1] hover:border-neutral-300'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-neutral-100 text-neutral-700 font-mono text-xs font-bold flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <span className="font-bold text-sm sm:text-base text-neutral-900">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-neutral-900' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-200/50 pt-4 animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5">
                      <MessageSquareQuote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="whitespace-pre-line space-y-1">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 补充联系提示 */}
        <div className="mt-12 text-center text-xs text-neutral-500">
          仍有其他个性化疑问或需要协助排查网络？欢迎随时在页面右下角点击「联系专人客服」咨询。
        </div>

      </div>
    </section>
  );
};
