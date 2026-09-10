import type { Order, PlanCostConfig, FinanceSummary, ShopSettings } from '../types';
import { SITE_CONFIG } from '../config/siteConfig';

const STORAGE_KEY_ORDERS = 'ai_recharge_orders';
const STORAGE_KEY_COSTS = 'ai_subhub_costs';
const STORAGE_KEY_ADMIN_PWD = 'ai_subhub_admin_pwd';
const STORAGE_KEY_SHOP = 'ai_subhub_shop_settings';

// 默认 12 位高强度管理员密钥
export const DEFAULT_ADMIN_PASSWORD = 'SubHub@2026#Master!';

// 预置默认参考汇率进货成本
export const DEFAULT_PLAN_COSTS: PlanCostConfig[] = [
  { planId: 'gpt-plus', planName: 'GPT Plus', brand: 'openai', sellingPrice: 130, costPrice: 110, enabled: true },
  { planId: 'gpt-pro-5x', planName: 'GPT Pro 5x', brand: 'openai', sellingPrice: 669, costPrice: 580, enabled: true },
  { planId: 'gpt-pro-20x', planName: 'GPT Pro 20x', brand: 'openai', sellingPrice: 1099, costPrice: 920, enabled: true },
  { planId: 'claude-pro', planName: 'Claude Pro', brand: 'claude', sellingPrice: 160, costPrice: 115, enabled: true },
  { planId: 'claude-max-5x', planName: 'Claude Max 5x', brand: 'claude', sellingPrice: 710, costPrice: 600, enabled: true },
  { planId: 'claude-max-20x', planName: 'Claude Max 20x', brand: 'claude', sellingPrice: 1500, costPrice: 1250, enabled: true },
];

/**
 * 订单存取
 */
export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read orders from localStorage:', err);
    return [];
  }
}

export function saveOrderToLocal(order: Order): void {
  try {
    const existing = getLocalOrders();
    const updated = [order, ...existing.filter(o => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }
}

export function searchOrders(keyword: string): Order[] {
  const trimmed = keyword.trim().toLowerCase();
  const all = getLocalOrders();
  if (!trimmed) return all;
  
  return all.filter(order => {
    const idMatch = order.id.toLowerCase().includes(trimmed);
    const contactMatch = order.contactValue.toLowerCase().includes(trimmed);
    const planMatch = order.planName.toLowerCase().includes(trimmed);
    return idMatch || contactMatch || planMatch;
  });
}

export function clearLocalOrders(): void {
  localStorage.removeItem(STORAGE_KEY_ORDERS);
}

/**
 * 管理员密码存取
 */
export function getAdminPassword(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ADMIN_PWD) || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function saveAdminPassword(newPassword: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_PWD, newPassword);
  } catch (err) {
    console.error('Failed to save admin password:', err);
  }
}

/**
 * 成本与定价配置存取
 */
export function getCostConfigs(): PlanCostConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COSTS);
    if (!raw) return DEFAULT_PLAN_COSTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PLAN_COSTS;
  } catch {
    return DEFAULT_PLAN_COSTS;
  }
}

export function saveCostConfigs(configs: PlanCostConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_COSTS, JSON.stringify(configs));
  } catch (err) {
    console.error('Failed to save cost configs:', err);
  }
}

export function resetCostConfigs(): PlanCostConfig[] {
  saveCostConfigs(DEFAULT_PLAN_COSTS);
  return DEFAULT_PLAN_COSTS;
}

/**
 * 财务钱包与利润实时核算引擎
 */
export function calculateFinanceSummary(orders: Order[], costs: PlanCostConfig[]): FinanceSummary {
  const costMap: Record<string, number> = {};
  costs.forEach(c => {
    costMap[c.planId] = c.costPrice;
  });

  let totalRevenue = 0;
  let totalCost = 0;
  let completedOrders = 0;
  let pendingRevenue = 0;

  orders.forEach(order => {
    const price = order.price || 0;
    const cost = costMap[order.planId] !== undefined ? costMap[order.planId] : 0;

    totalRevenue += price;
    totalCost += cost;

    if (order.status === 'completed') {
      completedOrders++;
    } else if (order.status === 'pending') {
      pendingRevenue += price;
    }
  });

  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    netProfit,
    profitMargin: Number(profitMargin.toFixed(1)),
    totalOrders: orders.length,
    completedOrders,
    pendingRevenue,
  };
}

/**
 * 店铺实时运营配置存取
 */
export function getShopSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHOP);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    wechat: SITE_CONFIG.service.wechat,
    wechatName: SITE_CONFIG.service.wechatName,
    alipay: SITE_CONFIG.service.alipay,
    alipayName: SITE_CONFIG.service.alipayName,
    isOnline: true,
  };
}

export function saveShopSettings(settings: ShopSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SHOP, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save shop settings:', err);
  }
}
