import React, { useState, useEffect } from 'react';
import type { Plan, Order, UserProfile } from '../types';
import { SITE_CONFIG } from '../config/siteConfig';
import { generateOrderShareText } from '../utils/format';
import { generateSmartOrderId } from '../utils/orderCodec';
import { saveOrderToLocal } from '../utils/storage';
import { updateUserPreferences } from '../utils/authStorage';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, Check, ArrowRight, ArrowLeft, Copy, CheckCircle2, AlertCircle, ZoomIn } from 'lucide-react';

interface CheckoutModalProps {
  plan: Plan | null;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
  onClose: () => void;
  onCopyText: (text: string, label: string) => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  currentUser,
  onOpenAuth,
  onClose,
  onCopyText,
  onOrderSuccess
}) => {
  if (!plan) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [contactType, setContactType] = useState<'wechat' | 'phone' | 'email'>('wechat');
  const [contactValue, setContactValue] = useState(currentUser?.savedContact || '');
  const [remoteTool, setRemoteTool] = useState<'sunlogin' | 'todesk'>(currentUser?.savedRemoteTool || 'sunlogin');
  const [osType, setOsType] = useState<'windows' | 'macos'>(currentUser?.savedOsType || 'windows');
  const [note, setNote] = useState('');
  const [errorTip, setErrorTip] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showQrPreview, setShowQrPreview] = useState(false);

  // 自动带入用户常用偏好
  useEffect(() => {
    if (currentUser) {
      if (currentUser.savedContact && !contactValue) {
        setContactValue(currentUser.savedContact);
      }
      if (currentUser.savedRemoteTool) {
        setRemoteTool(currentUser.savedRemoteTool);
      }
      if (currentUser.savedOsType) {
        setOsType(currentUser.savedOsType);
      }
    }
  }, [currentUser]);

  const handleProceedToPayment = () => {
    if (!contactValue.trim()) {
      setErrorTip('请填写您的联系方式（微信号/手机号），以便客服建立远程直充！');
      return;
    }
    setErrorTip('');
    setStep(2);
  };

  const handleCompletePayment = () => {
    const smartId = generateSmartOrderId(plan.id, plan.brand, contactValue.trim());

    const newOrder: Order = {
      id: smartId,
      planId: plan.id,
      planName: plan.name,
      brand: plan.brand,
      price: plan.price,
      contactType,
      contactValue: contactValue.trim(),
      remoteTool,
      osType,
      note: note.trim(),
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      userId: currentUser?.id,
      userAccount: currentUser?.account,
    };

    saveOrderToLocal(newOrder);

    // 记忆保存该用户的联系与设备偏好
    if (currentUser) {
      updateUserPreferences({
        savedContact: contactValue.trim(),
        savedRemoteTool: remoteTool,
        savedOsType: osType
      });
    }

    setCreatedOrder(newOrder);
    setStep(3);
    onOrderSuccess(newOrder);

    // 异步上报至后端 API (静默处理异常，不阻塞前端体验)
    try {
      fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(() => {});
    } catch {
      // ignore
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const isWechat = paymentMethod === 'wechat';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {showQrPreview && (
        <div
          onClick={() => setShowQrPreview(false)}
          className="fixed inset-0 z-60 bg-black/80 flex flex-col items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={isWechat ? SITE_CONFIG.service.wechatQr : SITE_CONFIG.service.alipayQr}
            alt="收款码大图"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl bg-white p-2"
          />
          <p className="text-neutral-300 text-xs mt-3">点击任意位置关闭大图</p>
        </div>
      )}

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* 顶部 Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E8E7E1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                预约代充收银台
              </h3>
              <p className="text-[11px] text-neutral-500">
                步骤 {step} / 3: {step === 1 ? '确认套餐与联系信息' : step === 2 ? '扫码支付通道' : '预约订单凭证'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 顶部进度条 */}
        <div className="w-full bg-neutral-100 h-1">
          <div
            className="bg-forest-900 h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* 弹窗主体内容滚动区 */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* 套餐简述卡片 */}
          <div className="p-4 rounded-xl bg-[#F8F8F5] border border-[#E8E7E1] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-neutral-900">{plan.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  {plan.brand === 'openai' ? 'OpenAI 官方' : 'Claude 官方'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{plan.quotaInfo}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-extrabold text-neutral-900">
                ￥{plan.price}
              </div>
              <div className="text-[11px] text-neutral-400">官网 ${plan.officialPriceUSD}</div>
            </div>
          </div>

          {/* STEP 1: 填写联系方式与远程要求 */}
          {step === 1 && (
            <div className="space-y-4">
              {currentUser ? (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>已绑定会员账号：<strong>{currentUser.account}</strong></span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                    订单自动归集
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs text-neutral-600">
                  <span className="text-neutral-500">登录专属账号后下单，可自动归集订单并免填设备</span>
                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="text-xs font-semibold text-neutral-900 underline hover:text-emerald-700 ml-2"
                    >
                      去登录
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  联系方式 <span className="text-rose-500">* (必填，客服依此对接)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setContactType('wechat')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      contactType === 'wechat'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    微信号 (推荐)
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactType('phone')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      contactType === 'phone'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    手机号
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactType('email')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      contactType === 'email'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    电子邮箱
                  </button>
                </div>
                <input
                  type="text"
                  value={contactValue}
                  onChange={(e) => {
                    setContactValue(e.target.value);
                    if (errorTip) setErrorTip('');
                  }}
                  placeholder={
                    contactType === 'wechat'
                      ? '请输入您的微信号'
                      : contactType === 'phone'
                      ? '请输入您的手机号码'
                      : '请输入您的接收通知邮箱'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                />
                {errorTip && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorTip}</span>
                  </p>
                )}
              </div>

              {/* 远程软件选择 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    远程协助工具
                  </label>
                  <select
                    value={remoteTool}
                    onChange={(e) => setRemoteTool(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium bg-white"
                  >
                    <option value="sunlogin">向日葵 (推荐免安装版)</option>
                    <option value="todesk">ToDesk 客户端</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    您的操作系统
                  </label>
                  <select
                    value={osType}
                    onChange={(e) => setOsType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium bg-white"
                  >
                    <option value="windows">Windows 系统</option>
                    <option value="macos">macOS 苹果系统</option>
                  </select>
                </div>
              </div>

              {/* 补充备注 */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  补充备注 (选填)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="如：已有账号 / 需要协助测网络等"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs bg-white"
                />
              </div>

              {/* 信任提示 */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-900 leading-relaxed">
                <strong>安全承诺：</strong> 远程直充仅点击升级与结算，密码由您在自己电脑亲自键入，客服绝不索取密码。
              </div>
            </div>
          )}

          {/* STEP 2: 支付结算通道 */}
          {step === 2 && (
            <div className="space-y-4">
              
              {/* 支付 Tab 切换 */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-100">
                <button
                  onClick={() => setPaymentMethod('wechat')}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isWechat
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-neutral-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>微信支付 (推荐)</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('alipay')}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    !isWechat
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-neutral-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>支付宝</span>
                </button>
              </div>

              {/* 收款展示卡片 */}
              <div className="p-4 rounded-xl bg-[#F8F8F5] border border-[#E8E7E1] flex flex-col items-center justify-center text-center">
                <div className="text-xs text-neutral-500">实付应缴金额</div>
                <div className="text-3xl font-mono font-bold text-neutral-900 mt-0.5 mb-3">
                  ￥{plan.price}.00
                </div>

                <div className="relative group cursor-pointer" onClick={() => setShowQrPreview(true)}>
                  <img
                    src={isWechat ? SITE_CONFIG.service.wechatQr : SITE_CONFIG.service.alipayQr}
                    alt={isWechat ? '微信收款码' : '支付宝收款码'}
                    className="w-44 h-56 object-cover rounded-xl border border-neutral-300 shadow-xs group-hover:scale-[1.01] transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1 text-xs text-white font-medium">
                    <ZoomIn className="w-4 h-4" />
                    <span>点击放大</span>
                  </div>
                </div>

                {/* 账号一键复制 */}
                <div className="w-full mt-4 pt-3 border-t border-neutral-200/70">
                  {isWechat ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200 text-xs">
                      <span className="text-neutral-600">
                        客服微信号：<strong>{SITE_CONFIG.service.wechat}</strong> ({SITE_CONFIG.service.wechatName})
                      </span>
                      <button
                        onClick={() => onCopyText(SITE_CONFIG.service.wechat, '客服微信号')}
                        className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制微信号</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200 text-xs">
                      <span className="text-neutral-600">
                        支付宝账号：<strong>{SITE_CONFIG.service.alipay}</strong> ({SITE_CONFIG.service.alipayName})
                      </span>
                      <button
                        onClick={() => onCopyText(SITE_CONFIG.service.alipay, '支付宝账号')}
                        className="text-blue-700 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制账号转账</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 text-center">
                扫码或转账后，请点击下方「我已完成付款」生成专属预约单号
              </p>
            </div>
          )}

          {/* STEP 3: 订单凭证出具 */}
          {step === 3 && createdOrder && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-700 mb-1.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">
                  预约凭证已成功生成！
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  订单已保存在本地浏览器中，可随时在「查询订单」中查看
                </p>
              </div>

              {/* 发票式收据卡片 */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DB] font-mono text-xs text-neutral-700 space-y-2">
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">订单单号</span>
                  <span className="font-bold text-neutral-900">{createdOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">选购套餐</span>
                  <span className="font-bold text-neutral-900">{createdOrder.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">支付总额</span>
                  <span className="font-bold text-emerald-700">￥{createdOrder.price} 元</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">预留联系</span>
                  <span>{createdOrder.contactValue} ({createdOrder.contactType})</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-[11px] text-neutral-400">
                  <span>下单时间</span>
                  <span>{createdOrder.createdAt}</span>
                </div>
              </div>

              {/* 发客服按钮 */}
              <button
                onClick={() => {
                  const text = generateOrderShareText(createdOrder, SITE_CONFIG.service.wechat);
                  onCopyText(text, '订单凭证信息');
                }}
                className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Copy className="w-4 h-4 text-emerald-300" />
                <span>一键复制订单信息 (发给微信客服 February41)</span>
              </button>
            </div>
          )}

        </div>

        {/* 底部按钮栏 */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E8E7E1] flex items-center justify-between">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <span>下一步：选择支付通道</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>返回修改</span>
              </button>
              <button
                type="button"
                onClick={handleCompletePayment}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <span>我已完成付款 · 出具订单凭证</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 3 && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold"
              >
                完成关闭
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
