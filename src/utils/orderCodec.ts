import type { BrandType, Order } from '../types';
import { PLANS } from '../config/plans';
import { getLocalOrders } from './storage';

export interface DecodedOrderInfo {
  id: string;
  isValidFormat: boolean;
  brand: BrandType;
  brandName: string;
  planId: string;
  planName: string;
  price: number;
  officialPriceUSD: number;
  models: string[];
  orderTimeText: string;
  contactHint: string;
  // 如果在数据库/本地能查到完整实体：
  fullOrder?: Order;
}

const PLAN_CODE_MAP: Record<string, { brand: BrandType; planId: string }> = {
  PLUS: { brand: 'openai', planId: 'gpt-plus' },
  P5X: { brand: 'openai', planId: 'gpt-pro-5x' },
  P20: { brand: 'openai', planId: 'gpt-pro-20x' },
  CPR: { brand: 'claude', planId: 'claude-pro' },
  M5X: { brand: 'claude', planId: 'claude-max-5x' },
  M20: { brand: 'claude', planId: 'claude-max-20x' },
};

const BRAND_CODE_MAP: Record<string, string> = {
  'gpt-plus': 'PLUS',
  'gpt-pro-5x': 'P5X',
  'gpt-pro-20x': 'P20',
  'claude-pro': 'CPR',
  'claude-max-5x': 'M5X',
  'claude-max-20x': 'M20',
};

/**
 * 生成智能自包含可逆向解析的订单单号
 * 格式：ORD-[OAI/CLD]-[PLAN_CODE]-[YYMMDDHHmm]-[CONTACT_SUFFIX]-[RAND]
 * 示例：ORD-OAI-PLUS-2609102215-W41-8K9A
 */
export function generateSmartOrderId(planId: string, brand: BrandType, contactValue: string): string {
  const brandCode = brand === 'openai' ? 'OAI' : 'CLD';
  const planCode = BRAND_CODE_MAP[planId] || 'GEN';
  
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const timeCode = `${yy}${mm}${dd}${hh}${min}`;

  // 联系方式后缀特征（取微信号最后3位作为防伪核对）
  const cleanContact = contactValue.replace(/[^a-zA-Z0-9]/g, '');
  const contactSuffix = cleanContact ? cleanContact.slice(-3).toUpperCase() : 'VIP';

  // 随机校验位
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `ORD-${brandCode}-${planCode}-${timeCode}-${contactSuffix}-${randomChars}`;
}

/**
 * 订单号解析引擎 (无论是否有数据库，均可秒级逆向出全部核心字段)
 */
export function decodeOrderNumber(orderId: string): DecodedOrderInfo {
  const trimmed = orderId.trim().toUpperCase();

  // 1. 优先在本地 localStorage 缓存中检索完整实体
  const allLocal = getLocalOrders();
  const matched = allLocal.find(o => o.id.toUpperCase() === trimmed);

  const parts = trimmed.split('-');
  const isSmart = parts.length >= 6 && parts[0] === 'ORD';

  if (!isSmart) {
    // 降级兼容普通格式单号（如旧单号 ORD-YYYYMMDD-XXXX）
    if (matched) {
      const plan = PLANS.find(p => p.id === matched.planId);
      return {
        id: matched.id,
        isValidFormat: true,
        brand: matched.brand,
        brandName: matched.brand === 'openai' ? 'OpenAI' : 'Anthropic Claude',
        planId: matched.planId,
        planName: matched.planName,
        price: matched.price,
        officialPriceUSD: plan ? plan.officialPriceUSD : 20,
        models: getModelsByPlanId(matched.planId),
        orderTimeText: matched.createdAt,
        contactHint: matched.contactValue,
        fullOrder: matched,
      };
    }

    return {
      id: orderId,
      isValidFormat: false,
      brand: 'openai',
      brandName: '未知平台',
      planId: 'unknown',
      planName: '未识别格式单号',
      price: 0,
      officialPriceUSD: 0,
      models: [],
      orderTimeText: '无法解析时间',
      contactHint: '未知',
    };
  }

  // 2. 自包含算法解码
  const brandCode = parts[1]; // OAI / CLD
  const planCode = parts[2];  // PLUS / P5X / P20 / CPR / M5X / M20
  const timeCode = parts[3];  // YYMMDDHHmm
  const contactSuffix = parts[4]; // 后缀

  const planMapping = PLAN_CODE_MAP[planCode] || {
    brand: brandCode === 'CLD' ? 'claude' : 'openai',
    planId: 'gpt-plus',
  };

  const planConfig = PLANS.find(p => p.id === planMapping.planId);

  // 解析时间
  let parsedTime = '未知时间';
  if (timeCode.length === 10) {
    const y = '20' + timeCode.slice(0, 2);
    const m = timeCode.slice(2, 4);
    const d = timeCode.slice(4, 6);
    const h = timeCode.slice(6, 8);
    const min = timeCode.slice(8, 10);
    parsedTime = `${y}-${m}-${d} ${h}:${min}:00`;
  }

  return {
    id: trimmed,
    isValidFormat: true,
    brand: planMapping.brand,
    brandName: planMapping.brand === 'openai' ? 'OpenAI 官方' : 'Anthropic Claude 官方',
    planId: planMapping.planId,
    planName: planConfig ? planConfig.name : planCode,
    price: planConfig ? planConfig.price : 0,
    officialPriceUSD: planConfig ? planConfig.officialPriceUSD : 20,
    models: getModelsByPlanId(planMapping.planId),
    orderTimeText: matched ? matched.createdAt : parsedTime,
    contactHint: matched ? `${matched.contactValue} (${matched.contactType})` : `后缀: ...${contactSuffix}`,
    fullOrder: matched,
  };
}

function getModelsByPlanId(planId: string): string[] {
  switch (planId) {
    case 'gpt-plus':
    case 'gpt-pro-5x':
    case 'gpt-pro-20x':
      return ['GPT-6-Astra', 'GPT-5.6-Sol', 'GPT-5.6 Terra', 'GPT-5.6-Luna', 'GPT-Image-2.5 (生图)'];
    case 'claude-pro':
      return ['Sonnet 5', 'Opus 5'];
    case 'claude-max-5x':
    case 'claude-max-20x':
      return ['Sonnet 5', 'Opus 5', 'Fable 5 (Max独享)', 'Fable 5.1 (Max独享)'];
    default:
      return [];
  }
}
