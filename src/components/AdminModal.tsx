import React, { useState, useEffect, useMemo } from 'react';
import type { Order, OrderStatus, PlanCostConfig, ShopSettings } from '../types';
import { decodeOrderNumber } from '../utils/orderCodec';
import type { DecodedOrderInfo } from '../utils/orderCodec';
import {
  getLocalOrders,
  saveOrderToLocal,
  getCostConfigs,
  saveCostConfigs,
  resetCostConfigs,
  calculateFinanceSummary,
  getAdminPassword,
  saveAdminPassword,
  DEFAULT_ADMIN_PASSWORD,
  getShopSettings,
  saveShopSettings,
  clearLocalOrders,
} from '../utils/storage';
import {
  X,
  Lock,
  Key,
  Search,
  AlertCircle,
  Copy,
  Download,
  RefreshCw,
  Wallet,
  TrendingUp,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Trash2,
  Check,
  Store,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyText: (text: string, label: string) => void;
}

type AdminTab = 'wallet' | 'costs' | 'decoder' | 'orders' | 'settings';

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onCopyText }) => {
  // 1. 所有 Hooks 严格置于最顶部，避免任何条件判断或提前 return
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ai_subhub_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('wallet');

  const [orders, setOrders] = useState<Order[]>([]);
  const [costs, setCosts] = useState<PlanCostConfig[]>([]);
  const [shopSettings, setShopSettingsState] = useState<ShopSettings>(getShopSettings());

  const [costInputs, setCostInputs] = useState<Record<string, number>>({});
  const [costSaveTip, setCostSaveTip] = useState<string | null>(null);

  const [searchOrderId, setSearchOrderId] = useState('');
  const [decodedResult, setDecodedResult] = useState<DecodedOrderInfo | null>(null);

  const [orderFilterKeyword, setOrderFilterKeyword] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  const [currentPwdInput, setCurrentPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmPwdInput, setConfirmPwdInput] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const [shopForm, setShopForm] = useState<ShopSettings>(shopSettings);
  const [shopSaveTip, setShopSaveTip] = useState<string | null>(null);

  const refreshAllData = () => {
    const loadedOrders = getLocalOrders();
    setOrders(loadedOrders);

    const loadedCosts = getCostConfigs();
    setCosts(loadedCosts);
    const costMap: Record<string, number> = {};
    loadedCosts.forEach((c) => {
      costMap[c.planId] = c.costPrice;
    });
    setCostInputs(costMap);

    const loadedShop = getShopSettings();
    setShopSettingsState(loadedShop);
    setShopForm(loadedShop);
  };

  useEffect(() => {
    if (isOpen) {
      refreshAllData();
    }
  }, [isOpen, isAuthenticated]);

  const finance = useMemo(() => {
    return calculateFinanceSummary(orders, costs);
  }, [orders, costs]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus = orderStatusFilter === 'all' ? true : order.status === orderStatusFilter;
      const kw = orderFilterKeyword.trim().toLowerCase();
      const matchKw =
        !kw ||
        order.id.toLowerCase().includes(kw) ||
        order.contactValue.toLowerCase().includes(kw) ||
        order.planName.toLowerCase().includes(kw);
      return matchStatus && matchKw;
    });
  }, [orders, orderFilterKeyword, orderStatusFilter]);

  const newPwdStrength = useMemo(() => {
    let score = 0;
    if (newPwdInput.length >= 8) score++;
    if (newPwdInput.length >= 12) score++;
    if (/[A-Z]/.test(newPwdInput) && /[a-z]/.test(newPwdInput)) score++;
    if (/[0-9]/.test(newPwdInput) && /[^A-Za-z0-9]/.test(newPwdInput)) score++;
    return score;
  }, [newPwdInput]);

  // 2. 只有在所有 Hooks 执行完毕后才条件返回！
  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = getAdminPassword();
    if (passwordInput === correctPassword || passwordInput === DEFAULT_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('ai_subhub_admin_auth', 'true');
      } catch {}
      setAuthError('');
      setPasswordInput('');
      refreshAllData();
    } else {
      setAuthError('管理口令不正确！请检查大小写与特殊符号。');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('ai_subhub_admin_auth');
    } catch {}
    setPasswordInput('');
    setAuthError('');
  };

  const handleDecode = (inputCode?: string) => {
    const code = inputCode !== undefined ? inputCode : searchOrderId;
    if (!code.trim()) return;
    const res = decodeOrderNumber(code);
    setDecodedResult(res);
  };

  const handleUpdateStatus = (order: Order, newStatus: OrderStatus) => {
    const updated: Order = { ...order, status: newStatus };
    saveOrderToLocal(updated);
    fetch(`http://localhost:3001/api/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {});
    refreshAllData();
    if (decodedResult && decodedResult.id === order.id) {
      setDecodedResult((prev) => (prev ? { ...prev, fullOrder: updated } : null));
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`确定要删除订单 ${orderId} 吗？`)) {
      const remaining = orders.filter((o) => o.id !== orderId);
      localStorage.setItem('ai_recharge_orders', JSON.stringify(remaining));
      refreshAllData();
      if (decodedResult && decodedResult.id === orderId) {
        setDecodedResult(null);
      }
    }
  };

  const handleClearAllOrders = () => {
    if (window.confirm('⚠️ 警告：此操作将清空本地所有历史订单记录，确定要继续吗？')) {
      clearLocalOrders();
      refreshAllData();
      setDecodedResult(null);
    }
  };

  const handleGenerateReplyText = (info: DecodedOrderInfo) => {
    const tool = info.fullOrder?.remoteTool === 'todesk' ? 'ToDesk' : '向日葵';
    const os = info.fullOrder?.osType === 'macos' ? 'macOS' : 'Windows';
    const text = `【AI 会员代充服务 · 专人接单】
您好！已收到并核对您的预约订单：
- 订单单号：${info.id}
- 订阅套餐：${info.planName} (￥${info.price}元)
- 接入软件：${tool} (${os})
请在电脑打开 ${tool}，并提供识别码与临时验证码，店主将在 3 分钟内为您接入远程直充！
💡 安全承诺：充值账号密码由您亲自在自己屏幕输入，我们全程不看、不记录。`;
    onCopyText(text, '履约标准话术');
  };

  const handleCostInputChange = (planId: string, value: string) => {
    const num = parseFloat(value);
    setCostInputs((prev) => ({
      ...prev,
      [planId]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSaveCosts = () => {
    const updatedCosts: PlanCostConfig[] = costs.map((c) => ({
      ...c,
      costPrice: costInputs[c.planId] !== undefined ? costInputs[c.planId] : c.costPrice,
    }));
    saveCostConfigs(updatedCosts);
    setCosts(updatedCosts);
    fetch('http://localhost:3001/api/costs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCosts),
    }).catch(() => {});
    setCostSaveTip('成本底价已更新，全站历史订单与总利润已同步重算！');
    setTimeout(() => setCostSaveTip(null), 3000);
  };

  const handleResetCosts = () => {
    if (window.confirm('确定要恢复系统默认的海外卡池进货参考底价吗？')) {
      const reset = resetCostConfigs();
      setCosts(reset);
      const costMap: Record<string, number> = {};
      reset.forEach((c) => {
        costMap[c.planId] = c.costPrice;
      });
      setCostInputs(costMap);
      setCostSaveTip('已恢复默认参考进货底价！');
      setTimeout(() => setCostSaveTip(null), 3000);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const currentCorrect = getAdminPassword();
    if (currentPwdInput !== currentCorrect && currentPwdInput !== DEFAULT_ADMIN_PASSWORD) {
      setPwdFeedback({ success: false, msg: '当前原密码不正确，修改失败！' });
      return;
    }
    if (newPwdInput.length < 8) {
      setPwdFeedback({ success: false, msg: '新密码长度至少需要8位以上！' });
      return;
    }
    if (newPwdInput !== confirmPwdInput) {
      setPwdFeedback({ success: false, msg: '两次输入的新密码不一致！' });
      return;
    }
    saveAdminPassword(newPwdInput);
    fetch('http://localhost:3001/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: currentPwdInput, newPassword: newPwdInput }),
    }).catch(() => {});

    setPwdFeedback({ success: true, msg: '高强度管理口令已成功更新！请妥善保存。' });
    setCurrentPwdInput('');
    setNewPwdInput('');
    setConfirmPwdInput('');
  };

  const handleSaveShopSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveShopSettings(shopForm);
    setShopSettingsState(shopForm);
    fetch('http://localhost:3001/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopForm),
    }).catch(() => {});

    setShopSaveTip('店铺客服与运营配置已实时生效！');
    setTimeout(() => setShopSaveTip(null), 3000);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('暂无订单可导出！');
      return;
    }
    const costMap: Record<string, number> = {};
    costs.forEach((c) => {
      costMap[c.planId] = c.costPrice;
    });

    const headers = '订单号,平台品牌,套餐名称,销售金额(元),采购底价(元),单笔净利润(元),利润率(%),联系方式类型,联系账号,远程工具,系统,履约状态,下单时间\n';
    const rows = orders
      .map((o) => {
        const cost = costMap[o.planId] !== undefined ? costMap[o.planId] : 0;
        const profit = (o.price || 0) - cost;
        const margin = o.price > 0 ? ((profit / o.price) * 100).toFixed(1) : '0';
        return `"${o.id}","${o.brand}","${o.planName}","${o.price}","${cost}","${profit}","${margin}%","${o.contactType}","${o.contactValue}","${o.remoteTool}","${o.osType}","${o.status}","${o.createdAt}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI代充财务明细_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden max-h-[94vh] flex flex-col font-sans">
        
        {/* 顶部 Header */}
        <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#E8E7E1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  AI 直充控制台 · 店主财务与运营中心
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-mono font-medium">
                  v2.6 Master
                </span>
                {isAuthenticated && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    <Check className="w-3 h-3" /> 已安全解锁
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500">
                支持钱包大盘核算、进货成本自由录入、订单智能解码、全流程履约管理与高强度安全密钥
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs px-2.5 py-1 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                title="退出当前登录会话"
              >
                退出后台
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 未登录鉴权锁屏 */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
              <Key className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-neutral-900">店主独立身份验证</h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                包含真实营业额、成本底价配置与单单毛利等核心商业数据，请输入高强度管理口令解锁进入控制台
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-3.5 text-left">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="请输入店主管理口令"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white shadow-xs font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="text-xs text-rose-600 font-medium flex items-center gap-1.5 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>安全解锁管理后台</span>
              </button>
            </form>
          </div>
        ) : (
          /* 已登录管理主界面 */
          <div className="flex-1 overflow-hidden flex flex-col bg-[#FAFAFA]">
            
            {/* 顶栏 Tab 导航 */}
            <div className="px-5 pt-3 bg-[#F8F8F5] border-b border-neutral-200 flex items-center justify-between overflow-x-auto gap-2 shrink-0">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`px-3 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
                    activeTab === 'wallet'
                      ? 'bg-white text-neutral-900 border-neutral-900 shadow-xs'
                      : 'text-neutral-500 border-transparent hover:text-neutral-800 hover:bg-neutral-100/70'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-amber-600" />
                  <span>财务钱包</span>
                </button>

                <button
                  onClick={() => setActiveTab('costs')}
                  className={`px-3 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
                    activeTab === 'costs'
                      ? 'bg-white text-neutral-900 border-neutral-900 shadow-xs'
                      : 'text-neutral-500 border-transparent hover:text-neutral-800 hover:bg-neutral-100/70'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>成本与定价设置</span>
                </button>

                <button
                  onClick={() => setActiveTab('decoder')}
                  className={`px-3 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
                    activeTab === 'decoder'
                      ? 'bg-white text-neutral-900 border-neutral-900 shadow-xs'
                      : 'text-neutral-500 border-transparent hover:text-neutral-800 hover:bg-neutral-100/70'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  <span>单号智能解析</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
                    activeTab === 'orders'
                      ? 'bg-white text-neutral-900 border-neutral-900 shadow-xs'
                      : 'text-neutral-500 border-transparent hover:text-neutral-800 hover:bg-neutral-100/70'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>订单管理 ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
                    activeTab === 'settings'
                      ? 'bg-white text-neutral-900 border-neutral-900 shadow-xs'
                      : 'text-neutral-500 border-transparent hover:text-neutral-800 hover:bg-neutral-100/70'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                  <span>安全与店铺</span>
                </button>
              </div>

              {/* 快捷刷新 */}
              <button
                onClick={refreshAllData}
                className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-white rounded-lg transition-colors shrink-0 mb-1"
                title="刷新所有数据"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TAB 内容展示区 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* TAB 1: 财务钱包 */}
              {activeTab === 'wallet' && (
                <div className="space-y-6">
                  {/* 指标卡片组 */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-medium text-neutral-500 flex items-center justify-between">
                        <span>总营业额流水</span>
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
                        ￥{finance.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        共 {finance.totalOrders} 笔订单
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-medium text-neutral-500 flex items-center justify-between">
                        <span>进货卡池成本</span>
                        <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                      <div className="text-xl font-bold font-mono text-neutral-700 mt-1">
                        ￥{finance.totalCost.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        基于自主配置底价
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                      <div className="text-[11px] font-medium text-emerald-800 flex items-center justify-between">
                        <span>净利润 (毛利)</span>
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className={`text-xl font-bold font-mono mt-1 ${finance.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {finance.netProfit >= 0 ? `+￥${finance.netProfit.toLocaleString()}` : `-￥${Math.abs(finance.netProfit).toLocaleString()}`}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                        营收扣除进货底价
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-medium text-neutral-500 flex items-center justify-between">
                        <span>综合利润率</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
                        {finance.profitMargin}%
                      </div>
                      <div className="w-full bg-neutral-100 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, finance.profitMargin))}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs col-span-2 sm:col-span-1">
                      <div className="text-[11px] font-medium text-amber-800 flex items-center justify-between">
                        <span>待履约资金</span>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="text-xl font-bold font-mono text-amber-700 mt-1">
                        ￥{finance.pendingRevenue.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                        待充值订单沉淀
                      </div>
                    </div>
                  </div>

                  {/* 订单单单核算流水明细 */}
                  <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-[#FCFCFA]">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">单单盈亏对账流水明细</h4>
                        <p className="text-[11px] text-neutral-400">
                          基于店主设置的进货成本底价实时核算每笔单据的具体毛利与利润率
                        </p>
                      </div>
                      <button
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>导出对账报表 (CSV)</span>
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-400 space-y-1">
                        <p>暂无成交或预约订单记录</p>
                        <p className="text-[11px]">客户下单后，实时核算结果将在此展示</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto max-h-80">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-neutral-50 text-neutral-500 sticky top-0 border-b border-neutral-200 z-10">
                            <tr>
                              <th className="py-2.5 px-3 font-medium">订单号</th>
                              <th className="py-2.5 px-3 font-medium">套餐名称</th>
                              <th className="py-2.5 px-3 font-medium">售价</th>
                              <th className="py-2.5 px-3 font-medium">进货成本</th>
                              <th className="py-2.5 px-3 font-medium">单笔毛利</th>
                              <th className="py-2.5 px-3 font-medium">毛利率</th>
                              <th className="py-2.5 px-3 font-medium">履约状态</th>
                              <th className="py-2.5 px-3 font-medium">下单时间</th>
                              <th className="py-2.5 px-3 font-medium text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {orders.map((o) => {
                              const costCfg = costs.find((c) => c.planId === o.planId);
                              const cost = costCfg ? costCfg.costPrice : 0;
                              const profit = (o.price || 0) - cost;
                              const margin = o.price > 0 ? ((profit / o.price) * 100).toFixed(1) : '0';

                              return (
                                <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-800">
                                    {o.id}
                                  </td>
                                  <td className="py-2.5 px-3 font-medium text-neutral-900">
                                    {o.planName}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-medium text-neutral-900">
                                    ￥{o.price}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-neutral-500">
                                    ￥{cost}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                                    +￥{profit}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-neutral-600">
                                    {margin}%
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`inline-block px-2 py-0.5 text-[10px] rounded-md font-medium ${
                                        o.status === 'completed'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : o.status === 'processing'
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : o.status === 'cancelled'
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                                      }`}
                                    >
                                      {o.status === 'completed'
                                        ? '已交付'
                                        : o.status === 'processing'
                                        ? '充值中'
                                        : o.status === 'cancelled'
                                        ? '已取消'
                                        : '待处理'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-[11px] text-neutral-400 font-mono">
                                    {o.createdAt ? o.createdAt.slice(5, 16) : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      onClick={() => {
                                        setSearchOrderId(o.id);
                                        handleDecode(o.id);
                                        setActiveTab('decoder');
                                      }}
                                      className="text-xs text-blue-600 hover:underline font-medium"
                                    >
                                      解析
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: 成本与定价设置 */}
              {activeTab === 'costs' && (
                <div className="space-y-6">
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 flex items-start gap-3">
                    <Sliders className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-indigo-950">店主底价自主设置引擎</p>
                      <p className="text-indigo-800 leading-relaxed">
                        您可以在此录入各套餐的卡池采购底价（如海外虚拟信用卡发卡成本与手续费）。
                        系统将基于您在此处填写的数字，<strong>实时重算全站所有历史与未来订单的单笔利润与大盘钱包</strong>。
                        此成本价仅在店主管理端私密可见，前台对客户 100% 隐藏。
                      </p>
                    </div>
                  </div>

                  {costSaveTip && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{costSaveTip}</span>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-200 bg-[#FCFCFA] flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-900">
                        6 大套餐卡池成本配置表
                      </h4>
                      <button
                        type="button"
                        onClick={handleResetCosts}
                        className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>恢复官方推荐底价</span>
                      </button>
                    </div>

                    <div className="divide-y divide-neutral-100">
                      {costs.map((costItem) => {
                        const currentCost = costInputs[costItem.planId] !== undefined ? costInputs[costItem.planId] : costItem.costPrice;
                        const profit = costItem.sellingPrice - currentCost;
                        const margin = costItem.sellingPrice > 0 ? ((profit / costItem.sellingPrice) * 100).toFixed(1) : '0';

                        return (
                          <div
                            key={costItem.planId}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                                  costItem.brand === 'openai' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {costItem.brand === 'openai' ? 'OpenAI' : 'Anthropic'}
                                </span>
                                <span className="text-sm font-bold text-neutral-900">
                                  {costItem.planName}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-500">
                                标牌对外零售价：<strong className="text-neutral-900 font-mono">￥{costItem.sellingPrice}</strong> 元
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-neutral-600 font-medium">
                                  进货成本(元)：
                                </label>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">
                                    ￥
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={costInputs[costItem.planId] !== undefined ? costInputs[costItem.planId] : costItem.costPrice}
                                    onChange={(e) => handleCostInputChange(costItem.planId, e.target.value)}
                                    className="w-24 pl-6 pr-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                  />
                                </div>
                              </div>

                              <div className="text-right min-w-28">
                                <div className="text-xs text-neutral-400">预估单单毛利</div>
                                <div className="text-xs font-bold font-mono text-emerald-600">
                                  +￥{profit} ({margin}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleSaveCosts}
                        className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>保存成本配置并重新计算利润</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 单号智能解析器 */}
              {activeTab === 'decoder' && (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
                    <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                      <span>单号逆向解析器（粘贴任意客户单号）</span>
                      <span className="text-[11px] font-normal text-neutral-400">
                        支持自包含格式 ORD-OAI-PLUS-xxx 与任意历史单号
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={searchOrderId}
                          onChange={(e) => setSearchOrderId(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleDecode()}
                          placeholder="例如：ORD-OAI-PLUS-2609102215-W41-8K9A 或旧单号"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 uppercase"
                        />
                        {searchOrderId && (
                          <button
                            onClick={() => setSearchOrderId('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                          >
                            清空
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDecode()}
                        className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-all shrink-0 flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>秒级解析</span>
                      </button>
                    </div>

                    {orders.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-[11px] text-neutral-400">快速填入最近单号：</span>
                        {orders.slice(0, 3).map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => {
                              setSearchOrderId(o.id);
                              handleDecode(o.id);
                            }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                          >
                            {o.id}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {decodedResult && (
                    <div className="bg-white rounded-xl border border-neutral-300 shadow-sm overflow-hidden animate-in fade-in duration-200">
                      <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#E8E7E1] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            decodedResult.brand === 'openai'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}>
                            {decodedResult.brandName}
                          </span>
                          <h4 className="text-sm font-bold text-neutral-900">
                            {decodedResult.planName}
                          </h4>
                          <span className="text-xs font-mono font-bold text-neutral-900">
                            ￥{decodedResult.price} 元
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {decodedResult.fullOrder && (
                            <select
                              value={decodedResult.fullOrder.status}
                              onChange={(e) => handleUpdateStatus(decodedResult.fullOrder!, e.target.value as OrderStatus)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-neutral-300 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                            >
                              <option value="pending">待处理</option>
                              <option value="processing">充值中</option>
                              <option value="completed">已交付</option>
                              <option value="cancelled">已取消</option>
                            </select>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                            <span className="text-neutral-400 block text-[11px]">订单单号</span>
                            <span className="font-mono font-bold text-neutral-900 break-all select-all">
                              {decodedResult.id}
                            </span>
                          </div>

                          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                            <span className="text-neutral-400 block text-[11px]">下单时间</span>
                            <span className="font-mono text-neutral-800">
                              {decodedResult.orderTimeText}
                            </span>
                          </div>

                          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                            <span className="text-neutral-400 block text-[11px]">客户联系方式</span>
                            <span className="font-mono font-bold text-neutral-900">
                              {decodedResult.contactHint}
                            </span>
                          </div>

                          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                            <span className="text-neutral-400 block text-[11px]">远程工具 / 系统</span>
                            <span className="font-medium text-neutral-800">
                              {decodedResult.fullOrder
                                ? `${decodedResult.fullOrder.remoteTool === 'todesk' ? 'ToDesk' : '向日葵'} (${decodedResult.fullOrder.osType === 'macos' ? 'macOS' : 'Windows'})`
                                : '通用 / 待确认'}
                            </span>
                          </div>
                        </div>

                        {decodedResult.models.length > 0 && (
                          <div>
                            <span className="text-[11px] text-neutral-500 font-medium block mb-1.5">
                              包含最新模型特性支持：
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {decodedResult.models.map((m) => (
                                <span
                                  key={m}
                                  className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-800 font-mono"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-xs text-neutral-500">
                            已核对无误？可一键复制标准回复发微信客户：
                          </span>
                          <button
                            type="button"
                            onClick={() => handleGenerateReplyText(decodedResult)}
                            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>复制履约回复话术</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: 订单管理大盘 */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2 justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={orderFilterKeyword}
                          onChange={(e) => setOrderFilterKeyword(e.target.value)}
                          placeholder="搜索单号、微信号、套餐名..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                        />
                      </div>

                      <div className="flex gap-1">
                        {(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setOrderStatusFilter(st)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                              orderStatusFilter === st
                                ? 'bg-neutral-900 text-white'
                                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            {st === 'all'
                              ? '全部'
                              : st === 'pending'
                              ? '待处理'
                              : st === 'processing'
                              ? '充值中'
                              : st === 'completed'
                              ? '已交付'
                              : '已取消'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs text-neutral-700 font-medium flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>导出</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearAllOrders}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs text-rose-700 font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>清空订单</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
                    {filteredOrders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-400 space-y-1">
                        <p>未找到符合条件的订单</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {filteredOrders.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/60 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-neutral-900">
                                  {order.id}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                  order.brand === 'openai' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                                }`}>
                                  {order.brand === 'openai' ? 'OpenAI' : 'Claude'}
                                </span>
                                <span className="text-xs font-bold text-neutral-800">
                                  {order.planName}
                                </span>
                                <span className="text-xs font-mono font-bold text-neutral-900">
                                  ￥{order.price}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
                                <span>
                                  联系方式：<strong className="text-neutral-800 font-mono">{order.contactValue}</strong> ({order.contactType})
                                </span>
                                <span>
                                  远程：{order.remoteTool === 'todesk' ? 'ToDesk' : '向日葵'} ({order.osType === 'macos' ? 'macOS' : 'Windows'})
                                </span>
                                <span className="font-mono text-[11px] text-neutral-400">
                                  {order.createdAt}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(order, e.target.value as OrderStatus)}
                                className="text-xs px-2.5 py-1 rounded-lg border border-neutral-300 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                              >
                                <option value="pending">待处理</option>
                                <option value="processing">充值中</option>
                                <option value="completed">已交付</option>
                                <option value="cancelled">已取消</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => {
                                  setSearchOrderId(order.id);
                                  handleDecode(order.id);
                                  setActiveTab('decoder');
                                }}
                                className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                              >
                                解码
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                                title="删除该订单"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: 安全与店铺设置 */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-600" />
                      <h4 className="text-xs font-bold text-neutral-900">
                        修改后台独立管理口令
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      建议设置包含大写字母、小写字母、数字及特殊字符（如 @ # $ !）的高强度口令，防止未授权访问。
                    </p>

                    <form onSubmit={handleChangePassword} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                          当前旧密码：
                        </label>
                        <input
                          type="password"
                          value={currentPwdInput}
                          onChange={(e) => setCurrentPwdInput(e.target.value)}
                          placeholder="请输入当前生效的密码"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                          新管理密码：
                        </label>
                        <input
                          type="password"
                          value={newPwdInput}
                          onChange={(e) => setNewPwdInput(e.target.value)}
                          placeholder="新密码（建议 10 位以上混合格式）"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                        {newPwdInput && (
                          <div className="mt-1.5 flex items-center gap-1">
                            <div className={`h-1 flex-1 rounded-full ${newPwdStrength >= 1 ? 'bg-rose-400' : 'bg-neutral-200'}`} />
                            <div className={`h-1 flex-1 rounded-full ${newPwdStrength >= 2 ? 'bg-amber-400' : 'bg-neutral-200'}`} />
                            <div className={`h-1 flex-1 rounded-full ${newPwdStrength >= 3 ? 'bg-blue-400' : 'bg-neutral-200'}`} />
                            <div className={`h-1 flex-1 rounded-full ${newPwdStrength >= 4 ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                            <span className="text-[10px] text-neutral-400 font-mono ml-1">
                              {newPwdStrength <= 1 ? '弱' : newPwdStrength <= 3 ? '中' : '高强度'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                          确认新密码：
                        </label>
                        <input
                          type="password"
                          value={confirmPwdInput}
                          onChange={(e) => setConfirmPwdInput(e.target.value)}
                          placeholder="再次输入新密码"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>

                      {pwdFeedback && (
                        <div
                          className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                            pwdFeedback.success
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {pwdFeedback.success ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                          <span>{pwdFeedback.msg}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        确认更新管理口令
                      </button>
                    </form>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-neutral-900">
                        店铺收款与运营配置
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      在此自定义收银台展示的店主微信号与支付宝账号，支持实时切换店铺接单状态。
                    </p>

                    <form onSubmit={handleSaveShopSettings} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                          客服微信号：
                        </label>
                        <input
                          type="text"
                          value={shopForm.wechat}
                          onChange={(e) => setShopForm({ ...shopForm, wechat: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                          微信收款昵称：
                        </label>
                        <input
                          type="text"
                          value={shopForm.wechatName}
                          onChange={(e) => setShopForm({ ...shopForm, wechatName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                          支付宝账号：
                        </label>
                        <input
                          type="text"
                          value={shopForm.alipay}
                          onChange={(e) => setShopForm({ ...shopForm, alipay: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                          支付宝认证姓名：
                        </label>
                        <input
                          type="text"
                          value={shopForm.alipayName}
                          onChange={(e) => setShopForm({ ...shopForm, alipayName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-xs text-neutral-700 font-medium">
                          店铺接单营业状态：
                        </span>
                        <button
                          type="button"
                          onClick={() => setShopForm({ ...shopForm, isOnline: !shopForm.isOnline })}
                          className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${
                            shopForm.isOnline
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {shopForm.isOnline ? '🟢 正常接单中' : '🟡 暂停接单维护'}
                        </button>
                      </div>

                      {shopSaveTip && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-1.5 animate-in fade-in">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>{shopSaveTip}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        保存店铺与收款配置
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
