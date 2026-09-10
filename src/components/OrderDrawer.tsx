import React, { useState, useEffect } from 'react';
import type { Order } from '../types';
import { getLocalOrders, searchOrders, clearLocalOrders } from '../utils/storage';
import { generateOrderShareText } from '../utils/format';
import { SITE_CONFIG } from '../config/siteConfig';
import { X, Search, Clock, Trash2, Copy, FileText } from 'lucide-react';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyText: (text: string, label: string) => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({ isOpen, onClose, onCopyText }) => {
  const [keyword, setKeyword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  const loadData = () => {
    if (keyword.trim()) {
      setOrders(searchOrders(keyword));
    } else {
      setOrders(getLocalOrders());
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, keyword]);

  if (!isOpen) return null;

  const handleClearAll = () => {
    if (window.confirm('确定要清空本浏览器中保存的全部历史订单记录吗？此操作无法撤销。')) {
      clearLocalOrders();
      setOrders([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-300">
        
        {/* 顶部 Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-neutral-800" />
            <h3 className="text-base font-bold text-neutral-900">
              我的本地订单查询
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索过滤栏 */}
        <div className="p-4 border-b border-neutral-100 bg-[#F8F8F5]">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入单号 (如 ORD...) 或手机号/微信号检索"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            />
          </div>
          <p className="mt-2 text-[11px] text-neutral-400">
            * 订单记录仅保存在您当前设备与浏览器中，保护您的隐私不上传至第三方云端。
          </p>
        </div>

        {/* 订单列表容器 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orders.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <Clock className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-xs font-medium text-neutral-600">
                {keyword ? '未检索到匹配的本地订单' : '暂无任何历史预约记录'}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                选购套餐并提交预约后，将自动在这里展示凭证
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-[#F8F8F5] border border-[#E8E7E1] hover:border-neutral-300 transition-all space-y-2.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">{order.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    待远程充值
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>所选套餐：</span>
                  <span className="font-sans font-bold text-neutral-900">{order.planName}</span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>订单金额：</span>
                  <span className="font-sans font-bold text-emerald-700">￥{order.price} 元</span>
                </div>

                <div className="flex justify-between text-neutral-600 text-[11px]">
                  <span>联系方式：</span>
                  <span>{order.contactValue} ({order.contactType})</span>
                </div>

                <div className="flex justify-between text-neutral-400 text-[10px] border-t border-neutral-200/60 pt-2">
                  <span>{order.createdAt}</span>
                  <span>{order.remoteTool}</span>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => {
                      const text = generateOrderShareText(order, SITE_CONFIG.service.wechat);
                      onCopyText(text, '订单凭证信息');
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 text-[11px] font-sans font-semibold text-neutral-700 flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Copy className="w-3 h-3" />
                    <span>复制订单发客服</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部清空操作 */}
        {orders.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-[#FAF8F5] flex justify-between items-center text-xs">
            <span className="text-neutral-500 font-mono text-[11px]">
              共 {orders.length} 笔订单
            </span>
            <button
              onClick={handleClearAll}
              className="text-neutral-400 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空历史记录</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
