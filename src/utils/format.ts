import type { Order } from '../types';

export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${year}${month}${date}-${randomChars}`;
}

export function checkIsServiceOnline(): { isOnline: boolean; tip: string } {
  const now = new Date();
  const hour = now.getHours();
  const isOnline = hour >= 19 && hour < 24;
  return {
    isOnline,
    tip: isOnline
      ? '客服当前在线 · 极速接单秒回中'
      : '非在线营业时段 · 预约订单次日 19:00 起优先处理'
  };
}

export function generateOrderShareText(order: Order, _wechatId: string): string {
  const remoteSoftwareMap: Record<string, string> = {
    sunlogin: '向日葵远程协助',
    todesk: 'ToDesk 远程协助'
  };

  const contactMap: Record<string, string> = {
    wechat: '微信号',
    phone: '手机号',
    email: '电子邮箱'
  };

  return `【AI代充预约单】
-------------------------
订单编号：${order.id}
所选套餐：${order.planName}
应付金额：￥${order.price} 元
支付通道：${order.paymentMethod === 'wechat' ? '微信支付' : '支付宝'}
联系方式：${contactMap[order.contactType] || '联系人'}：${order.contactValue}
远程软件：${remoteSoftwareMap[order.remoteTool] || '向日葵/ToDesk'} (${order.osType.toUpperCase()})
备注需求：${order.note || '无特殊备注'}
提交时间：${order.createdAt}
-------------------------
您好，我已在官网提交预约并付款，这是我的订单凭证，请查收并安排远程充值！`;
}
