import React, { useState } from 'react';
import { Globe, Terminal, ExternalLink, ShieldAlert, CheckCircle2, Copy } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

interface NetworkGuideProps {
  onCopyText: (text: string, label: string) => void;
}

export const NetworkGuide: React.FC<NetworkGuideProps> = ({ onCopyText }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <section id="network" className="py-16 sm:py-24 bg-[#F8F8F5] border-t border-[#E8E7E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 标题 */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200/50 text-blue-900 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Network Preparation</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            网络环境篇 · Clash Verge 配置指南
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600">
            建议充值前确认好您的网络环境。OpenAI 付款时会依据 IP 地址匹配结算货币与风控，节点越纯净，充值与后续使用越持久。
          </p>
        </div>

        {/* 主体卡片 */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 左侧：工具介绍与操作步骤 */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E7E1] shadow-subtle flex flex-col justify-between">
            <div>
              {/* 工具头部信息 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200/70 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-neutral-900">
                      {SITE_CONFIG.networkTool.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-700">
                      开源跨平台
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {SITE_CONFIG.networkTool.desc}
                  </p>
                </div>

                <a
                  href={SITE_CONFIG.networkTool.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-all shadow-subtle shrink-0"
                >
                  <Terminal className="w-3.5 h-3.5 text-neutral-300" />
                  <span>GitHub 官方发布页</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </div>

              {/* 5 步折叠展开导航 */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  核心使用步骤 (点击切换查看)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SITE_CONFIG.networkTool.steps.map((item) => (
                    <button
                      key={item.step}
                      onClick={() => setActiveStep(item.step)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        activeStep === item.step
                          ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                          : 'bg-neutral-50 border-neutral-200/70 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="text-[10px] opacity-70 font-mono">0{item.step}</div>
                      <div className="text-xs font-semibold truncate mt-0.5">{item.title}</div>
                    </button>
                  ))}
                </div>

                {/* 当前选中步骤的详细指引 */}
                {(() => {
                  const current = SITE_CONFIG.networkTool.steps.find(s => s.step === activeStep);
                  if (!current) return null;
                  return (
                    <div className="mt-5 p-5 rounded-2xl bg-[#F8F8F5] border border-[#E8E7E1] animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-neutral-400">
                          STEP {current.step} OF 5
                        </span>
                        {current.step === 5 && (
                          <button
                            onClick={() => onCopyText(SITE_CONFIG.networkTool.defaultProxyPort, '代理端口')}
                            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline font-mono"
                          >
                            <Copy className="w-3 h-3" />
                            <span>复制默认端口</span>
                          </button>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-neutral-900 mb-1.5">
                        {current.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {current.desc}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 贴心提示 */}
            <div className="mt-8 pt-4 border-t border-neutral-200/70 flex items-start gap-3 text-xs text-neutral-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                如果您对网络配置不熟悉无需担心，在向日葵远程协助连接后，专人客服可协助您免费检测当前节点连通性与 IP 纯净度。
              </span>
            </div>
          </div>

          {/* 右侧：推荐魔法网站卡片 */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            
            <div className="bg-white rounded-3xl p-6 border border-[#E8E7E1] shadow-subtle">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                  订阅节点推荐 (仅供参考)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                  第三方站点
                </span>
              </div>

              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                点击订阅套餐后，在网站仪表盘选择“快速导入 Clash Verge”或直接复制订阅链接即可导入。
              </p>

              <div className="space-y-3">
                {SITE_CONFIG.airports.map((airport, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F8F8F5] border border-[#E8E7E1] hover:border-neutral-400 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-neutral-900">
                        {airport.name}
                      </h4>
                      {airport.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-200/80 text-neutral-700 font-medium">
                          {airport.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 mt-1.5">
                      {airport.desc}
                    </p>
                    {airport.feeNote && (
                      <p className="text-[11px] text-amber-700 font-medium mt-1">
                        {airport.feeNote}
                      </p>
                    )}
                    <a
                      href={airport.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-900 hover:underline"
                    >
                      <span>前往站点注册订阅</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* 风险与免责提示 */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>温馨提示：</strong> 上述魔法网站仅供学习技术与查找资料参考。访问 GitHub 或国外网络服务需自备合规节点，请遵守相关网络法律法规。
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
