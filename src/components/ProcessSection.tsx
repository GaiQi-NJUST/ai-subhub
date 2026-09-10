import React from 'react';
import { MousePointerClick, MessageCircle, MonitorCheck, Award, ExternalLink, Download } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: '挑选套餐并在线预约',
      desc: '在上方套餐卡片中选择所需版本，填写联系微信号/手机号，生成唯一防伪预约单号。',
      icon: <MousePointerClick className="w-5 h-5 text-emerald-700" />,
      bg: 'bg-emerald-50'
    },
    {
      num: '02',
      title: '联系客服发送单号凭证',
      desc: '添加专人微信，将生成的预约单号或凭证一键复制发送。客服确认排期后即刻接单。',
      icon: <MessageCircle className="w-5 h-5 text-blue-700" />,
      bg: 'bg-blue-50'
    },
    {
      num: '03',
      title: '建立远程直充 (密码自输)',
      desc: '打开向日葵或 ToDesk 提供识别码。由您在电脑上登录官网，客服仅代点支付与卡号代付，绝不触碰您的密码。',
      icon: <MonitorCheck className="w-5 h-5 text-amber-700" />,
      bg: 'bg-amber-50'
    },
    {
      num: '04',
      title: '开通确认与 30 天质保',
      desc: '充值成功到账即刻主动断开远程桌面。享受 30 天超长售后，有任何使用疑问随时咨询。',
      icon: <Award className="w-5 h-5 text-purple-700" />,
      bg: 'bg-purple-50'
    }
  ];

  return (
    <section id="process" className="py-16 sm:py-24 bg-white border-t border-[#E8E7E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 标题 */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs uppercase font-bold tracking-widest text-neutral-500 bg-neutral-100 inline-block px-3 py-1 rounded-full">
            Standard Procedure
          </h2>
          <p className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            四步规范流程 · 透明可见更放心
          </p>
          <p className="mt-3 text-sm sm:text-base text-neutral-600">
            摒弃暗箱操作，无需将账号密码交予陌生人，向日葵/ToDesk 远程直控，安心充值
          </p>
        </div>

        {/* 步骤流程栅格 */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-3xl bg-[#F8F8F5] border border-[#E8E7E1] hover:border-neutral-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl ${step.bg} flex items-center justify-center`}>
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-black text-neutral-300">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200/50 flex items-center text-[11px] text-neutral-400 font-medium">
                Step {idx + 1} of 4
              </div>
            </div>
          ))}
        </div>

        {/* 远程软件官方下载推荐条 */}
        <div className="mt-12 rounded-3xl bg-[#FAF8F5] border border-[#EAE5DB] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span>准备远程桌面软件 (提前下载，充值更省时)</span>
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600">
                向日葵绿色免安装版打开即可使用，无需繁琐安装流程；ToDesk 同样适用于各类双系统。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {SITE_CONFIG.remoteSoftware.map((soft, idx) => (
                <a
                  key={idx}
                  href={soft.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold border border-neutral-300/80 shadow-subtle transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-600" />
                  <span>{soft.name}</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
