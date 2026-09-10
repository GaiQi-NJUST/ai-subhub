import { useState } from 'react';
import type { Plan } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PricingSection } from './components/PricingSection';
import { ProcessSection } from './components/ProcessSection';
import { NetworkGuide } from './components/NetworkGuide';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderDrawer } from './components/OrderDrawer';
import { ContactModal } from './components/ContactModal';
import { ContactFloat } from './components/ContactFloat';
import { Toast } from './components/Toast';
import { AdminModal } from './components/AdminModal';

export function App() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const [toastInfo, setToastInfo] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => {
      setToastInfo(prev => ({ ...prev, visible: false }));
    }, 2800);
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(`已成功复制${label}到剪贴板！`, 'success');
    } catch {
      showToast(`复制失败，请手动长按或选中复制`, 'error');
    }
  };

  const handleExplorePlans = () => {
    const el = document.getElementById('plans');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreNetwork = () => {
    const el = document.getElementById('network');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F5] text-[#18181B] relative font-sans selection:bg-emerald-500/20 selection:text-neutral-900">
      
      {/* 全局 Toast */}
      <Toast
        visible={toastInfo.visible}
        message={toastInfo.message}
        type={toastInfo.type}
      />

      {/* 顶部导航 */}
      <Navbar
        onOpenOrderDrawer={() => setOrderDrawerOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
      />

      {/* 核心内容区 */}
      <main className="flex-1">
        <Hero
          onExplorePlans={handleExplorePlans}
          onExploreNetwork={handleExploreNetwork}
        />

        <PricingSection
          onSelectPlan={(plan) => setSelectedPlan(plan)}
        />

        <ProcessSection />

        <NetworkGuide
          onCopyText={handleCopyText}
        />

        <FaqSection />
      </main>

      {/* 页脚 (含店主后台入口) */}
      <Footer onOpenAdmin={() => setAdminModalOpen(true)} />

      {/* 选购收银预约弹窗 */}
      <CheckoutModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onCopyText={handleCopyText}
        onOrderSuccess={(order) => {
          showToast(`恭喜！订单 ${order.id} 预约凭证已生成`, 'success');
        }}
      />

      {/* 本地订单查询抽屉 */}
      <OrderDrawer
        isOpen={orderDrawerOpen}
        onClose={() => setOrderDrawerOpen(false)}
        onCopyText={handleCopyText}
      />

      {/* 联系客服弹窗 */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onCopyText={handleCopyText}
      />

      {/* 商家专属管理与单号解析后台 */}
      {adminModalOpen && (
        <AdminModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          onCopyText={handleCopyText}
        />
      )}

      {/* 悬浮客服按钮 */}
      <ContactFloat
        onOpen={() => setContactModalOpen(true)}
      />
    </div>
  );
}

export default App;
