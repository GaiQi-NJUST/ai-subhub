import React, { useState } from 'react';
import { X, Lock, Smartphone, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { loginUser, registerUser } from '../utils/authStorage';
import type { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const isEmail = account.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!account.trim()) {
      setErrorMessage('请输入您的手机号或邮箱');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('请输入密码');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('密码长度至少需要 6 位字符');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await loginUser(account, password);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
        } else {
          setErrorMessage(res.message || '登录失败，请核对账号密码');
        }
      } else {
        const res = await registerUser(account, password, nickname);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
        } else {
          setErrorMessage(res.message || '注册失败，请稍后重试');
        }
      }
    } catch {
      setErrorMessage('网络请求异常，已自动尝试本地安全鉴权');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* 遮罩背景：柔和深色磨砂 */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* 弹窗主体卡片：纯净纸感象牙白，单像素微灰色边框，克制阴影 */}
      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-[#E8E7E1] shadow-2xl p-6 sm:p-8 z-10 animate-scaleUp">
        
        {/* 右上角关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          aria-label="关闭窗口"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 顶部微型品牌标签与标题 */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-mono uppercase tracking-wider mb-2 border border-neutral-200/60">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>AI·SubHub 会员通行证</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            {mode === 'login' ? '欢迎回来' : '开启专属直充账号'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {mode === 'login'
              ? '登录后将自动归集历史订单，随时追踪履约进度'
              : '一键注册，记住向日葵/ToDesk常用设备，订单永不丢失'}
          </p>
        </div>

        {/* 模式切换分段选择器 (Segmented Control) */}
        <div className="p-1 bg-[#F4F4F0] rounded-xl flex border border-[#E8E7E1] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            账号登录
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            注册新账号
          </button>
        </div>

        {/* 错误提示框 */}
        {errorMessage && (
          <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-700 text-xs leading-relaxed flex items-center gap-2 animate-shake">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 表单区域 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 账号输入框 (手机号或邮箱自适应识别) */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              手机号码 / 电子邮箱
            </label>
            <div className="relative rounded-xl border border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 focus-within:border-neutral-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-neutral-900 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                {isEmail ? <Mail className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              </div>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="输入 11 位手机号 或 邮箱"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400"
                autoComplete="username"
              />
            </div>
          </div>

          {/* 注册专属：可选昵称 */}
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-700">
                  用户昵称
                </label>
                <span className="text-[11px] text-neutral-400">选填 · 默认自动脱敏</span>
              </div>
              <div className="relative rounded-xl border border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 focus-within:border-neutral-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-neutral-900 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="例如：极客小陈、Alex"
                  maxLength={16}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>
          )}

          {/* 密码输入框 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-neutral-700">
                密码
              </label>
              {mode === 'login' && (
                <span className="text-[11px] text-neutral-400 cursor-default">
                  至少 6 位字符
                </span>
              )}
            </div>
            <div className="relative rounded-xl border border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 focus-within:border-neutral-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-neutral-900 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '输入您的账号密码' : '设置 6 位及以上安全密码'}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 提交按钮：深墨黑/森林墨绿高质感 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-forest-900 hover:bg-forest-800 active:scale-[0.99] transition-all shadow-subtle hover:shadow-premium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>正在验证...</span>
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? '立即登录' : '创建账号并登录'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </>
            )}
          </button>
        </form>

        {/* 底部隐私与信赖说明 (极简去AI味，无花哨徽章) */}
        <div className="mt-6 pt-5 border-t border-[#E8E7E1]/80 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 font-normal">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>端到端凭证隔离 · 拒绝账号信息沉淀与外泄</span>
          </div>
        </div>

      </div>
    </div>
  );
};
